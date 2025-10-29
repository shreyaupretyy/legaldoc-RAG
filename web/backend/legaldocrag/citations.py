"""
Citation parsing and formatting utilities.
"""

import re
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


class CitationParser:
    """
    Utility class for parsing and formatting citations in generated answers.
    """
    
    @staticmethod
    def extract_citations(text: str) -> List[str]:
        """
        Extract citation references from text.
        
        Args:
            text: Text containing citations
            
        Returns:
            List of citation references
        """
        # Pattern to match citations like [Source 1], [Page 5], etc.
        pattern = r'\[(?:Source|Page)\s+\d+\]'
        citations = re.findall(pattern, text)
        return citations
    
    @staticmethod
    def link_citations(response: str, chunks: List[Dict[str, any]]) -> str:
        """
        Add metadata to citations in the response.
        
        Args:
            response: Generated answer text
            chunks: List of source chunks
            
        Returns:
            Response with enhanced citations
        """
        # For now, just return the response as-is
        # In a more advanced implementation, we could:
        # 1. Parse citation references
        # 2. Link them to specific chunks
        # 3. Add clickable links or tooltips
        return response
    
    @staticmethod
    def format_source_reference(chunk: Dict[str, any]) -> str:
        """
        Format a chunk as a source reference.
        
        Args:
            chunk: Chunk dictionary with metadata
            
        Returns:
            Formatted source reference string
        """
        metadata = chunk.get('metadata', {})
        filename = metadata.get('filename', 'Unknown')
        page = metadata.get('page_number', '?')
        
        return f"[{filename}, Page {page}]"

