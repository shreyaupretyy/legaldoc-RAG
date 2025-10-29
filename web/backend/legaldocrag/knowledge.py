"""
Knowledge expansion module for query enhancement.
"""

from typing import List
import logging

logger = logging.getLogger(__name__)


class KnowledgeExpander:
    """
    Expands queries with related terms and concepts to improve retrieval.
    In a production system, this would connect to a knowledge graph.
    """
    
    def __init__(self):
        """Initialize knowledge expander with predefined expansions"""
        # Simulated knowledge graph for legal terms
        self.legal_terms = {
            "constitution": ["constitutional law", "fundamental rights", "amendments"],
            "rights": ["fundamental rights", "civil rights", "human rights"],
            "parliament": ["legislature", "legislative body", "national assembly"],
            "president": ["head of state", "executive", "presidential powers"],
            "judiciary": ["courts", "judicial system", "supreme court"],
            "amendment": ["constitutional amendment", "modification", "revision"],
            "citizenship": ["nationality", "naturalization", "citizen rights"],
            "federal": ["federalism", "federal structure", "state powers"],
        }
        logger.info("KnowledgeExpander initialized")
    
    def expand_query(self, query: str, entities: List[str] = None) -> str:
        """
        Expand query with related terms.
        
        Args:
            query: Original query
            entities: Optional list of extracted entities
            
        Returns:
            Expanded query string
        """
        query_lower = query.lower()
        expanded_terms = []
        
        # Find matching terms in the query
        for term, expansions in self.legal_terms.items():
            if term in query_lower:
                expanded_terms.extend(expansions[:2])  # Add top 2 related terms
        
        if expanded_terms:
            # Add expanded terms to query
            expanded_query = f"{query} {' '.join(expanded_terms)}"
            logger.info(f"Query expanded with terms: {expanded_terms}")
            return expanded_query
        
        logger.info("No expansion terms found")
        return query
    
    def extract_entities(self, query: str) -> List[str]:
        """
        Simple entity extraction (placeholder).
        
        Args:
            query: Query string
            
        Returns:
            List of extracted entities
        """
        # Simple keyword matching
        entities = []
        for term in self.legal_terms.keys():
            if term in query.lower():
                entities.append(term)
        
        return entities

