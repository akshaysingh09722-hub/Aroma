import { GeoLocation } from './environmentalApi';

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  timezone?: string;
  population?: number;
  country?: string;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
  generationtime_ms?: number;
}

// Convert Open-Meteo geocoding result to app's GeoLocation format
export function mapGeocodingResultToGeoLocation(item: GeocodingResult): GeoLocation {
  const slug = item.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const regionParts = [item.admin1, item.admin2].filter(Boolean);
  const region = regionParts.length > 0 ? regionParts.join(', ') : item.country || '';

  return {
    id: `${slug}-${item.id || Math.abs(Math.round(item.latitude * 100))}`,
    name: item.name,
    country: item.country || item.country_code || 'Unknown',
    region,
    latitude: Number(item.latitude.toFixed(4)),
    longitude: Number(item.longitude.toFixed(4)),
    timezone: item.timezone,
    population: item.population,
    elevation: item.elevation,
    countryCode: item.country_code,
  };
}

// Search cache to avoid hammering geocoding API on repeat queries
const searchCache = new Map<string, GeoLocation[]>();

/**
 * Searches worldwide cities using Open-Meteo Geocoding API.
 */
export async function searchCitiesWorldwide(
  query: string,
  count: number = 8
): Promise<GeoLocation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const cacheKey = `${trimmed.toLowerCase()}_${count}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=${count}&language=en&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geocoding API responded with HTTP ${res.status}`);
    }

    const data: GeocodingResponse = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    const locations = data.results.map(mapGeocodingResultToGeoLocation);
    searchCache.set(cacheKey, locations);
    return locations;
  } catch (err) {
    console.warn('Geocoding search error:', err);
    return [];
  }
}
