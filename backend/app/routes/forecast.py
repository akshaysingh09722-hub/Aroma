from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import ForecastResponse
from ..services.forecast_service import forecast_service

router = APIRouter(prefix="/api/forecast", tags=["Forecasting Engine"])


@router.get("", response_model=ForecastResponse)
def get_forecast(
    city: str = Query("tokyo", description="City identifier or name"),
    horizon: int = Query(24, ge=12, le=168, description="Forecast horizon in hours (e.g. 24, 48, 168)"),
    db: Session = Depends(get_db),
):
    try:
        return forecast_service.generate_forecast(city, horizon_hours=horizon, db=db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate forecast: {str(e)}")
