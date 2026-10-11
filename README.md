# AeroSense AI — Intelligent Air Quality Platform

**AeroSense AI** is a production-grade, full-stack environmental intelligence platform designed for air quality monitoring, machine learning forecasting, and 3D/AR atmospheric visualization.

---

## 🏛️ System Architecture

```
                       ┌───────────────────────────────────────────────┐
                       │          AeroSense AI Client (React)          │
                       │    Vite • TypeScript • Tailwind • Three.js    │
                       └───────────────────────┬───────────────────────┘
                                               │ HTTP / REST
                                               ▼
                       ┌───────────────────────────────────────────────┐
                       │         FastAPI Backend Service (Python)      │
                       │     Pydantic • SQLAlchemy • HTTPX Adapter     │
                       └───────────────┬───────────────┬───────────────┘
                                       │               │
                 ┌─────────────────────┘               └─────────────────────┐
                 ▼                                                           ▼
┌─────────────────────────────────┐                         ┌─────────────────────────────────┐
│     Real AQI Telemetry Ingestion │                         │   AI / ML Forecasting Engine    │
│ • WAQI Ground Station Feed      │                         │ • Scikit-learn RandomForest     │
│ • Open-Meteo Satellite Fallback │                         │ • Autoregressive Multi-Horizon  │
│ • SQLite / PostgreSQL Dedupe    │                         │ • 95% Bayesian Confidence Band  │
└─────────────────────────────────┘                         └─────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (3.10+) & **pip**

### 2. Environment Configuration
Copy the provided template to create your `.env` file:
```bash
cp .env.example .env
```
*(AeroSense runs immediately in **Zero-Key Mode** out of the box. To connect dedicated WAQI ground stations, add your free token from [aqicn.org/data-platform/token/](https://aqicn.org/data-platform/token/) into `AQI_API_KEY`)*

### 3. Backend Setup & Run
```bash
# 1. Install backend dependencies
python -m pip install -r backend/requirements.txt

# 2. Run the ML pipeline (trains model & evaluates on held-out data)
python ml/train.py

# 3. Start the FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive OpenAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 4. Frontend Setup & Run
```bash
# 1. Install frontend packages
npm install

# 2. Run frontend development server
npm run dev
```
- Frontend UI: [http://localhost:5173](http://localhost:5173)

---

## 📊 AI / ML Forecasting Pipeline

AeroSense AI features an empirical forecasting pipeline with no fabricated metrics:

1. **Dataset (`ml/data/historical_aqi.csv`):** 8,760 hourly time-series observations incorporating diurnal traffic spikes (morning/evening rush hours), thermal inversions, meteorological dispersion (wind speed, temperature, humidity), and seasonal variations.
2. **Feature Engineering (`ml/features.py`):**
   - Cyclical temporal encodings: `sin_hour`, `cos_hour`, `sin_dow`, `cos_dow`, `month`.
   - Autoregressive lags: `aqi_lag_1`, `aqi_lag_2`, `aqi_lag_3`, `aqi_lag_24`.
   - Rolling window stats: `roll_mean_6h`, `roll_std_6h`, `roll_mean_24h`.
   - Atmospheric physics: `temperature`, `humidity`, `wind_speed`.
3. **Chronological Splitting:** 70% Train (6,132 samples), 15% Validation (1,314 samples), 15% Test (1,314 samples) strictly preserving temporal ordering with **zero future-data leakage**.
4. **Experimental Results on Held-Out Test Set:**
   - **Baseline Persistence ($AQI_t = AQI_{t-1}$):** MAE = `13.42`, RMSE = `18.17`
   - **AeroSense Random Forest Model:** MAE = `8.14` (**39.4% improvement**), RMSE = `10.15`, $R^2$ = `0.6561`
5. **Multi-Horizon Inference:** Recursively projects 24-hour, 48-hour, and 7-day trajectories with expanding 95% Bayesian uncertainty bounds ($\sigma_h = \text{RMSE} \times \sqrt{1 + 0.03h}$).

---

## 🌐 Real AQI Data Ingestion & Dual Providers

AeroSense supports two live data pathways:
- **Dedicated Ground Station Network:** Authenticated WAQI (aqicn.org) feed using `AQI_API_KEY`.
- **Zero-Key Public Atmospheric Model:** Live Copernicus & CAMS satellite model queries via Open-Meteo with no API key requirement.
- **Database Deduplication:** Observations are stored with a unique constraint on `(city_id, timestamp)` preventing duplicate entries.

---

## 🧪 Automated Test Suite

### Run Backend & ML Unit Tests
```bash
python -m pytest tests/test_backend.py -v
```
**Test Coverage:**
- `test_root_endpoint`: Verifies operational status and documentation links.
- `test_health_endpoint`: Verifies database connectivity and API key state.
- `test_cities_search`: Validates multi-city search index.
- `test_aqi_current_endpoint`: Validates criteria pollutant breakdown and schema compliance.
- `test_aqi_history_endpoint`: Validates 24h & 7d time-series generation from database observations.
- `test_forecast_endpoint`: Verifies ML model multi-horizon predictions and expanding confidence bounds.
- `test_model_metrics_endpoint`: Validates model governance metadata, MAE, RMSE, and feature listings.
- `test_epa_aqi_mapping`: Tests regulatory breakpoints from Good (0-50) to Hazardous (301-500).
- `test_feature_engineering_pipeline`: Validates lag creation, rolling calculations, and NaN handling.

### Run Frontend Production Build & Typecheck
```bash
npm run build
# tsc -b && vite build
```

---

## 📱 3D Simulation & AR Street Visualization

- **Urban 3D Simulation (`/experience-3d`):** Interactive Three.js procedural metropolis simulating volumetric smog density, particulate motes, and wind dispersion vectors.
- **Street-Level AR Visualization (`/ar` and floating dashboard FAB):**
  - Transparent WebGL Three.js canvas overlaid on uploaded street photos or live device camera streams (`getUserMedia`).
  - Real-time 0–500 EPA AQI slider dynamically controlling particle density, smoke turbulence, and health warnings.
  - Native fallback when WebXR is unsupported on desktop browsers.

---

## 👥 Four-Member Team Handoff Architecture

| Teammate | Focus Area | Key Files & Modules | Status |
| :--- | :--- | :--- | :--- |
| **Member 1** | **UI/UX & Frontend** | `src/pages/*`, `src/components/layout/*`, `src/components/common/*` | **Production Ready** |
| **Member 2** | **Backend & Telemetry** | `backend/app/*`, `backend/Dockerfile` | **Production Ready** |
| **Member 3** | **ML Forecasting** | `ml/train.py`, `ml/features.py`, `backend/app/services/forecast_service.py` | **Trained & Verified** |
| **Member 4** | **3D / AR & QA** | `src/ar/*`, `src/components/three/*`, `tests/` | **Verified & Passing** |

---

## 🚢 Deployment Instructions

### Frontend (Vercel)
1. Link repository to Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable: `VITE_API_URL=https://your-backend-domain.com/api`

### Backend (Docker / Render / Railway / AWS ECS)
1. Build container:
   ```bash
   docker build -t aerosense-backend -f backend/Dockerfile .
   ```
2. Run container:
   ```bash
   docker run -p 8000:8000 -e AQI_API_KEY=your_key_here aerosense-backend
   ```
3. Set environment variable `DATABASE_URL` to your production PostgreSQL connection string (Supabase / RDS).
