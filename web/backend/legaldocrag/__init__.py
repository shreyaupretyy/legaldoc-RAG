"""
LegalDocRAG - Modular RAG Pipeline for Legal Documents
Version: 1.0.0
"""

from .config import settings
from .pipeline import RAGPipeline
from .retrieval import HybridRetriever
from .generator import ClaudeGenerator
from .preprocessing import PDFProcessor
from .reranker import Reranker
from .citations import CitationParser
from .corrective import CorrectiveLayer
from .knowledge import KnowledgeExpander

__all__ = [
    "settings",
    "RAGPipeline",
    "HybridRetriever",
    "ClaudeGenerator",
    "PDFProcessor",
    "Reranker",
    "CitationParser",
    "CorrectiveLayer",
    "KnowledgeExpander",
]

__version__ = "1.0.0"

