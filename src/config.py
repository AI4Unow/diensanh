"""
Configuration module for Diên Sanh Chatbot.
Loads settings from environment variables.
"""

import os
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    # API configuration
    ai4u_api_key: str = Field(default="", env="AI4U_API_KEY")
    ai4u_base_url: str = Field(default="https://api.ai4u.now/v1", env="AI4U_BASE_URL")

    # Model settings
    chat_model: str = Field(default="gemini-2.5-flash", env="CHAT_MODEL")
    embedding_model: str = Field(default="all-MiniLM-L6-v2", env="EMBEDDING_MODEL")

    # Scraping targets
    main_site_url: str = "https://diensanh.quangtri.gov.vn"
    services_portal_url: str = "https://dichvucong.quangtri.gov.vn"

    # Data paths
    data_dir: str = Field(default="./data", env="DATA_DIR")
    chroma_db_path: str = Field(default="./data/chroma_db", env="CHROMA_DB_PATH")

    # Server settings
    api_host: str = Field(default="0.0.0.0", env="API_HOST")
    api_port: int = Field(default=8000, env="API_PORT")

    # CORS for widget embedding
    cors_origins: list[str] = Field(
        default=["*"],
        env="CORS_ORIGINS"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore extra fields from .env


# Global settings instance
settings = Settings()
