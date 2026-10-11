from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from ..config import settings
from ..database import get_db
from ..schemas import HealthResponse

router = APIRouter(prefix="/api", tags=["System Health"])


@router.get("/health", response_model=HealthResponse)
def check_health(db: Session = Depends(get_db)):
    db_ok = True
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_ok = False

    return HealthResponse(
        status="healthy" if db_ok else "degraded",
        timestamp=datetime.now(timezone.utc).isoformat(),
        version=settings.VERSION,
        database_connected=db_ok,
        aqi_provider="WAQI" if settings.AQI_API_KEY else "Open-Meteo (Zero-Key)",
        api_key_configured=bool(settings.AQI_API_KEY),
        instructions=(
            None
            if settings.AQI_API_KEY
            else "To authenticate dedicated WAQI ground station feeds, add AQI_API_KEY to your .env file."
        ),
    )
