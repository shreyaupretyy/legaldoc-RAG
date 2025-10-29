"""
Conversation history management for maintaining chat context.
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class ConversationHistory:
    """
    Manages conversation history for multi-turn conversations.
    Stores message history per conversation ID.
    """
    
    def __init__(self, max_history_length: int = 10, history_ttl_hours: int = 24):
        """
        Initialize conversation history manager.
        
        Args:
            max_history_length: Maximum number of message pairs to keep
            history_ttl_hours: Hours before conversation expires
        """
        self.conversations: Dict[str, Dict] = {}
        self.max_history_length = max_history_length
        self.history_ttl = timedelta(hours=history_ttl_hours)
        logger.info(f"Initialized ConversationHistory (max_length={max_history_length}, ttl={history_ttl_hours}h)")
    
    def add_message(
        self, 
        conversation_id: str, 
        role: str, 
        content: str,
        metadata: Optional[Dict] = None
    ):
        """
        Add a message to conversation history.
        
        Args:
            conversation_id: Unique conversation identifier
            role: Message role ('user' or 'assistant')
            content: Message content
            metadata: Optional metadata (sources, etc.)
        """
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = {
                'messages': [],
                'created_at': datetime.now(),
                'last_updated': datetime.now()
            }
        
        # Add message
        self.conversations[conversation_id]['messages'].append({
            'role': role,
            'content': content,
            'metadata': metadata or {},
            'timestamp': datetime.now()
        })
        
        # Update timestamp
        self.conversations[conversation_id]['last_updated'] = datetime.now()
        
        # Trim if exceeds max length (keep most recent messages)
        messages = self.conversations[conversation_id]['messages']
        if len(messages) > self.max_history_length * 2:  # *2 for user+assistant pairs
            # Keep the most recent messages
            self.conversations[conversation_id]['messages'] = messages[-(self.max_history_length * 2):]
            logger.info(f"Trimmed conversation {conversation_id[:8]} to {self.max_history_length} pairs")
        
        logger.debug(f"Added {role} message to conversation {conversation_id[:8]}")
    
    def get_history(self, conversation_id: str, include_metadata: bool = False) -> List[Dict]:
        """
        Get conversation history for Claude API.
        
        Args:
            conversation_id: Unique conversation identifier
            include_metadata: Whether to include metadata in history
            
        Returns:
            List of message dictionaries suitable for Claude API
        """
        # Clean expired conversations first
        self._clean_expired()
        
        if conversation_id not in self.conversations:
            return []
        
        messages = self.conversations[conversation_id]['messages']
        
        if include_metadata:
            return messages
        
        # Return only role and content (Claude API format)
        return [
            {'role': msg['role'], 'content': msg['content']}
            for msg in messages
        ]
    
    def get_recent_context(self, conversation_id: str, num_turns: int = 3) -> str:
        """
        Get recent conversation context as a formatted string.
        
        Args:
            conversation_id: Unique conversation identifier
            num_turns: Number of recent turns (user+assistant pairs) to include
            
        Returns:
            Formatted conversation context string
        """
        messages = self.get_history(conversation_id, include_metadata=False)
        
        if not messages:
            return ""
        
        # Get last N turns (each turn = user + assistant pair)
        recent_messages = messages[-(num_turns * 2):]
        
        context_parts = []
        for msg in recent_messages:
            role = "User" if msg['role'] == 'user' else "Assistant"
            context_parts.append(f"{role}: {msg['content'][:200]}...")  # Truncate long messages
        
        return "\n".join(context_parts)
    
    def clear_conversation(self, conversation_id: str):
        """
        Clear a specific conversation history.
        
        Args:
            conversation_id: Unique conversation identifier
        """
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
            logger.info(f"Cleared conversation {conversation_id[:8]}")
    
    def _clean_expired(self):
        """Remove expired conversations based on TTL"""
        now = datetime.now()
        expired = [
            conv_id for conv_id, data in self.conversations.items()
            if now - data['last_updated'] > self.history_ttl
        ]
        
        for conv_id in expired:
            del self.conversations[conv_id]
            logger.info(f"Removed expired conversation {conv_id[:8]}")
        
        if expired:
            logger.info(f"Cleaned {len(expired)} expired conversations")
    
    def get_conversation_count(self) -> int:
        """Get number of active conversations"""
        self._clean_expired()
        return len(self.conversations)
    
    def get_message_count(self, conversation_id: str) -> int:
        """Get number of messages in a conversation"""
        if conversation_id not in self.conversations:
            return 0
        return len(self.conversations[conversation_id]['messages'])

