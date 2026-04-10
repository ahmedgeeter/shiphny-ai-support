"""
SupportBot Pro - Main Application Entry Point
FastAPI backend for AI customer support system
"""

# Load .env before any imports that use settings
from dotenv import load_dotenv
load_dotenv()

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import init_db, close_db
from app.api import chat_router, analytics_router, customers_router, bookings_router
from app.api.chat_debug import router as debug_router

# Import all models so SQLAlchemy registers them with Base.metadata before create_all
import app.models.customer       # noqa: F401
import app.models.conversation   # noqa: F401
import app.models.knowledge_base # noqa: F401
import app.models.booking        # noqa: F401

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered customer support system with real-time chat",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    await init_db()

    import sys
    sys.stdout.buffer.write(f"[OK] {settings.app_name} v{settings.app_version} started\n".encode('utf-8'))
    sys.stdout.flush()


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    await close_db()
    print(f"[BYE] {settings.app_name} shutting down")


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "debug": settings.debug,
    }


@app.get("/api/ping")
async def ping():
    """Ultra-lightweight keep-alive endpoint — no DB, instant response."""
    return {"ok": True}


@app.get("/api/config")
async def get_config():
    """Public configuration for frontend."""
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
        "groq_model": settings.groq_model,
    }


# Include API routers — v5
app.include_router(chat_router)
app.include_router(analytics_router)
app.include_router(customers_router)
app.include_router(bookings_router)
app.include_router(debug_router)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info",
    )
