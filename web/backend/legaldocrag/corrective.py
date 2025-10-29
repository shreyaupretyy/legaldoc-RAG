"""
Corrective layer for quality checks and hallucination detection.
"""

from typing import Dict
import logging

logger = logging.getLogger(__name__)


class CorrectiveLayer:
    """
    Performs quality checks on generated answers to detect:
    - Hallucinations (information not in context)
    - Inconsistencies
    - Low confidence responses
    """
    
    def __init__(self, generator=None):
        """
        Initialize corrective layer.
        
        Args:
            generator: Optional generator instance for consistency checks
        """
        self.generator = generator
        logger.info("CorrectiveLayer initialized")
    
    def check(self, response: str, context: str) -> Dict[str, any]:
        """
        Check the response for quality issues.
        
        Args:
            response: Generated answer
            context: Source context used for generation
            
        Returns:
            Dictionary with check results
        """
        logger.info("Performing quality check on generated response")
        
        # Simple heuristic checks
        is_consistent = True
        issues = []
        
        # Check 1: Response should not be too short
        if len(response.strip()) < 20:
            is_consistent = False
            issues.append("Response is too short")
        
        # Check 2: Check for common hallucination indicators
        hallucination_phrases = [
            "based on my knowledge",
            "as far as I know",
            "generally speaking",
            "in my experience"
        ]
        
        for phrase in hallucination_phrases:
            if phrase in response.lower():
                is_consistent = False
                issues.append(f"Potential hallucination indicator: '{phrase}'")
        
        # Check 3: Verify context was used
        if context and "cannot answer" not in response.lower():
            # Simple check: at least some words from context should appear in response
            context_words = set(context.lower().split())
            response_words = set(response.lower().split())
            overlap = len(context_words & response_words)
            
            if overlap < 5:
                is_consistent = False
                issues.append("Response may not be grounded in context")
        
        result = {
            "is_consistent": is_consistent,
            "issues": issues,
            "reasoning": "Passed basic quality checks" if is_consistent else "Quality issues detected"
        }
        
        logger.info(f"Quality check complete. Consistent: {is_consistent}")
        return result

