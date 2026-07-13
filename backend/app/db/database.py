"""
SupportBot Pro - Database Configuration
Async SQLAlchemy with connection pooling
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    AsyncEngine,
    create_async_engine,
    async_sessionmaker
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool

from app.core.config import settings

# Base class for models
Base = declarative_base()

# Global engine instance
_engine: AsyncEngine | None = None


def get_engine() -> AsyncEngine:
    """Get or create async database engine."""
    global _engine
    if _engine is None:
        # SQLite doesn't need connection pooling, PostgreSQL does
        if "sqlite" in settings.async_database_url:
            _engine = create_async_engine(
                settings.async_database_url,
                echo=settings.database_echo,
                poolclass=NullPool,  # SQLite doesn't support pooling well
            )
        else:
            _engine = create_async_engine(
                settings.async_database_url,
                echo=settings.database_echo,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True,
            )
    return _engine


# Session factory
AsyncSessionLocal = async_sessionmaker(
    bind=get_engine(),
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncSession:
    """Dependency for FastAPI to get database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database tables."""
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Close database connections."""
    global _engine
    if _engine:
        await _engine.dispose()
        _engine = None
