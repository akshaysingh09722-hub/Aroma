import {
  CityAirQualityRecord,
  HistoricalReading,
  ForecastPoint,
  APIHealthResponse,
  ModelMetadata,
  PollutantType,
} from '../types/airQuality';
import { CITIES_DATA, MOCK_MODEL_METADATA } from '../data/mockAirQualityData';

export type DataSourceMode = 'mock' | 'live';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api';

class ApiService {
  private mode: DataSourceMode = 'live'; // Default to live API with auto-fallback
  private listeners: Set<(mode: DataSourceMode) => void> = new Set();
  private backendLive = false;

  constructor() {
    const savedMode = localStorage.getItem('aerosense_data_mode');
    if (savedMode === 'live' || savedMode === 'mock') {
      this.mode = savedMode;
    }
  }

  public getMode(): DataSourceMode {
    return this.mode;
  }

  public setMode(mode: DataSourceMode): void {
    this.mode = mode;
    localStorage.setItem('aerosense_data_mode', mode);
    this.listeners.forEach((fn) => fn(mode));
  }

  public subscribeModeChange(listener: (mode: DataSourceMode) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public isBackendLive(): boolean {
    return this.backendLive;
  }

  private async simulateNetworkDelay(ms: number = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * GET /api/cities
   * Retrieve list of cities with current summary and pollutant snapshot
   */
  public async getCities(query?: string, region?: string): Promise<CityAirQualityRecord[]> {
    if (this.mode === 'live') {
      try {
        const url = new URL(`${API_BASE_URL}/cities/search`);
        if (query) url.searchParams.set('q', query);

        const response = await fetch(url.toString());
        if (response.ok) {
          this.backendLive = true;
          const liveList = await response.json();
          // Merge with rich base metadata for any matching cities
          return liveList.map((item: any) => {
            const base = CITIES_DATA.find((c) => c.id === item.id) || CITIES_DATA[0];
            return {
              ...base,
              id: item.id,
              name: item.name,
              country: item.country,
              latitude: item.latitude,
              longitude: item.longitude,
              currentAQI: item.current_aqi,
              category: item.category,
            };
          });
        }
      } catch (err) {
        this.backendLive = false;
        console.warn('Live API unavailable. Falling back to local data:', err);
      }
    }

    await this.simulateNetworkDelay(150);
    let results = [...CITIES_DATA];

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.dominantPollutant.toLowerCase().includes(q)
      );
    }

    if (region && region !== 'All') {
      results = results.filter((c) => c.continent === region || c.region === region);
    }

    return results;
  }

  /**
   * GET /api/aqi/current?city={cityId}
   * Retrieve current AQI and pollutant breakdown for selected city
   */
  public async getCurrentAQI(cityId: string): Promise<CityAirQualityRecord> {
    const baseCity =
      CITIES_DATA.find(
        (c) => c.id.toLowerCase() === cityId.toLowerCase() || c.name.toLowerCase() === cityId.toLowerCase()
      ) || CITIES_DATA[0];

    if (this.mode === 'live') {
      try {
        const response = await fetch(`${API_BASE_URL}/aqi/current?city=${encodeURIComponent(cityId)}`);
        if (response.ok) {
          this.backendLive = true;
          const liveData = await response.json();

          // Transform and merge backend response with frontend record
          const updatedPollutants = { ...baseCity.pollutants };
          for (const key of ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3'] as PollutantType[]) {
            if (liveData.pollutants?.[key] && updatedPollutants[key]) {
              updatedPollutants[key] = {
                ...updatedPollutants[key],
                value: liveData.pollutants[key].value,
              };
            }
          }

          return {
            ...baseCity,
            id: liveData.city_id,
            name: liveData.city_name,
            country: liveData.country,
            latitude: liveData.latitude,
            longitude: liveData.longitude,
            currentAQI: liveData.aqi,
            category: liveData.category,
            dominantPollutant: (liveData.dominant_pollutant || 'pm25') as PollutantType,
            pollutants: updatedPollutants,
            weather: {
              ...baseCity.weather,
              temperature: liveData.weather?.temperature ?? baseCity.weather.temperature,
              humidity: liveData.weather?.humidity ?? baseCity.weather.humidity,
              windSpeed: liveData.weather?.wind_speed ?? baseCity.weather.windSpeed,
              condition: liveData.weather?.condition ?? baseCity.weather.condition,
            },
            lastUpdated: liveData.timestamp,
          };
        }
      } catch (err) {
        this.backendLive = false;
        console.warn(`Live API error for ${cityId}. Using local fallback:`, err);
      }
    }

    await this.simulateNetworkDelay(180);
    return baseCity;
  }

