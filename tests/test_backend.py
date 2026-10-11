import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.aqi_service import get_aqi_details, aqi_service
from ml.features import create_features
import pandas as pd
from datetime import datetime, timedelta

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "/docs" in data["docs"]


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded")
    assert "version" in data
    assert "database_connected" in data


def test_cities_search():
    response = client.get("/api/cities/search?q=tokyo")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Tokyo"


def test_aqi_current_endpoint():
    response = client.get("/api/aqi/current?city=tokyo")
    assert response.status_code == 200
    data = response.json()
    assert data["city_id"] == "tokyo"
    assert "aqi" in data
    assert "category" in data
    assert "pollutants" in data
    assert "pm25" in data["pollutants"]
    assert "pm10" in data["pollutants"]
    assert "weather" in data


def test_aqi_history_endpoint():
    response = client.get("/api/aqi/history?city=tokyo")
    assert response.status_code == 200
    data = response.json()
    assert data["city_id"] == "tokyo"
    assert len(data["data_24h"]) > 0
    assert len(data["data_7d"]) > 0


def test_forecast_endpoint():
    response = client.get("/api/forecast?city=tokyo&horizon=24")
    assert response.status_code == 200
    data = response.json()
    assert data["city_id"] == "tokyo"
    assert len(data["points"]) == 24
    assert "model_mae" in data
    assert "model_rmse" in data
    # Test confidence interval ordering
    p0 = data["points"][0]
    assert p0["confidence_lower"] <= p0["predicted_aqi"] <= p0["confidence_upper"]


def test_model_metrics_endpoint():
    response = client.get("/api/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "test_mae" in data
    assert "test_rmse" in data
    assert "test_r2" in data
    assert len(data["features_used"]) > 5


def test_epa_aqi_mapping():
    cat, col, _ = get_aqi_details(25)
    assert cat == "Good"
    assert col == "#10B981"

    cat, col, _ = get_aqi_details(75)
    assert cat == "Moderate"
    assert col == "#F59E0B"

    cat, col, _ = get_aqi_details(130)
    assert cat == "Unhealthy for Sensitive Groups"

    cat, col, _ = get_aqi_details(175)
    assert cat == "Unhealthy"

    cat, col, _ = get_aqi_details(250)
    assert cat == "Very Unhealthy"

    cat, col, _ = get_aqi_details(350)
    assert cat == "Hazardous"


def test_feature_engineering_pipeline():
    start_t = datetime(2025, 1, 1, 0, 0, 0)
    sample_data = pd.DataFrame([
        {
            "timestamp": (start_t + timedelta(hours=h)).isoformat(),
            "city_id": "tokyo",
            "aqi": 50 + h,
            "temperature": 20.0,
            "humidity": 50.0,
            "wind_speed": 10.0,
        }
        for h in range(30)
    ])
    feat_df = create_features(sample_data)
    assert "sin_hour" in feat_df.columns
    assert "cos_hour" in feat_df.columns
    assert "aqi_lag_1" in feat_df.columns
    assert "roll_mean_6h" in feat_df.columns
    assert not feat_df["sin_hour"].isna().any()
