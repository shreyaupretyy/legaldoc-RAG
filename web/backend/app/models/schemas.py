from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class DocumentMetadata(BaseModel):
    doc_id: str
    filename: str
    page_number: int
    chunk_index: int
    total_chunks: int

class SourceChunk(BaseModel):
    text: str
    metadata: DocumentMetadata
    score: float
    page_number: int

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]
    is_context_based: bool
    conversation_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class DocumentUploadResponse(BaseModel):
    doc_id: str
    filename: str
    status: str
    chunks_created: int
    message: str

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None