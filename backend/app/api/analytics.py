"""
Analytics API Endpoints - Dashboard metrics and statistics
"""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.customer import Customer
from app.models.conversation import Conversation, Message
from app.models.knowledge_base import KnowledgeBaseArticle


router = APIRouter(prefix="/api/analytics", tags=["analytics"])


# Response Models
class DashboardStats(BaseModel):
    """Dashboard statistics."""
    total_conversations: int
    total_customers: int
    avg_response_time_ms: float
    ai_confidence_avg: float
    resolved_count: int
    escalated_count: int


class IntentBreakdown(BaseModel):
    """Intent distribution."""
    intent: str
    count: int
    percentage: float


class DailyMetric(BaseModel):
    """Daily metric point."""
    date: str
    conversations: int
    avg_response_time: float


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db)
) -> DashboardStats:
    """Get main dashboard statistics."""
    
    since = datetime.utcnow() - timedelta(days=days)
    
    # Total conversations
    result = await db.execute(
        select(func.count()).select_from(Conversation)
        .where(Conversation.started_at >= since)
    )
    total_conversations = result.scalar() or 0
    
    # Total customers
    result = await db.execute(select(func.count()).select_from(Customer))
    total_customers = result.scalar() or 0
    
    # Average response time
    result = await db.execute(
        select(func.avg(Message.response_time_ms))
        .join(Conversation)
        .where(Conversation.started_at >= since)
        .where(Message.response_time_ms.isnot(None))
    )
    avg_response_time = result.scalar() or 0
    
    # AI confidence average
    result = await db.execute(
        select(func.avg(Message.ai_confidence_score))
        .join(Conversation)
        .where(Conversation.started_at >= since)
        .where(Message.ai_confidence_score.isnot(None))
    )
    ai_confidence = result.scalar() or 0
    
    # Resolved vs escalated
    result = await db.execute(
        select(func.count()).select_from(Conversation)
        .where(Conversation.started_at >= since)
        .where(Conversation.resolved_by_ai == True)
    )
    resolved_count = result.scalar() or 0
    
    result = await db.execute(
        select(func.count()).select_from(Conversation)
        .where(Conversation.started_at >= since)
        .where(Conversation.escalated_to_human == True)
    )
    escalated_count = result.scalar() or 0
    
    return DashboardStats(
        total_conversations=total_conversations,
        total_customers=total_customers,
        avg_response_time_ms=round(avg_response_time, 0),
        ai_confidence_avg=round(ai_confidence, 2),
        resolved_count=resolved_count,
        escalated_count=escalated_count
    )


@router.get("/intents")
async def get_intent_breakdown(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db)
) -> list[IntentBreakdown]:
    """Get conversation intent distribution."""
    
    since = datetime.utcnow() - timedelta(days=days)
    
    result = await db.execute(
        select(
            Conversation.primary_intent,
            func.count().label("count")
        )
        .where(Conversation.started_at >= since)
        .where(Conversation.primary_intent.isnot(None))
        .group_by(Conversation.primary_intent)
        .order_by(desc("count"))
    )
    
    intents = result.all()
    
    # Calculate total for percentages
    total = sum(item.count for item in intents)
    
    breakdown = [
        IntentBreakdown(
            intent=str(item.primary_intent) if item.primary_intent else "unknown",
            count=item.count,
            percentage=round((item.count / total) * 100, 1) if total > 0 else 0
        )
        for item in intents
    ]
    
    return breakdown


@router.get("/daily")
async def get_daily_metrics(
    days: int = Query(30, ge=1, le=90),
    db: AsyncSession = Depends(get_db)
) -> list[DailyMetric]:
    """Get daily conversation metrics."""
    
    since = datetime.utcnow() - timedelta(days=days)
    
    # Query conversations by day
    result = await db.execute(
        select(
            func.date(Conversation.started_at).label("date"),
            func.count().label("conversations"),
            func.avg(Message.response_time_ms).label("avg_response")
        )
        .join(Message, Message.conversation_id == Conversation.id)
        .where(Conversation.started_at >= since)
        .group_by(func.date(Conversation.started_at))
        .order_by("date")
    )
    
    rows = result.all()
    
    return [
        DailyMetric(
            date=str(row.date),
            conversations=row.conversations,
            avg_response_time=round(row.avg_response or 0, 0)
        )
        for row in rows
    ]


@router.get("/popular-kb")
async def get_popular_kb_articles(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
) -> list[dict]:
    """Get most used knowledge base articles."""
    
    result = await db.execute(
        select(KnowledgeBaseArticle)
        .where(KnowledgeBaseArticle.is_active == True)
        .order_by(desc(KnowledgeBaseArticle.usage_count))
        .limit(limit)
    )
    
    articles = result.scalars().all()
    
    return [
        {
            "id": article.id,
            "title": article.title,
            "category": article.category.value if article.category else None,
            "language": article.language.value if article.language else None,
            "usage_count": article.usage_count,
            "helpful_count": article.helpful_count
        }
        for article in articles
    ]
