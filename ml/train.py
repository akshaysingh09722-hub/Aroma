import os
import json
from datetime import datetime, timedelta, timezone
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from features import create_features, get_feature_matrix, FEATURE_COLUMNS

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
DATASET_PATH = os.path.join(DATA_DIR, "historical_aqi.csv")
MODEL_PATH = os.path.join(MODELS_DIR, "aerosense_forecaster.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")


def generate_seed_dataset():
    """Generates 1 year of hourly realistic atmospheric air quality time-series."""
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(DATASET_PATH):
        return pd.read_csv(DATASET_PATH)

    print(f"Generating 1-year historical dataset at {DATASET_PATH}...")
    np.random.seed(42)
    start_date = datetime(2025, 1, 1, 0, 0, 0)
    hours = 8760
    records = []

    for h in range(hours):
        t = start_date + timedelta(hours=h)
        hour = t.hour
        dow = t.weekday()
        month = t.month

        # Baseline diurnal cycles (morning and evening traffic peaks)
        rush_hour = 25.0 if hour in (8, 9, 18, 19) else (-15.0 if hour in (2, 3, 4, 5) else 0.0)
        weekend_discount = -12.0 if dow in (5, 6) else 0.0
        winter_penalty = 18.0 if month in (11, 12, 1, 2) else 0.0

        # Meteorological factors
        temp = 15.0 + 10.0 * np.sin(2 * np.pi * (h - 9) / 24.0) + (10.0 if month in (6, 7, 8) else -5.0)
        humidity = 60.0 - 20.0 * np.sin(2 * np.pi * (h - 9) / 24.0) + np.random.normal(0, 5)
        humidity = max(20.0, min(95.0, humidity))
        wind_speed = 8.0 + 4.0 * np.sin(2 * np.pi * (h - 14) / 24.0) + np.random.normal(0, 2)
        wind_speed = max(1.0, min(25.0, wind_speed))

        # Atmospheric dispersion: low wind traps pollution
        inversion = 20.0 if wind_speed < 4.0 else -5.0

        aqi_raw = 65.0 + rush_hour + weekend_discount + winter_penalty + inversion + np.random.normal(0, 6)
        aqi = int(max(12, min(350, round(aqi_raw))))

        records.append({
            "timestamp": t.isoformat(),
            "city_id": "tokyo",
            "aqi": aqi,
            "pm25": round(aqi * 0.44 + np.random.normal(0, 2), 1),
            "pm10": round(aqi * 0.76 + np.random.normal(0, 3), 1),
            "temperature": round(temp, 1),
            "humidity": round(humidity, 1),
            "wind_speed": round(wind_speed, 1),
        })

    df = pd.DataFrame(records)
    df.to_csv(DATASET_PATH, index=False)
    print(f"Saved {len(df)} historical observations to {DATASET_PATH}")
    return df


def train_and_evaluate():
    os.makedirs(MODELS_DIR, exist_ok=True)
    df_raw = generate_seed_dataset()

    print("Building engineered feature matrix...")
    df_feat = create_features(df_raw)
    X, y = get_feature_matrix(df_feat)

    # Chronological Split (No Future-Data Leakage)
    n = len(X)
    train_end = int(n * 0.70)
    val_end = int(n * 0.85)

    X_train, y_train = X.iloc[:train_end], y.iloc[:train_end]
    X_val, y_val = X.iloc[train_end:val_end], y.iloc[train_end:val_end]
    X_test, y_test = X.iloc[val_end:], y.iloc[val_end:]

    print(f"Dataset split: Train={len(X_train)} | Val={len(X_val)} | Test={len(X_test)}")

    # 1. Baseline Model: Lag-1 Persistence (Predict AQI at t is equal to AQI at t-1)
    y_test_baseline = X_test["aqi_lag_1"]
    base_mae = mean_absolute_error(y_test, y_test_baseline)
    base_rmse = np.sqrt(mean_squared_error(y_test, y_test_baseline))

    print(f"--- BASELINE PERSISTENCE ---")
    print(f"MAE:  {base_mae:.2f}")
    print(f"RMSE: {base_rmse:.2f}")

    # 2. Machine Learning Model: Random Forest Regressor
    print("Training RandomForestRegressor model...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Evaluate on held-out test set
    y_pred = model.predict(X_test)
    test_mae = mean_absolute_error(y_test, y_pred)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    test_r2 = r2_score(y_test, y_pred)

    print(f"--- RANDOM FOREST REGRESSOR (HELD-OUT TEST SET) ---")
    print(f"MAE:  {test_mae:.2f} (Improvement over baseline: {((base_mae - test_mae)/base_mae)*100:.1f}%)")
    print(f"RMSE: {test_rmse:.2f}")
    print(f"R²:   {test_r2:.4f}")

    # Persist model
    joblib.dump(model, MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")

    # Persist metadata
    metadata = {
        "model_name": "AeroSense_RandomForest_v1",
        "algorithm": "RandomForestRegressor(n_estimators=100, max_depth=12)",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "baseline_mae": round(float(base_mae), 2),
        "baseline_rmse": round(float(base_rmse), 2),
        "test_mae": round(float(test_mae), 2),
        "test_rmse": round(float(test_rmse), 2),
        "test_r2": round(float(test_r2), 4),
        "features_used": FEATURE_COLUMNS,
        "training_sample_count": len(X_train),
        "evaluation_dataset": "ml/data/historical_aqi.csv",
    }
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved evaluation metadata to {METADATA_PATH}")

    return metadata


if __name__ == "__main__":
    train_and_evaluate()
