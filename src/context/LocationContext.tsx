import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { GeoLocation } from '../services/environmentalApi';

export interface LocationContextType {
  selectedLocation: GeoLocation;
  setSelectedLocation: (loc: GeoLocation) => void;
  recentLocations: GeoLocation[];
  selectCityByNameOrCoords: (name: string, lat?: number, lng?: number, country?: string) => void;
}

export const DEFAULT_INITIAL_LOCATION: GeoLocation = {
  id: 'new-delhi',
  name: 'New Delhi',
  country: 'India',
  region: 'Delhi',
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 'Asia/Kolkata',
  population: 32941000,
  elevation: 216,
  countryCode: 'IN',
};

const STORAGE_KEY = 'aerosense_selected_location';
const RECENT_KEY = 'aerosense_recent_locations';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocationState] = useState<GeoLocation>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved location:', e);
    }
    return DEFAULT_INITIAL_LOCATION;
  });

  const [recentLocations, setRecentLocations] = useState<GeoLocation[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [
      DEFAULT_INITIAL_LOCATION,
      { id: 'tokyo', name: 'Tokyo', country: 'Japan', region: 'Kanto', latitude: 35.6762, longitude: 139.6503, countryCode: 'JP' },
      { id: 'london', name: 'London', country: 'United Kingdom', region: 'England', latitude: 51.5074, longitude: -0.1278, countryCode: 'GB' },
      { id: 'new-york', name: 'New York', country: 'United States', region: 'New York', latitude: 40.7128, longitude: -74.0060, countryCode: 'US' },
      { id: 'mumbai', name: 'Mumbai', country: 'India', region: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, countryCode: 'IN' },
    ];
  });

  const setSelectedLocation = useCallback((loc: GeoLocation) => {
    setSelectedLocationState(loc);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
      setRecentLocations((prev) => {
        const filtered = prev.filter((item) => item.id !== loc.id && !(item.latitude === loc.latitude && item.longitude === loc.longitude));
        const updated = [loc, ...filtered].slice(0, 10);
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn('Failed to persist location:', e);
    }
  }, []);

  const selectCityByNameOrCoords = useCallback((name: string, lat?: number, lng?: number, country?: string) => {
    if (lat !== undefined && lng !== undefined) {
      setSelectedLocation({
        id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name,
        country: country || '',
        region: country || '',
        latitude: lat,
        longitude: lng,
      });
    }
  }, [setSelectedLocation]);

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        recentLocations,
        selectCityByNameOrCoords,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export function useLocationContext(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
