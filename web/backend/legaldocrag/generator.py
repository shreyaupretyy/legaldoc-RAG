"""
Generator module for Claude API-based answer generation.
"""

from anthropic import Anthropic
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


class ClaudeGenerator:
    """
    Generator that uses Claude API for answer generation.
    Provides grounded responses based on retrieved context.
    """
    
    def __init__(self, api_key: str = None, model: str = None):
        """
        Initialize Claude generator.
        
        Args:
            api_key: Anthropic API key
            model: Claude model name
        """
        from .config import settings
        
        self.api_key = api_key or settings.CLAUDE_API_KEY
        self.model = model or settings.CLAUDE_MODEL
        
        self.client = Anthropic(api_key=self.api_key)
        logger.info(f"Initialized ClaudeGenerator with model: {self.model}")
    
    def generate(
        self, 
        question: str, 
        context_chunks: List[Dict[str, any]],
        conversation_history: List[Dict[str, str]] = None
    ) -> Dict[str, any]:
        """
        Generate answer using Claude with context and conversation history.
        
        Args:
            question: User's question
            context_chunks: List of retrieved chunk dictionaries
            conversation_history: Previous messages in the conversation
            
        Returns:
            Dictionary with 'answer' and 'is_context_based' keys
        """
        from .config import settings
        
        logger.info("Generating answer with Claude")
        
        if not context_chunks:
            return {
                'answer': "I don't have enough context to answer this question.",
                'is_context_based': False
            }
        
        # Build context from chunks
        context = "\n\n".join([
            f"[Source {i+1} - Page {chunk['metadata']['page_number']}]:\n{chunk['text']}"
            for i, chunk in enumerate(context_chunks)
        ])
        
        # Create system prompt
        system_prompt = """You are a legal document assistant specialized in the Constitution of Nepal and other legal documents. 

Your responsibilities:
1. Answer questions ONLY based on the provided context from the documents
2. Maintain conversation continuity - refer to previous exchanges when relevant
3. If the answer is not in the context, clearly state: "I cannot answer this question as it is not covered in the available documents."
4. Cite specific page numbers when providing answers
5. Be precise and accurate
6. Do not make assumptions or provide information outside the given context

Always maintain a professional and helpful tone."""

        # Build user prompt with context
        user_prompt = f"""Context from legal documents:

{context}

Question: {question}

Please provide a precise answer based only on the context above. If the context doesn't contain information to answer the question, clearly state that you cannot answer."""

        try:
            # Build messages array with conversation history
            messages = []
            
            # Add conversation history if available (excluding the current question)
            if conversation_history:
                # Filter out the last message since we're adding the current question separately
                history_messages = [msg for msg in conversation_history]
                messages.extend(history_messages)
            
            # Add current question
            messages.append({"role": "user", "content": user_prompt})
            
            # Log conversation context
            logger.info(f"Sending {len(messages)} messages to Claude (including {len(conversation_history or [])} history messages)")
            
            response = self.client.messages.create(
                model=self.model,
                max_tokens=settings.MAX_TOKENS,
                temperature=settings.TEMPERATURE,
                system=system_prompt,
                messages=messages
            )
            
            answer = response.content[0].text
            
            # Check if answer indicates lack of context
            no_context_indicators = [
                "cannot answer",
                "not covered",
                "not mentioned",
                "no information",
                "not in the context"
            ]
            
            is_context_based = not any(indicator in answer.lower() for indicator in no_context_indicators)
            
            logger.info(f"Answer generated successfully (context-based: {is_context_based})")
            
            return {
                'answer': answer,
                'is_context_based': is_context_based
            }
        
        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}")
            raise

