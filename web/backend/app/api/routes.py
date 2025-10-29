from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List
import aiofiles
import os
from app.models.schemas import (
    ChatRequest, ChatResponse, DocumentUploadResponse, ErrorResponse
)
from app.services.rag_service import RAGService
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()

# Singleton RAG service
rag_service = RAGService()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handle chat queries"""
    try:
        logger.info(f"Received chat request: {request.question[:50]}...")
        response = rag_service.query(request.question, request.conversation_id)
        return response
    
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and ingest a PDF document"""
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        logger.info(f"Uploading file: {file.filename}")
        
        # Save file
        file_path = os.path.join(settings.PDF_STORAGE_PATH, file.filename)
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Ingest document
        result = rag_service.ingest_document(file_path, file.filename)
        
        return DocumentUploadResponse(
            doc_id=result['doc_id'],
            filename=result['filename'],
            status='success',
            chunks_created=result['chunks_created'],
            message=f"Successfully ingested {file.filename}"
        )
    
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents")
async def get_documents():
    """Get list of indexed documents"""
    try:
        documents = rag_service.get_indexed_documents()
        return {"documents": documents}
    
    except Exception as e:
        logger.error(f"Error fetching documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "LegalDocRAG"}