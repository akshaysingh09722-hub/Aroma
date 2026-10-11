export type AQICategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe'
  | 'Insufficient Data'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Hazardous';

export type PollutantType = 'pm25' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3' | 'nh3' | 'pb';

export interface PollutantMeasurement {
  id: PollutantType;
  name: string;
  chemicalFormula: string;
  value: number;
  unit: string;
  standardLimit: number; // EPA or WHO primary 24h standard
  category: AQICategory;
  aqiContribution: number;
  description: string;
  healthImpact: string;
}

export interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: string; // e.g. 'NW', 'SSE'
  pressure: number; // hPa
  uvIndex: number;
  visibilityKm: number;
  condition: string;
}

export interface MonitoringStation {
  id: string;
  name: string;
  stationCode: string;
  latitude: number;
  longitude: number;
  currentAQI: number;
  dominantPollutant: string;
  status: 'active' | 'maintenance' | 'offline';
  sensorType: 'Reference Optical Particle' | 'BAM Beta Attenuation' | 'Electrochemical Micro-sensor';
  elevationMeters: number;
  lastReported: string;
}

export interface HistoricalReading {
  timestamp: string;
  timeLabel: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  temperature?: number;
  humidity?: number;
}

export interface ForecastPoint {
  timestamp: string;
  timeLabel: string;
  predictedAQI: number;
  lowerBound: number; // 95% Confidence Interval lower
  upperBound: number; // 95% Confidence Interval upper
  confidenceScore: number; // 0 - 100%
  dominantPollutant: string;
  primaryDriver: string;
  trend: 'improving' | 'stable' | 'deteriorating';
}

export interface HealthRecommendations {
  general: string;
  sensitiveGroups: string;
  outdoorActivities: string;
  ventilation: string;
  masksAndProtection: string;
}

export interface CityAirQualityRecord {
  id: string;
  name: string;
  country: string;
  continent: string;
  region: string;
  latitude: number;
  longitude: number;
  population: number;
  elevationMeters: number;
  climateZone: string;
  currentAQI: number;
  dominantPollutant: PollutantType;
  category: AQICategory;
  pollutants: Record<PollutantType, PollutantMeasurement>;
  weather: WeatherData;
  stations: MonitoringStation[];
  historical24h: HistoricalReading[];
  historical7d: Array<{ date: string; avgAQI: number; minAQI: number; maxAQI: number; dominant: string }>;
  historical30d: Array<{ date: string; avgAQI: number }>;
  forecast24h: ForecastPoint[];
  forecast48h: ForecastPoint[];
  forecast7d: ForecastPoint[];
  healthRecommendations: HealthRecommendations;
  lastUpdated: string;
  isStale?: boolean;
}

export interface ModelMetadata {
  modelName: string;
  version: string;
  architecture: string;
  lastTrained: string;
  validationMAE: number;
  validationRMSE: number;
  r2Score: number;
  inputFeatures: string[];
  dataSources: string[];
  status: 'operational' | 'training' | 'degraded';
}

export interface APIHealthResponse {
  status: 'healthy' | 'degraded';
  version: string;
  timestamp: string;
  backendConnected: boolean;
  modelEngine: 'Temporal Fusion Transformer v1.4';
  activeStations: number;
  dataFreshnessSeconds: number;
}
