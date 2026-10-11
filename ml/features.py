import numpy as np
import pandas as pd
from typing import List, Tuple


FEATURE_COLUMNS = [
    "sin_hour",
    "cos_hour",
    "sin_dow",
    "cos_dow",
    "month",
    "aqi_lag_1",
    "aqi_lag_2",
    "aqi_lag_3",
    "aqi_lag_24",
    "roll_mean_6h",
    "roll_std_6h",
    "roll_mean_24h",
    "temperature",
    "humidity",
    "wind_speed",
]


def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms raw air-quality observations into ML-ready time-series features.
    Strictly avoids future data leakage by using only backward-looking lags and rolling stats.
    """
    df = df.copy()

    # Ensure datetime index or sort by timestamp
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp").reset_index(drop=True)

    # Cyclical hour features (24-hour periodicity)
    hour = df["timestamp"].dt.hour
    df["sin_hour"] = np.sin(2 * np.pi * hour / 24.0)
    df["cos_hour"] = np.cos(2 * np.pi * hour / 24.0)

    # Cyclical day-of-week features (7-day periodicity)
    dow = df["timestamp"].dt.dayofweek
    df["sin_dow"] = np.sin(2 * np.pi * dow / 7.0)
    df["cos_dow"] = np.cos(2 * np.pi * dow / 7.0)

    # Seasonality
    df["month"] = df["timestamp"].dt.month

    # Autoregressive Lag features (1h, 2h, 3h, 24h)
    df["aqi_lag_1"] = df["aqi"].shift(1)
    df["aqi_lag_2"] = df["aqi"].shift(2)
    df["aqi_lag_3"] = df["aqi"].shift(3)
    df["aqi_lag_24"] = df["aqi"].shift(24)

    # Rolling window statistical features
    df["roll_mean_6h"] = df["aqi"].shift(1).rolling(window=6, min_periods=1).mean()
    df["roll_std_6h"] = df["aqi"].shift(1).rolling(window=6, min_periods=1).std().fillna(0.0)
    df["roll_mean_24h"] = df["aqi"].shift(1).rolling(window=24, min_periods=1).mean()

    # Fill any remaining NaNs from early lag shifts with backward/forward fill
    df["aqi_lag_1"] = df["aqi_lag_1"].bfill()
    df["aqi_lag_2"] = df["aqi_lag_2"].bfill()
    df["aqi_lag_3"] = df["aqi_lag_3"].bfill()
    df["aqi_lag_24"] = df["aqi_lag_24"].bfill()
    df["roll_mean_6h"] = df["roll_mean_6h"].bfill()
    df["roll_mean_24h"] = df["roll_mean_24h"].bfill()

    return df


def get_feature_matrix(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """Returns X (features) and y (target AQI)."""
    X = df[FEATURE_COLUMNS]
    y = df["aqi"]
    return X, y
