"""
Main Application Entry Point - Shiphny AI Support

This file bootstraps the FastAPI application, configures CORS, and registers all API routes.
We keep this file minimal. All business logic is delegated to the `app.api` and `app.services` layers.
"""

from dotenv import load_dotenv
# Load environment variables before any settings are initialized
load_dotenv(override=True)

import uvicorn
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import init_db, close_db
from app.api import chat_router, analytics_router, customers_router, bookings_router
from app.api.chat_debug import router as debug_router

# We import all models here to ensure SQLAlchemy's Base.metadata registers them 
# before calling create_all() during database initialization.
import app.models.customer       # noqa: F401
import app.models.conversation   # noqa: F401
import app.models.knowledge_base # noqa: F401
import app.models.booking        # noqa: F401
import app.models.shipment       # noqa: F401
import app.models.invoice        # noqa: F401

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Shiphny Enterprise API - Handles logistics operations and AI support.",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configure CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Execute startup routines like database connection pools."""
    try:
        await init_db()
        logger.info(f"Successfully started {settings.app_name} v{settings.app_version}")
    except Exception as e:
        logger.critical("Failed to initialize database during startup", exc_info=True)
        raise e

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources before the server shuts down."""
    await close_db()
    logger.info("Application shutdown complete.")

@app.get("/api/health")
async def health_check():
    """
    Standard health check endpoint used by Kubernetes readiness/liveness probes.
    """
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
    }

@app.get("/api/config")
async def get_config():
    """Provide safe, public configuration details to the frontend client."""
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
    }

# Register all modular API routers
from app.api.auth_router import router as auth_router
from app.api.admin_router import router as admin_router

app.include_router(auth_router)
app.include_router(admin_router)
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
