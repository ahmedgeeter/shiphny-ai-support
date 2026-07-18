"""
SupportBot Pro - Database Configuration
Async SQLAlchemy - lazy initialization for Render/cloud compatibility
"""

import os
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

# Global instances — created lazily on first use, NOT at import time
_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker | None = None


def _ensure_sqlite_dir(url: str) -> None:
    """Create parent directory for SQLite file if it doesn't exist."""
    if "sqlite" not in url:
        return
    # Handle 4-slash absolute path: sqlite+aiosqlite:////tmp/foo.db
    if "////" in url:
        path = "/" + url.split("////")[-1]
    elif "///" in url:
        # Relative path: sqlite+aiosqlite:///./foo.db  -> skip (current dir)
        path = url.split("///")[-1]
        if path.startswith("."):
            return  # relative path — let sqlite handle it
        path = "/" + path
    else:
        return
    parent = os.path.dirname(path)
    if parent and parent != "/":
        os.makedirs(parent, exist_ok=True)


def get_engine() -> AsyncEngine:
    """Get or create async database engine (lazy)."""
    global _engine
    if _engine is None:
        db_url = settings.async_database_url
        _ensure_sqlite_dir(db_url)
        if "sqlite" in db_url:
            _engine = create_async_engine(
                db_url,
                echo=settings.database_echo,
                poolclass=NullPool,
            )
        else:
            _engine = create_async_engine(
                db_url,
                echo=settings.database_echo,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True,
            )
    return _engine


def get_session_factory() -> async_sessionmaker:
    """Get or create session factory (lazy)."""
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            bind=get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
    return _session_factory


# AsyncSessionLocal is now a callable that returns the factory.
# This keeps backward compatibility: AsyncSessionLocal() still works.
class _LazySessionLocal:
    """Proxy that lazily creates the session factory on first call."""
    def __call__(self):
        return get_session_factory()()

    def __enter__(self):
        raise RuntimeError("Use 'async with AsyncSessionLocal() as session'")

    async def __aenter__(self):
        raise RuntimeError("Use 'async with AsyncSessionLocal() as session'")


AsyncSessionLocal = get_session_factory  # simple callable alias


async def get_db():
    """FastAPI dependency: yields a database session."""
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Create all database tables on startup."""
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Dispose engine on shutdown."""
    global _engine, _session_factory
    if _engine:
        await _engine.dispose()
        _engine = None
    _session_factory = None
