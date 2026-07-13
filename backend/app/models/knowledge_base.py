"""
Knowledge Base Model - Articles for AI to reference
"""

import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Boolean, Index

from app.db.database import Base


class ArticleCategory(str, enum.Enum):
    """Knowledge base article categories."""
    SHIPPING = "shipping"
    RETURNS = "returns"
    PRODUCTS = "products"
    PAYMENTS = "payments"
    ACCOUNT = "account"
    TECH_SUPPORT = "tech_support"
    PROMOTIONS = "promotions"
    GENERAL = "general"


class ArticleLanguage(str, enum.Enum):
    """Article language."""
    ARABIC = "ar"
    ENGLISH = "en"


class KnowledgeBaseArticle(Base):
    """FAQ and support articles for AI to search."""
    
    __tablename__ = "knowledge_base"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Content
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(String(500), nullable=True)  # For quick AI reference
    
    # Categorization
    category = Column(Enum(ArticleCategory), nullable=False, index=True)
    language = Column(Enum(ArticleLanguage), default=ArticleLanguage.ARABIC)
    
    # Search optimization
    keywords = Column(String(500), nullable=True)  # Comma-separated for search
    
    # Usage tracking (for improving KB)
    usage_count = Column(Integer, default=0)  # How often AI referenced this
    helpful_count = Column(Integer, default=0)  # Customer marked helpful
    
    # Status
    is_active = Column(Boolean, default=True)
    is_pinned = Column(Boolean, default=False)  # Always include in AI context
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indexes for search performance
    __table_args__ = (
        Index('idx_kb_category_active', 'category', 'is_active'),
        Index('idx_kb_language_category', 'language', 'category'),
    )
    
    def __repr__(self) -> str:
        return f"<KnowledgeBaseArticle(id={self.id}, title='{self.title[:30]}...', category='{self.category.value}')>"
    
    def increment_usage(self) -> None:
        """Track that AI used this article."""
        self.usage_count += 1
    
    def mark_helpful(self) -> None:
        """Customer found this helpful."""
        self.helpful_count += 1
    
    def get_searchable_text(self) -> str:
        """Text for vector search."""
        parts = [self.title, self.content]
        if self.keywords:
            parts.append(self.keywords)
        return " ".join(parts)
