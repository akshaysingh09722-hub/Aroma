import {
  CityAirQualityRecord,
  HistoricalReading,
  ForecastPoint,
  APIHealthResponse,
  ModelMetadata,
} from '../types/airQuality';
import { CITIES_DATA, MOCK_MODEL_METADATA } from '../data/mockAirQualityData';

export type DataSourceMode = 'mock' | 'live';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api';

class ApiService {
  private mode: DataSourceMode = 'mock';
  private listeners: Set<(mode: DataSourceMode) => void> = new Set();

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

  private async simulateNetworkDelay(ms: number = 280): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * GET /api/cities
   * Retrieve list of cities with current summary and pollutant snapshot
   */
  public async getCities(query?: string, region?: string): Promise<CityAirQualityRecord[]> {
    if (this.mode === 'live') {
      try {
        const url = new URL(`${API_BASE_URL}/cities`);
        if (query) url.searchParams.set('q', query);
        if (region && region !== 'All') url.searchParams.set('region', region);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Live API error: ${response.status} ${response.statusText}`);
        return await response.json();
      } catch (err) {
        console.warn('Live API unavailable. Falling back to mock data:', err);
      }
    }

    await this.simulateNetworkDelay(200);
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
    if (this.mode === 'live') {
      try {
        const response = await fetch(`${API_BASE_URL}/aqi/current?city=${encodeURIComponent(cityId)}`);
        if (!response.ok) throw new Error(`Failed to fetch current AQI: ${response.statusText}`);
        return await response.json();
      } catch (err) {
        console.warn(`Live API error for ${cityId}. Falling back to mock data:`, err);
      }
    }

    await this.simulateNetworkDelay(300);
    const city = CITIES_DATA.find(
      (c) => c.id.toLowerCase() === cityId.toLowerCase() || c.name.toLowerCase() === cityId.toLowerCase()
    );

    if (!city) {
      // Fallback to first city
      return CITIES_DATA[0];
    }
    return city;
  }

  /**
   * GET /api/aqi/history?city={cityId}&range={24h|7d|30d}
   */
  public async getAQIHistory(
    cityId: string,
    range: '24h' | '7d' | '30d' = '24h'
  ): Promise<HistoricalReading[] | any[]> {
    if (this.mode === 'live') {
      try {
        const response = await fetch(
          `${API_BASE_URL}/aqi/history?city=${encodeURIComponent(cityId)}&range=${range}`
        );
        if (!response.ok) throw new Error(`Failed to fetch AQI history: ${response.statusText}`);
        return await response.json();
      } catch (err) {
        console.warn('Live API history unavailable. Using mock dataset:', err);
      }
    }

    await this.simulateNetworkDelay(250);
    const city = (await this.getCurrentAQI(cityId)) || CITIES_DATA[0];

    if (range === '24h') return city.historical24h;
    if (range === '7d') return city.historical7d;
    return city.historical30d;
  }

  /**
   * GET /api/aqi/forecast?city={cityId}&horizon={24h|48h|7d}
   */
  public async getAQIForecast(
    cityId: string,
    horizon: '24h' | '48h' | '7d' = '24h'
  ): Promise<ForecastPoint[]> {
    if (this.mode === 'live') {
      try {
        const response = await fetch(
          `${API_BASE_URL}/aqi/forecast?city=${encodeURIComponent(cityId)}&horizon=${horizon}`
        );
        if (!response.ok) throw new Error(`Failed to fetch AQI forecast: ${response.statusText}`);
        return await response.json();
      } catch (err) {
        console.warn('Live API forecast unavailable. Using mock dataset:', err);
      }
    }

    await this.simulateNetworkDelay(320);
    const city = (await this.getCurrentAQI(cityId)) || CITIES_DATA[0];

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
          const data = await response.json();
          return {
            ...data,
            backendConnected: true,
          };
        }
      } catch {
        // Backend offline
      }
    }

    await this.simulateNetworkDelay(120);
    return {
      status: 'healthy',
      version: '1.4.2-preview',
      timestamp: new Date().toISOString(),
      backendConnected: false,
      modelEngine: 'Temporal Fusion Transformer v1.4',
      activeStations: 28,
      dataFreshnessSeconds: 180,
    };
  }

  /**
   * GET /api/model/info
   */
  public async getModelMetadata(): Promise<ModelMetadata> {
    await this.simulateNetworkDelay(150);
    return MOCK_MODEL_METADATA;
  }
}

export const api = new ApiService();
