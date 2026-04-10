"""SupportBot Pro - API Routes"""

from app.api.chat import router as chat_router
from app.api.analytics import router as analytics_router
from app.api.customers import router as customers_router
from app.api.bookings import router as bookings_router

__all__ = ["chat_router", "analytics_router", "customers_router", "bookings_router"]
