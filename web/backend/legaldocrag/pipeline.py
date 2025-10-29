"""
Main RAG pipeline orchestrating all components.
"""

import uuid
from typing import Dict, List, Optional
import logging

from .retrieval import HybridRetriever
from .generator import ClaudeGenerator
from .preprocessing import PDFProcessor
from .reranker import Reranker
from .citations import CitationParser
from .corrective import CorrectiveLayer
from .knowledge import KnowledgeExpander
from .conversation import ConversationHistory

logger = logging.getLogger(__name__)


class RAGPipeline:
    """
    Main RAG pipeline that orchestrates:
    - PDF processing
    - Hybrid retrieval (BM25 + FAISS)
    - Reranking
    - Answer generation with Claude
    - Quality checks
    - Conversation history management
    """
    
    def __init__(self):
        """Initialize all pipeline components"""
        logger.info("Initializing RAG Pipeline")
        
        # Initialize components
        self.pdf_processor = PDFProcessor()
        self.retriever = HybridRetriever()
        self.reranker = Reranker()
        self.generator = ClaudeGenerator()
        self.citation_parser = CitationParser()
        self.corrective_layer = CorrectiveLayer(self.generator)
        self.knowledge_expander = KnowledgeExpander()
        self.conversation_history = ConversationHistory(max_history_length=10)
        
        # Load existing index if available
        self.retriever.load_index()
        
        logger.info("RAG Pipeline initialized successfully")
    
    def ingest_document(self, pdf_path: str, filename: str) -> Dict[str, any]:
        """
        Ingest a new PDF document into the pipeline.
        
        Args:
            pdf_path: Path to PDF file
            filename: Original filename
            
        Returns:
            Dictionary with ingestion results
        """
        logger.info(f"Ingesting document: {filename}")
        
        try:
            # Process PDF
            doc_id, chunks = self.pdf_processor.process_pdf(pdf_path, filename)
            
            # Add to retriever
            self.retriever.add_documents(chunks)
            
            # Save updated index
            self.retriever.save_index()
            
            result = {
                'doc_id': doc_id,
                'filename': filename,
                'chunks_created': len(chunks),
                'status': 'success'
            }
            
            logger.info(f"Successfully ingested {filename} with {len(chunks)} chunks")
            return result
        
        except Exception as e:
            logger.error(f"Error ingesting document: {str(e)}")
            raise
    
    def query(
        self, 
        question: str, 
        conversation_id: str = None,
        use_reranking: bool = True,
        use_knowledge_expansion: bool = False
    ) -> Dict[str, any]:
        """
        Process a question and generate answer with sources.
        
        Args:
            question: User's question
            conversation_id: Optional conversation ID
            use_reranking: Whether to use reranking
            use_knowledge_expansion: Whether to expand query
            
        Returns:
            Dictionary with answer, sources, and metadata
        """
        from .config import settings
        
        logger.info(f"Processing query: {question[:50]}...")
        
        if conversation_id is None:
            conversation_id = str(uuid.uuid4())
        
        try:
            # Step 0.5: Get conversation history for context-aware retrieval
            history = self.conversation_history.get_history(conversation_id, include_metadata=False)
            logger.info(f"Retrieved {len(history)} messages from conversation history")
            
            # Enhance query with conversation context if needed
            enhanced_query = self._enhance_query_with_context(question, history)
            if enhanced_query != question:
                logger.info(f"✓ Query enhanced from '{question}' to '{enhanced_query[:150]}...'")
            else:
                logger.info(f"Query used as-is: {question}")
            
            # Optional: Expand query with knowledge
            if use_knowledge_expansion:
                entities = self.knowledge_expander.extract_entities(enhanced_query)
                enhanced_query = self.knowledge_expander.expand_query(enhanced_query, entities)
                logger.info(f"Further enhanced with knowledge: {enhanced_query[:50]}...")
            
            # Step 1: Retrieve relevant chunks
            logger.info("Step 1: Retrieving relevant chunks")
            retrieved_results = self.retriever.retrieve(enhanced_query)
            
            if not retrieved_results:
                logger.warning("No documents retrieved")
                return self._create_no_context_response(question, conversation_id)
            
            # Step 2: Optional reranking
            if use_reranking and len(retrieved_results) > 1:
                logger.info("Step 2: Reranking retrieved chunks")
                
                # Extract chunks for reranking
                chunks_to_rerank = [chunk for chunk, score in retrieved_results]
                
                # Rerank
                reranked_results = self.reranker.rerank(
                    question, 
                    chunks_to_rerank,
                    top_k=settings.TOP_K_RETRIEVAL
                )
                
                # Filter by confidence threshold
                filtered_results = [
                    r for r in reranked_results 
                    if r['score'] >= settings.CONFIDENCE_THRESHOLD
                ]
                
                if not filtered_results:
                    logger.warning("No results above confidence threshold after reranking")
                    # If we have conversation history, try to answer from previous context
                    if history and len(history) > 0:
                        logger.info("Attempting to answer from conversation history without new documents")
                        return self._answer_from_history(question, history, conversation_id)
                    return self._create_no_context_response(question, conversation_id)
                
                # Extract chunks and scores
                context_chunks = [r['chunk'] for r in filtered_results]
                chunk_scores = [r['score'] for r in filtered_results]
            else:
                # Use retrieval scores directly
                filtered_results = [
                    (chunk, score) for chunk, score in retrieved_results 
                    if score >= settings.CONFIDENCE_THRESHOLD
                ]
                
                if not filtered_results:
                    logger.warning("No results above confidence threshold")
                    return self._create_no_context_response(question, conversation_id)
                
                context_chunks = [chunk for chunk, score in filtered_results]
                chunk_scores = [score for chunk, score in filtered_results]
            
            # Step 3: Generate answer (history already retrieved)
            logger.info("Step 3: Generating answer with Claude")
            generation_result = self.generator.generate(
                question, 
                context_chunks,
                conversation_history=history
            )
            
            # Step 4: Quality check
            logger.info("Step 4: Running quality checks")
            context_text = "\n\n".join([chunk['text'] for chunk in context_chunks])
            quality_check = self.corrective_layer.check(
                generation_result['answer'],
                context_text
            )
            
            # Step 5: Format sources
            logger.info("Step 5: Formatting sources")
            sources = self._format_sources(context_chunks, chunk_scores)
            
            # Step 6: Save to conversation history
            logger.info("Step 6: Saving to conversation history")
            self.conversation_history.add_message(
                conversation_id,
                'user',
                question
            )
            self.conversation_history.add_message(
                conversation_id,
                'assistant',
                generation_result['answer'],
                metadata={'sources': len(sources)}
            )
            
            # Build response
            response = {
                'success': True,
                'answer': generation_result['answer'],
                'sources': sources,
                'is_context_based': generation_result['is_context_based'],
                'conversation_id': conversation_id,
                'quality_check': quality_check,
                'metadata': {
                    'num_sources': len(sources),
                    'used_reranking': use_reranking,
                    'used_knowledge_expansion': use_knowledge_expansion,
                    'conversation_messages': self.conversation_history.get_message_count(conversation_id)
                }
            }
            
            logger.info("Query processed successfully")
            return response
        
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            raise
    
    def get_indexed_documents(self) -> List[Dict[str, any]]:
        """
        Get list of indexed documents.
        
        Returns:
            List of document metadata
        """
        if not self.retriever.chunks:
            return []
        
        # Extract unique documents
        docs = {}
        for chunk in self.retriever.chunks:
            doc_id = chunk['metadata']['doc_id']
            if doc_id not in docs:
                docs[doc_id] = {
                    'doc_id': doc_id,
                    'filename': chunk['metadata']['filename'],
                    'total_chunks': chunk['metadata']['total_chunks']
                }
        
        return list(docs.values())
    
    def clear_conversation(self, conversation_id: str):
        """
        Clear conversation history for a specific conversation.
        
        Args:
            conversation_id: Unique conversation identifier
        """
        self.conversation_history.clear_conversation(conversation_id)
        logger.info(f"Cleared conversation {conversation_id[:8]}")
    
    def get_conversation_stats(self) -> Dict[str, int]:
        """
        Get statistics about active conversations.
        
        Returns:
            Dictionary with conversation statistics
        """
        return {
            'active_conversations': self.conversation_history.get_conversation_count()
        }
    
    def _answer_from_history(
        self,
        question: str,
        history: List[Dict[str, str]],
        conversation_id: str
    ) -> Dict[str, any]:
        """
        Attempt to answer using conversation history when document retrieval fails.
        This handles follow-up questions like "tell me more" that reference previous responses.
        """
        logger.info("Generating answer from conversation history")
        
        try:
            # Create a prompt that uses the conversation history
            system_prompt = """You are a legal document assistant. The user is asking a follow-up question about a previous topic in the conversation.

Your task:
1. Look at the conversation history to understand what was discussed
2. Answer the follow-up question based on information from previous responses
3. Be honest if you need more specific information
4. Maintain a helpful and professional tone"""

            # Build conversation context
            context_messages = []
            for msg in history:
                context_messages.append({
                    "role": msg['role'],
                    "content": msg['content']
                })
            
            # Add current question
            context_messages.append({
                "role": "user",
                "content": question
            })
            
            # Call Claude
            response = self.generator.client.messages.create(
                model=self.generator.model,
                max_tokens=1024,
                temperature=0.7,
                system=system_prompt,
                messages=context_messages
            )
            
            answer = response.content[0].text
            
            # Save to history
            self.conversation_history.add_message(conversation_id, 'user', question)
            self.conversation_history.add_message(conversation_id, 'assistant', answer, metadata={'from_history': True})
            
            return {
                'success': True,
                'answer': answer,
                'sources': [],
                'is_context_based': False,
                'conversation_id': conversation_id,
                'quality_check': {
                    'is_consistent': True,
                    'issues': [],
                    'reasoning': 'Answered from conversation history'
                },
                'metadata': {
                    'num_sources': 0,
                    'used_reranking': False,
                    'used_knowledge_expansion': False,
                    'from_conversation_history': True
                }
            }
            
        except Exception as e:
            logger.error(f"Error answering from history: {str(e)}")
            return self._create_no_context_response(question, conversation_id)
    
    def _create_no_context_response(
        self, 
        question: str, 
        conversation_id: str
    ) -> Dict[str, any]:
        """Create response when no relevant context is found"""
        return {
            'success': True,
            'answer': "I cannot find relevant information in the available documents to answer your question.",
            'sources': [],
            'is_context_based': False,
            'conversation_id': conversation_id,
            'quality_check': {
                'is_consistent': True,
                'issues': [],
                'reasoning': 'No context available'
            },
            'metadata': {
                'num_sources': 0,
                'used_reranking': False,
                'used_knowledge_expansion': False
            }
        }
    
    def _enhance_query_with_context(
        self, 
        question: str, 
        history: List[Dict[str, str]]
    ) -> str:
        """
        Enhance vague queries using conversation context.
        
        Args:
            question: Current user question
            history: Previous conversation messages
            
        Returns:
            Enhanced query suitable for retrieval
        """
        # If no history or question is already detailed, return as-is
        if not history:
            logger.debug(f"No history available, query unchanged: {question}")
            return question
            
        if len(question.split()) > 8:
            logger.debug(f"Query is detailed enough ({len(question.split())} words), no enhancement needed")
            return question
        
        # Check if question is vague (contains pronouns or references)
        vague_indicators = [
            'it', 'this', 'that', 'these', 'those', 'them',
            'the first', 'the second', 'the last', 'the previous',
            'more', 'details', 'elaborate', 'explain', 'tell me more',
            'what about', 'how about', 'and', 'also'
        ]
        
        question_lower = question.lower()
        is_vague = any(indicator in question_lower for indicator in vague_indicators)
        
        if not is_vague:
            logger.debug(f"Query doesn't contain vague indicators: {question}")
            return question
        
        # Use Claude to rewrite the query with context
        logger.info(f"🔍 Query appears vague (contains indicators), using context to enhance it")
        
        try:
            # Get recent context (last 2 exchanges)
            recent_history = history[-4:] if len(history) > 4 else history
            
            # Format conversation context
            context_text = "\n".join([
                f"{msg['role'].upper()}: {msg['content']}"
                for msg in recent_history
            ])
            
            # Use generator to create a standalone question
            prompt = f"""Given this conversation:

{context_text}

The user's latest question is: "{question}"

Rewrite this question as a clear, standalone question that can be used to search a document database. 
The rewritten question should:
1. Be self-contained (no pronouns or vague references)
2. Include the specific topic from the conversation
3. Be concise but specific
4. Be suitable for semantic search

Rewritten question:"""

            response = self.generator.client.messages.create(
                model=self.generator.model,
                max_tokens=150,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}]
            )
            
            enhanced = response.content[0].text.strip()
            
            # Remove quotes if present
            enhanced = enhanced.strip('"').strip("'")
            
            logger.info(f"Query enhanced from '{question}' to '{enhanced}'")
            return enhanced
            
        except Exception as e:
            logger.error(f"Error enhancing query: {str(e)}")
            # Fallback: combine question with last user message
            if history:
                last_user_msg = next((msg['content'] for msg in reversed(history) if msg['role'] == 'user'), None)
                if last_user_msg:
                    return f"{last_user_msg} {question}"
            return question
    
    def _format_sources(
        self, 
        chunks: List[Dict[str, any]], 
        scores: List[float]
    ) -> List[Dict[str, any]]:
        """Format chunks into source objects"""
        sources = []
        
        for chunk, score in zip(chunks, scores):
            sources.append({
                'text': chunk['text'],
                'metadata': chunk['metadata'],
                'score': round(float(score), 3),
                'page_number': chunk['metadata']['page_number']
            })
        
        return sources

