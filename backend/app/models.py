from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from .database import Base


class City(Base):
    __tablename__ = "cities"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    observations = relationship("AQIObservation", back_populates="city", cascade="all, delete-orphan")
    forecasts = relationship("ForecastRecord", back_populates="city", cascade="all, delete-orphan")


class AQIObservation(Base):
    __tablename__ = "aqi_observations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    city_id = Column(String(50), ForeignKey("cities.id"), nullable=False, index=True)
    aqi = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)
    dominant_pollutant = Column(String(20), default="pm25")

    # Concentration values (µg/m³ or ppm)
    pm25 = Column(Float, nullable=True)
    pm10 = Column(Float, nullable=True)
    no2 = Column(Float, nullable=True)
    so2 = Column(Float, nullable=True)
    co = Column(Float, nullable=True)
    o3 = Column(Float, nullable=True)

    # Ambient meteorological features for forecasting
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)

    source = Column(String(50), default="waqi")
    timestamp = Column(DateTime, nullable=False, index=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    city = relationship("City", back_populates="observations")

    # Deduplication constraint: one observation per city per timestamp
    __table_args__ = (
        UniqueConstraint("city_id", "timestamp", name="uq_city_timestamp"),
        Index("ix_city_timestamp", "city_id", "timestamp"),
    )


class ForecastRecord(Base):
    __tablename__ = "forecast_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    city_id = Column(String(50), ForeignKey("cities.id"), nullable=False, index=True)
    forecast_timestamp = Column(DateTime, nullable=False, index=True)
    predicted_aqi = Column(Float, nullable=False)
    confidence_lower = Column(Float, nullable=False)
    confidence_upper = Column(Float, nullable=False)
    model_name = Column(String(100), default="RandomForest_v1")
    created_at = Column(DateTime, default=datetime.utcnow)

    city = relationship("City", back_populates="forecasts")
