from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API Keys
    CLAUDE_API_KEY: str
    CLAUDE_MODEL: str = "claude-sonnet-4-5-20250929"
    
    # Embedding & Retrieval
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K_RETRIEVAL: int = 5
    CONFIDENCE_THRESHOLD: float = 0.3
    
    # Reranking
    RERANKER_MODEL: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    RERANKER_CONFIDENCE_THRESHOLD: float = 0.5
    
    # Generation
    MAX_TOKENS: int = 2000
    TEMPERATURE: float = 0.2
    
    # Paths
    PDF_STORAGE_PATH: str = "data/pdfs"
    INDEX_STORAGE_PATH: str = "data/index"
    
    # Server
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Create necessary directories
os.makedirs(settings.PDF_STORAGE_PATH, exist_ok=True)
os.makedirs(settings.INDEX_STORAGE_PATH, exist_ok=True)