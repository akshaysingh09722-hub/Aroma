# AeroSense AI — Backend API Integration Contract (Phase 1)

This document specifies the exact JSON schemas and endpoint signatures expected by the **AeroSense AI** frontend. The frontend is currently running with a built-in mock adapter in `src/services/api.ts` that conforms 100% to these interfaces.

---

## 1. Overview & Base URL

- **Configurable Base URL:** `VITE_API_URL` (defaults to `http://localhost:8000/api`)
- **Headers:** `Content-Type: application/json`
- **Data Mode Toggle:** The frontend UI header contains a "Demo Data / Live API" switcher. When in "Live API" mode, all service requests target these endpoints with automatic fallback to mock data on network errors.

---

## 2. API Endpoints

### A. `GET /api/cities`
Retrieves the list of monitored metropolitan areas with current AQI summary and coordinate metadata.

**Query Parameters:**
- `q` *(optional, string)*: Search substring filter (e.g. `tokyo`)
- `region` *(optional, string)*: Continent filter (e.g. `Asia`, `Europe`, `North America`)

**Response (`200 OK`):**
```json
[
  {
    "id": "tokyo",
    "name": "Tokyo",
    "country": "Japan",
    "continent": "Asia",
    "region": "East Asia",
    "latitude": 35.6762,
    "longitude": 139.6503,
    "population": 37400000,
    "elevationMeters": 40,
    "climateZone": "Humid Subtropical (Cfa)",
    "currentAQI": 42,
    "dominantPollutant": "pm25",
    "category": "Good",
    "lastUpdated": "2026-10-10 12:00 UTC",
    "weather": {
      "temperature": 19,
      "humidity": 58,
      "windSpeed": 14,
      "windDirection": "SSE",
      "pressure": 1016,
      "uvIndex": 4,
      "visibilityKm": 18,
      "condition": "Clear, gentle marine breeze"
    },
    "pollutants": {
      "pm25": { "value": 10.2, "unit": "µg/m³", "standardLimit": 35.0 },
      "pm10": { "value": 22.4, "unit": "µg/m³", "standardLimit": 150.0 }
    }
  }
]
```

---

### B. `GET /api/aqi/current`
Fetches real-time multi-pollutant concentrations and health advisories for a specific city.

**Query Parameters:**
- `city` *(required, string)*: City ID or name (e.g. `tokyo`, `new-york`, `new-delhi`)

**Response (`200 OK`):**
```json
{
  "id": "tokyo",
  "name": "Tokyo",
  "country": "Japan",
  "currentAQI": 42,
  "dominantPollutant": "pm25",
  "category": "Good",
  "pollutants": {
    "pm25": {
      "id": "pm25",
      "name": "Fine Particulate Matter",
      "chemicalFormula": "PM2.5",
      "value": 10.2,
      "unit": "µg/m³",
      "standardLimit": 35.0,
      "category": "Good",
      "aqiContribution": 42,
      "description": "Microscopic particles ≤ 2.5 µm that penetrate deep into lung alveoli.",
      "healthImpact": "Increased cardiovascular and respiratory risk."
    },
    "pm10": {
      "id": "pm10",
      "name": "Coarse Particulate Matter",
      "chemicalFormula": "PM10",
      "value": 22.4,
      "unit": "µg/m³",
      "standardLimit": 150.0,
      "category": "Good",
      "aqiContribution": 20
    },
    "no2": { "value": 18.2, "unit": "ppb", "standardLimit": 100.0 },
    "so2": { "value": 4.1, "unit": "ppb", "standardLimit": 75.0 },
    "co": { "value": 0.45, "unit": "ppm", "standardLimit": 9.0 },
    "o3": { "value": 38.6, "unit": "ppb", "standardLimit": 70.0 }
  },
  "weather": {
    "temperature": 19,
    "humidity": 58,
    "windSpeed": 14,
    "windDirection": "SSE"
  },
  "stations": [
    {
      "id": "tokyo-shinjuku",
      "name": "Shinjuku Environmental Research Station",
      "stationCode": "TK-SNJ-01",
      "latitude": 35.6938,
      "longitude": 139.7034,
      "currentAQI": 44,
      "sensorType": "Reference Optical Particle",
      "lastReported": "5 mins ago"
    }
  ],
  "healthRecommendations": {
    "general": "Air quality is considered satisfactory; ideal for outdoor activities.",
    "sensitiveGroups": "No precautions necessary for sensitive individuals.",
    "outdoorActivities": "Outdoor activities and athletics are safe without restriction.",
    "ventilation": "Natural room ventilation is strongly encouraged.",
    "masksAndProtection": "No protective mask required under current conditions."
  },
  "lastUpdated": "2026-10-10 12:00 UTC"
}
```

---

### C. `GET /api/aqi/history`
Retrieves time-series ground observations for historical charts.

**Query Parameters:**
- `city` *(required, string)*: City ID (e.g. `tokyo`)
- `range` *(optional, enum: `24h` | `7d` | `30d`, default: `24h`)*

**Response (`200 OK`):**
```json
[
  {
    "timestamp": "2026-10-10T12:00:00Z",
    "timeLabel": "12:00",
    "aqi": 42,
    "pm25": 10.2,
    "pm10": 22.4,
    "no2": 18.2,
    "so2": 4.1,
    "co": 0.45,
    "o3": 38.6,
    "temperature": 19,
    "humidity": 58
  }
]
```

---

### D. `GET /api/aqi/forecast`
Fetches neural network projections produced by the AI/ML forecasting model (Member 3).

**Query Parameters:**
- `city` *(required, string)*: City identifier
- `horizon` *(optional, enum: `24h` | `48h` | `7d`, default: `24h`)*

**Response (`200 OK`):**
```json
[
  {
    "timestamp": "2026-10-10T13:00:00Z",
    "timeLabel": "13:00",
    "predictedAQI": 45,
    "lowerBound": 38,
    "upperBound": 52,
    "confidenceScore": 94,
    "dominantPollutant": "pm25",
    "primaryDriver": "Morning vehicular emission surge & surface inversion",
    "trend": "stable"
  }
]
```

---

### E. `GET /api/health`
System liveness check and AI model ingestion telemetry.

**Response (`200 OK`):**
```json
{
  "status": "healthy",
  "version": "1.4.2-prod",
  "timestamp": "2026-10-10T12:00:00Z",
  "backendConnected": true,
  "modelEngine": "Temporal Fusion Transformer v1.4",
  "activeStations": 28,
  "dataFreshnessSeconds": 120
}
```
