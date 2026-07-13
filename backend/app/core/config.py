"""
SupportBot Pro - Application Configuration
Production-ready configuration using Pydantic Settings
"""

from functools import lru_cache
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with validation."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Application
    app_name: str = Field(default="SupportBot Pro", description="Application name")
    app_version: str = Field(default="1.0.0", description="Application version")
    debug: bool = Field(default=False, description="Debug mode")
    
    # Database
    database_url: str = Field(
        default="sqlite+aiosqlite:///./supportbot.db",
        description="Database connection URL"
    )
    database_echo: bool = Field(default=False, description="Log SQL queries")
    
    # Groq AI
    groq_api_key: Optional[str] = Field(default=None, description="Groq API key for LLM")
    groq_model: str = Field(default="llama-3.1-70b-versatile", description="Groq model name")
    groq_temperature: float = Field(default=0.7, ge=0.0, le=1.0, description="Temperature for responses")
    groq_max_tokens: int = Field(default=1024, ge=1, le=8192, description="Max tokens per response")
    
    # WhatsApp (Twilio or direct API)
    whatsapp_enabled: bool = Field(default=False, description="Enable WhatsApp integration")
    whatsapp_api_key: Optional[str] = Field(default=None, description="WhatsApp API key")
    
    # Security
    secret_key: str = Field(default="super-secret-key-change-in-production", description="JWT secret")
    access_token_expire_minutes: int = Field(default=60 * 24, description="Token expiration")
    
    # CORS
    cors_origins: list[str] = Field(default=["*"], description="Allowed CORS origins")
    
    # Rate Limiting
    rate_limit_per_minute: int = Field(default=60, description="Requests per minute limit")
    
    @property
    def async_database_url(self) -> str:
        """Ensure database URL is async compatible."""
        url = self.database_url
        if url.startswith("sqlite://") and "aiosqlite" not in url:
            url = url.replace("sqlite://", "sqlite+aiosqlite://")
        return url
    
    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return not self.debug


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
