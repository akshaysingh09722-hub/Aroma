from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    database_connected: bool
    aqi_provider: str
    api_key_configured: bool
    instructions: Optional[str] = None


class CityItem(BaseModel):
    id: str
    name: str
    country: str
    latitude: float
    longitude: float
    current_aqi: int
    category: str


class PollutantItem(BaseModel):
    code: str
    name: str
    value: float
    unit: str
    status: str
    epa_limit: float


class WeatherItem(BaseModel):
    temperature: float
    humidity: float
    wind_speed: float
    wind_direction: str
    condition: str


class CurrentAQIResponse(BaseModel):
    city_id: str
    city_name: str
    country: str
    latitude: float
    longitude: float
    aqi: int
    category: str
    category_color: str
    dominant_pollutant: str
    pollutants: Dict[str, PollutantItem]
    weather: WeatherItem
    timestamp: str
    is_live_data: bool
    provider: str
    api_key_configured: bool
    health_advisory: str
    disclaimer: str


class HistoricalPoint(BaseModel):
    timestamp: str
    aqi: int
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    temperature: Optional[float] = None


class HistoricalResponse(BaseModel):
    city_id: str
    city_name: str
    source: str
    total_points: int
    data_24h: List[HistoricalPoint]
    data_7d: List[HistoricalPoint]


class ForecastPoint(BaseModel):
    timestamp: str
    hour_offset: int
    predicted_aqi: int
    category: str
    confidence_lower: int
    confidence_upper: int


class ForecastResponse(BaseModel):
    city_id: str
    city_name: str
    horizon_hours: int
    model_name: str
    model_mae: float
    model_rmse: float
    peak_window: Optional[str] = None
    cleanest_window: Optional[str] = None
    points: List[ForecastPoint]
    generated_at: str
    is_live_projection: bool


class ModelMetricsResponse(BaseModel):
    model_name: str
    algorithm: str
    trained_at: str
    test_mae: float
    test_rmse: float
    test_r2: float
    baseline_mae: float
    baseline_rmse: float
    features_used: List[str]
    training_sample_count: int
    evaluation_dataset: str