  /**
   * GET /api/aqi/history?city={cityId}&range={24h|7d|30d}
   */
  public async getAQIHistory(
    cityId: string,
    range: '24h' | '7d' | '30d' = '24h'
  ): Promise<any[]> {
    if (this.mode === 'live') {
      try {
        const response = await fetch(`${API_BASE_URL}/aqi/history?city=${encodeURIComponent(cityId)}`);
        if (response.ok) {
          this.backendLive = true;
          const historyPayload = await response.json();

          if (range === '24h' && Array.isArray(historyPayload.data_24h)) {
            return historyPayload.data_24h.map((pt: any) => ({
              timestamp: pt.timestamp,
              timeLabel: pt.timestamp,
              aqi: pt.aqi,
              pm25: pt.pm25 ?? pt.aqi * 0.44,
              pm10: pt.pm10 ?? pt.aqi * 0.76,
              no2: 20.0,
              so2: 4.0,
              co: 1.2,
              o3: 30.0,
              temperature: pt.temperature ?? 20.0,
              humidity: 55.0,
            })) as HistoricalReading[];
          } else if (range === '7d' && Array.isArray(historyPayload.data_7d)) {
            return historyPayload.data_7d.map((pt: any) => ({
              date: pt.timestamp,
              avgAQI: pt.aqi,
              minAQI: Math.max(10, pt.aqi - 15),
              maxAQI: pt.aqi + 20,
              dominant: 'PM2.5',
            }));
          }
        }
      } catch (err) {
        this.backendLive = false;
        console.warn('Live API history unavailable. Using local dataset:', err);
      }
    }

    await this.simulateNetworkDelay(200);
    const city = CITIES_DATA.find((c) => c.id.toLowerCase() === cityId.toLowerCase()) || CITIES_DATA[0];

    if (range === '24h') return city.historical24h;
    if (range === '7d') return city.historical7d;
    return city.historical30d;
  }

  /**
   * GET /api/forecast?city={cityId}&horizon={24|48|168}
   */
  public async getAQIForecast(
    cityId: string,
    horizon: '24h' | '48h' | '7d' = '24h'
  ): Promise<ForecastPoint[]> {
    const horizonHours = horizon === '24h' ? 24 : horizon === '48h' ? 48 : 168;

    if (this.mode === 'live') {
      try {
        const response = await fetch(
          `${API_BASE_URL}/forecast?city=${encodeURIComponent(cityId)}&horizon=${horizonHours}`
        );
        if (response.ok) {
          this.backendLive = true;
          const forecastData = await response.json();
          if (Array.isArray(forecastData.points) && forecastData.points.length > 0) {
            return forecastData.points.map((pt: any) => ({
              timestamp: pt.timestamp,
              timeLabel: pt.timestamp,
              predictedAQI: pt.predicted_aqi,
              lowerBound: pt.confidence_lower,
              upperBound: pt.confidence_upper,
              confidenceScore: Math.max(75, Math.round(95 - pt.hour_offset * 0.1)),
              dominantPollutant: 'pm25',
              primaryDriver: `${forecastData.model_name} Inference`,
              trend: pt.predicted_aqi > 100 ? 'deteriorating' : 'improving',
            }));
          }
        }
      } catch (err) {
        this.backendLive = false;
        console.warn('Live API forecast unavailable. Using local model dataset:', err);
      }
    }

    await this.simulateNetworkDelay(220);
    const city = CITIES_DATA.find((c) => c.id.toLowerCase() === cityId.toLowerCase()) || CITIES_DATA[0];

    if (horizon === '24h') return city.forecast24h;
    if (horizon === '48h') return city.forecast48h;
    return city.forecast7d;
  }

  /**
   * GET /api/health
   */
  public async getHealthStatus(): Promise<APIHealthResponse> {
    if (this.mode === 'live') {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
          this.backendLive = true;
          const data = await response.json();
          return {
            status: data.status === 'healthy' ? 'healthy' : 'degraded',
            version: data.version,
            timestamp: data.timestamp,
            backendConnected: true,
            modelEngine: 'Temporal Fusion Transformer v1.4',
            activeStations: 32,
            dataFreshnessSeconds: 120,
          };
        }
      } catch {
        this.backendLive = false;
      }
    }

    await this.simulateNetworkDelay(120);
    return {
      status: 'healthy',
      version: '1.0.0-offline',
      timestamp: new Date().toISOString(),
      backendConnected: false,
      modelEngine: 'Temporal Fusion Transformer v1.4',
      activeStations: 28,
      dataFreshnessSeconds: 180,
    };
  }

  /**
   * GET /api/model/metrics
   */
  public async getModelMetadata(): Promise<ModelMetadata> {
    if (this.mode === 'live') {
      try {
        const response = await fetch(`${API_BASE_URL}/model/metrics`);
        if (response.ok) {
          this.backendLive = true;
          const data = await response.json();
          return {
            modelName: data.model_name,
            version: '1.0.0',
            lastTrained: data.trained_at,
            architecture: data.algorithm,
            validationMAE: data.test_mae,
            validationRMSE: data.test_rmse,
            r2Score: data.test_r2,
            inputFeatures: data.features_used,
            dataSources: ['OpenAQ Sensor Network', 'Copernicus Atmospheric Ingestion'],
            status: 'operational',
          };
        }
      } catch (err) {
        console.warn('Live model metrics unavailable. Using cached metadata:', err);
      }
    }

    await this.simulateNetworkDelay(150);
    return MOCK_MODEL_METADATA;
  }

  /**
   * GET /api/aqi/status
   */
  public async getProviderStatus(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/aqi/status`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // offline
    }
    return {
      provider: 'Open-Meteo / Local Seed',
      key_configured: false,
      zero_key_mode: true,
      message: 'Operating in Zero-Key offline mode.',
    };
  }
}

export const api = new ApiService();
