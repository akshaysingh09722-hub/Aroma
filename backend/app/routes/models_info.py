from fastapi import APIRouter
from ..schemas import ModelMetricsResponse
from ..services.forecast_service import forecast_service

router = APIRouter(prefix="/api/model", tags=["Model Governance & Metrics"])


@router.get("/metrics", response_model=ModelMetricsResponse)
def get_model_metrics():
    return forecast_service.get_metrics()
