from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..config import settings
from ..schemas import CurrentAQIResponse, HistoricalResponse
from ..services.aqi_service import aqi_service

router = APIRouter(prefix="/api/aqi", tags=["Air Quality Telemetry"])


@router.get("/current", response_model=CurrentAQIResponse)
async def get_current_aqi(
    city: str = Query("tokyo", description="City identifier or name"),
    db: Session = Depends(get_db),
):
    try:
        return await aqi_service.get_current_aqi(city, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch air quality data: {str(e)}")


@router.get("/history", response_model=HistoricalResponse)
def get_aqi_history(
    city: str = Query("tokyo", description="City identifier or name"),
    db: Session = Depends(get_db),
):
    try:
        return aqi_service.get_historical_data(city, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch historical trends: {str(e)}")


@router.get("/status")
def get_provider_status():
    return {
        "provider": "WAQI" if settings.AQI_API_KEY else "Open-Meteo",
        "key_configured": bool(settings.AQI_API_KEY),
        "zero_key_mode": not bool(settings.AQI_API_KEY),
        "message": (
            "Authenticated with WAQI ground station network."
            if settings.AQI_API_KEY
            else "Operational in Zero-Key mode using Open-Meteo realtime satellite & CAMS atmospheric model. Add AQI_API_KEY in .env to connect dedicated WAQI ground stations."
        ),
        "instructions_url": "https://aqicn.org/data-platform/token/",
    }
