# AeroSense AI — Intelligent Air Quality Platform (Phase 1)

AeroSense AI is a modern environmental intelligence and air-quality forecasting platform built for hackathons. This repository contains the **Phase 1 Frontend Foundation** — a modular, responsive React + TypeScript application with clearly defined module boundaries for four team members.

---

## 🚀 Quick Start: Installation & Running

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+ or v11+)

### 1. Install Dependencies
```bash
npm install
```
*(Note: If your local ISP blocks the default registry, configure `npm config set registry https://registry.npmmirror.com` before installing.)*

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build & Typecheck
```bash
npm run build
npm run preview
```

---

## 📁 Project Architecture & Folder Structure

```
Aroma/
├── docs/
│   └── API_CONTRACT.md          # Complete REST API schemas for Member 2 & 3
├── src/
│   ├── components/
│   │   ├── common/              # Reusable UI tokens (AQIBadge, AQICard, PollutantCard, etc.)
│   │   │   ├── AQIBadge.tsx
│   │   │   ├── AQICard.tsx
│   │   │   ├── CitySearch.tsx
│   │   │   ├── DemoNotice.tsx
│   │   │   ├── ModulePlaceholder.tsx
│   │   │   └── PollutantCard.tsx
│   │   ├── dashboard/           # Dashboard widgets (HistoricalChart, Advisories, Placeholders)
│   │   │   ├── CityMapPlaceholder.tsx
│   │   │   ├── ForecastPlaceholder.tsx
│   │   │   ├── HealthAdvisory.tsx
│   │   │   └── HistoricalChart.tsx
│   │   └── layout/              # Structural shells (AppLayout, Navbar, Footer)
│   │       ├── AppLayout.tsx
│   │       ├── Footer.tsx
│   │       └── Navbar.tsx
│   ├── data/
│   │   └── mockAirQualityData.ts # Curated 12-city demo datasets & diurnal curves
│   ├── pages/                   # Five core application pages
│   │   ├── AboutPage.tsx        # Project vision, AI forecasting & team architecture
│   │   ├── CityExplorerPage.tsx # Multi-city search, filters & cards
│   │   ├── DashboardPage.tsx    # Live station telemetry, AQI gauge & pollutants
│   │   ├── ForecastPage.tsx     # 7-day predictive AI trajectory & uncertainty bounds
│   │   └── LandingPage.tsx      # High-impact environmental landing page
│   ├── services/
│   │   └── api.ts               # Centralized API service with mock/live mode adapter
│   ├── types/
│   │   └── airQuality.ts        # Comprehensive TypeScript domain interfaces
│   ├── utils/
│   │   └── aqiUtils.ts          # EPA breakpoints, color scales, chemical formulas
│   ├── App.tsx                  # Centralized React Router configuration
│   ├── index.css                # Tailwind CSS directives and custom styling
│   └── main.tsx                 # Application DOM entrypoint
├── tailwind.config.js           # Environmental color tokens (navy, forest, cyan, aqi)
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite configuration
```

---

## 👥 Four-Member Team Handoff Guide

The frontend was architected specifically so four team members can develop simultaneously without merge collisions or blocked dependencies:

| Team Member | Role | Assigned Files & Directories | Responsibility |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Frontend & UI/UX** | `src/pages/*`, `src/components/layout/*`, `src/components/common/*` | Shared components, page designs, responsive polish, dark/light themes, and UI transitions. |
| **Member 2** | **Backend & APIs** | `src/services/api.ts`, `docs/API_CONTRACT.md`, Backend Repo | Ingest live data from OpenAQ / EPA AirNow, implement REST endpoints matching the contract, and connect Redis. |
| **Member 3** | **AI / ML Forecasting** | `src/pages/ForecastPage.tsx`, `src/data/mockAirQualityData.ts`, ML Repo | Train the Temporal Fusion Transformer (TFT) or LSTM ensemble and hook up prediction endpoints with confidence intervals. |
| **Member 4** | **Spatial & 3D GIS** | `src/components/dashboard/CityMapPlaceholder.tsx`, `src/components/maps/*` | Implement interactive Leaflet station pins, vector heat layers, or Three.js 3D urban dispersion prototype. |

---

## 🔌 Backend & ML Integration Points

1. **Centralized Service Layer (`src/services/api.ts`):**
   - Configurable via `VITE_API_URL` environment variable.
   - Built-in `DataSourceMode` (`'mock' | 'live'`) toggle located in the navigation bar.
   - Handles network disconnection gracefully by falling back to mock fixtures with console diagnostics.

2. **Backend Contract (`docs/API_CONTRACT.md`):**
   - Contains exact JSON request and response payloads for:
     - `GET /api/cities`
     - `GET /api/aqi/current?city={id}`
     - `GET /api/aqi/history?city={id}&range={range}`
     - `GET /api/aqi/forecast?city={id}&horizon={horizon}`
     - `GET /api/health`

---

## 📊 Where Demo Data is Used (Transparency Note)

In compliance with hackathon standards, **no sample data is ever presented as real live sensor telemetry**:
- **Dashboard:** Ambient AQI, pollutant cards, and historical line charts use calibrated synthetic diurnal variations loaded from `src/data/mockAirQualityData.ts`.
- **Forecast Engine:** Hourly predictions and uncertainty bands are labeled as `DEMO DATA: AI model integration pending`.
- **City Explorer:** City catalog uses realistic reference baselines for 12 major world capitals (Tokyo, New York, London, Delhi, Paris, Los Angeles, Seoul, São Paulo, Sydney, Cairo, Beijing, Berlin).
- **Mode Toggle:** Click the "Demo Data / Live API" badge in the navigation bar to switch between the local mock adapter and your local/cloud backend server at runtime.
