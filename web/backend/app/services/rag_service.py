import uuid
from typing import Dict, List
from legaldocrag.pipeline import RAGPipeline
from app.models.schemas import ChatResponse, SourceChunk, DocumentMetadata
from app.config import settings
from app.utils.logger import setup_logger
import os

logger = setup_logger(__name__)

class RAGService:
    def __init__(self):
        # Use the modular pipeline from legaldocrag
        self.pipeline = RAGPipeline()
    
    def ingest_document(self, pdf_path: str, filename: str) -> Dict[str, any]:
        """Ingest a new PDF document"""
        logger.info(f"Ingesting document: {filename}")
        
        try:
            # Use the pipeline's ingest method
            result = self.pipeline.ingest_document(pdf_path, filename)
            return result
        
        except Exception as e:
            logger.error(f"Error ingesting document: {str(e)}")
            raise
    
    def query(self, question: str, conversation_id: str = None) -> ChatResponse:
        """Process a question and generate answer with sources"""
        logger.info(f"Processing query: {question[:50]}...")
        
        if conversation_id is None:
            conversation_id = str(uuid.uuid4())
        
        try:
            # Use the pipeline's query method
            result = self.pipeline.query(
                question, 
                conversation_id=conversation_id,
                use_reranking=True,
                use_knowledge_expansion=False
            )
            
            # Convert pipeline result to ChatResponse format
            source_chunks = [
                SourceChunk(
                    text=source['text'],
                    metadata=DocumentMetadata(**source['metadata']),
                    score=source['score'],
                    page_number=source['page_number']
                )
                for source in result['sources']
            ]
            
            return ChatResponse(
                answer=result['answer'],
                sources=source_chunks,
                is_context_based=result['is_context_based'],
                conversation_id=result['conversation_id']
            )
        
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            raise
    
    def get_indexed_documents(self) -> List[Dict[str, any]]:
        """Get list of indexed documents"""
        return self.pipeline.get_indexed_documents()