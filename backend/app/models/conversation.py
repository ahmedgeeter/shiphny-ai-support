"""
Conversation and Message Models - Chat history with AI metadata
"""

import enum
from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, 
    ForeignKey, Enum, Float, Boolean, Index
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class MessageRole(str, enum.Enum):
    """Who sent the message."""
    USER = "user"           # Customer
    ASSISTANT = "assistant"  # AI Bot
    SYSTEM = "system"       # Context/Instructions
    HUMAN_AGENT = "human_agent"  # Human support escalation


class ConversationStatus(str, enum.Enum):
    """Conversation lifecycle."""
    ACTIVE = "active"           # Ongoing chat
    RESOLVED = "resolved"       # Issue solved
    ESCALATED = "escalated"   # Transferred to human
    ABANDONED = "abandoned"   # Customer left


class Intent(str, enum.Enum):
    """AI-classified customer intent (for analytics)."""
    SHIPPING_STATUS = "shipping_status"
    ORDER_INQUIRY = "order_inquiry"
    REFUND_REQUEST = "refund_request"
    PRODUCT_QUESTION = "product_question"
    TECH_SUPPORT = "tech_support"
    COMPLAINT = "complaint"
    FEEDBACK = "feedback"
    GENERAL = "general"


class Sentiment(str, enum.Enum):
    """Customer sentiment analysis."""
    VERY_NEGATIVE = "very_negative"  # Angry, frustrated
    NEGATIVE = "negative"             # Unhappy
    NEUTRAL = "neutral"               # Informational
    POSITIVE = "positive"             # Happy
    VERY_POSITIVE = "very_positive"   # Extremely satisfied


class Conversation(Base):
    """Chat session with a customer."""
    
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    
    # Session info
    session_id = Column(String(50), unique=True, index=True, nullable=False)
    channel = Column(String(20), default="web")  # web, whatsapp, mobile
    
    # Status tracking
    status = Column(Enum(ConversationStatus), default=ConversationStatus.ACTIVE)
    
    # AI Analysis (for analytics dashboard)
    primary_intent = Column(Enum(Intent), nullable=True)
    customer_sentiment = Column(Enum(Sentiment), default=Sentiment.NEUTRAL)
    
    # Performance metrics
    response_time_avg_ms = Column(Float, nullable=True)  # Average response time
    ai_confidence_avg = Column(Float, nullable=True)   # Average AI confidence
    
    # Resolution
    resolved_by_ai = Column(Boolean, default=True)
    escalated_to_human = Column(Boolean, default=False)
    resolution_notes = Column(Text, nullable=True)
    
    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    
    # Relationships
    customer = relationship("Customer", back_populates="conversations")
    messages = relationship(
        "Message", 
        back_populates="conversation", 
        lazy="selectin",
        order_by="Message.created_at"
    )
    
    # Indexes for analytics queries
    __table_args__ = (
        Index('idx_conv_status_started', 'status', 'started_at'),
        Index('idx_conv_customer_started', 'customer_id', 'started_at'),
    )
    
    def __repr__(self) -> str:
        return f"<Conversation(id={self.id}, customer_id={self.customer_id}, status='{self.status.value}')>"
    
    @property
    def duration_minutes(self) -> Optional[float]:
        """Calculate conversation duration."""
        if self.ended_at and self.started_at:
            return (self.ended_at - self.started_at).total_seconds() / 60
        return None
    
    @property
    def message_count(self) -> int:
        """Total messages in conversation."""
        return len(self.messages) if self.messages else 0
    
    def close(self, status: ConversationStatus = ConversationStatus.RESOLVED) -> None:
        """Close the conversation."""
        self.status = status
        self.ended_at = datetime.utcnow()


class Message(Base):
    """Individual chat message with AI metadata."""
    
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(
        Integer, 
        ForeignKey("conversations.id"),
        nullable=False,
        index=True
    )
    
    # Message content
    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    
    # AI-specific metadata (only for assistant messages)
    ai_model_used = Column(String(50), nullable=True)  # e.g., "llama-3.1-70b"
    ai_confidence_score = Column(Float, nullable=True)  # 0.0 - 1.0
    tokens_used = Column(Integer, nullable=True)
    response_time_ms = Column(Float, nullable=True)  # How fast AI responded
    
    # Intent classification (for this specific message)
    detected_intent = Column(Enum(Intent), nullable=True)
    
    # Raw context sent to AI (for debugging/improvement)
    context_sent = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    
    # Index for time-series queries
    __table_args__ = (
        Index('idx_msg_conv_created', 'conversation_id', 'created_at'),
    )
    
    def __repr__(self) -> str:
        content_preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"<Message(id={self.id}, role='{self.role.value}', content='{content_preview}')>"
    
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "role": self.role.value,
            "content": self.content,
            "ai_confidence": self.ai_confidence_score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
