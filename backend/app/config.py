import os
from typing import List
from dotenv import load_dotenv

# Load local environment variables from root or backend directory
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))


class Settings:
    PROJECT_NAME: str = "AeroSense AI Backend"
    VERSION: str = "1.0.0"
    ENV: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

    # Real AQI Provider Credentials & Settings
    # Supports WAQI (World Air Quality Index, https://aqicn.org/data-platform/token/)
    # and zero-key Open-Meteo Air Quality fallback
    AQI_API_KEY: str = os.getenv("AQI_API_KEY", "").strip()
    AQI_PROVIDER: str = os.getenv("AQI_PROVIDER", "waqi").lower()
    
    # Database Configuration (SQLite default for zero-setup local dev; PostgreSQL supported)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./aerosense.db")

    # CORS configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:4173",
        "https://aerosense-ai.vercel.app",
    ]

    # Cache TTL in seconds (prevents hammering free-tier endpoints)
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "300"))


settings = Settings()
