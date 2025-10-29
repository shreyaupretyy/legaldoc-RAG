"""
Reranking module using cross-encoder for better relevance scoring.
"""

from sentence_transformers import CrossEncoder
from typing import List, Dict, Tuple
import logging
import numpy as np

logger = logging.getLogger(__name__)


class Reranker:
    """
    Reranks retrieved documents using a cross-encoder model
    for more accurate relevance scoring.
    """
    
    def __init__(self, model_name: str = None):
        """
        Initialize reranker.
        
        Args:
            model_name: Name of the cross-encoder model
        """
        from .config import settings
        
        self.model_name = model_name or settings.RERANKER_MODEL
        logger.info(f"Loading reranker model: {self.model_name}")
        self.model = CrossEncoder(self.model_name)
        logger.info("Reranker initialized successfully")
    
    def rerank(
        self, 
        query: str, 
        chunks: List[Dict[str, any]], 
        top_k: int = None
    ) -> List[Dict[str, any]]:
        """
        Rerank chunks based on query relevance.
        
        Args:
            query: Search query
            chunks: List of chunk dictionaries
            top_k: Number of top results to return
            
        Returns:
            List of reranked chunks with scores
        """
        from .config import settings
        
        if not chunks:
            return []
        
        logger.info(f"Reranking {len(chunks)} chunks")
        
        # Prepare pairs for cross-encoder
        pairs = [[query, chunk['text']] for chunk in chunks]
        
        # Get relevance scores (raw cross-encoder logits)
        raw_scores = self.model.predict(pairs, show_progress_bar=False)
        
        # Normalize scores to 0-1 range using sigmoid function
        # This converts raw logits to probabilities
        normalized_scores = 1 / (1 + np.exp(-np.array(raw_scores)))
        
        # Combine chunks with normalized scores
        reranked = []
        for i, chunk in enumerate(chunks):
            reranked.append({
                'chunk': chunk,
                'score': float(normalized_scores[i])
            })
        
        # Sort by score (descending)
        reranked.sort(key=lambda x: x['score'], reverse=True)
        
        # Apply top_k if specified
        if top_k:
            reranked = reranked[:top_k]
        
        logger.info(f"Reranking complete. Top score: {reranked[0]['score']:.4f} (normalized)")
        return reranked

