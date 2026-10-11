import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CityAirQualityRecord } from '../types/airQuality';
import { useLocationContext } from './LocationContext';
import { fetchEnvironmentalData } from '../services/environmentalApi';
import { api, DataSourceMode } from '../services/api';
import { CITIES_DATA } from '../data/mockAirQualityData';

export interface EnvironmentalDataContextType {
  data: CityAirQualityRecord;
  loading: boolean;
  error: string | null;
  mode: DataSourceMode;
  setMode: (mode: DataSourceMode) => void;
  refresh: () => Promise<void>;
  lastFetchedAt: Date | null;
}

const EnvironmentalDataContext = createContext<EnvironmentalDataContextType | undefined>(undefined);

export const EnvironmentalDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { selectedLocation } = useLocationContext();
  const [mode, setModeState] = useState<DataSourceMode>(api.getMode());
  const [data, setData] = useState<CityAirQualityRecord>(() => {
    // Initial placeholder matching selectedLocation or default CITIES_DATA[0]
    const matched = CITIES_DATA.find(
      (c) => c.name.toLowerCase() === selectedLocation.name.toLowerCase() || c.id === selectedLocation.id
    );
    if (matched) return matched;
    const base = CITIES_DATA[0];
    return {
      ...base,
      id: selectedLocation.id,
      name: selectedLocation.name,
      country: selectedLocation.country,
      region: selectedLocation.region,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    };
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  // Sync mode changes from api service
  useEffect(() => {
    return api.subscribeModeChange((newMode) => {
      setModeState(newMode);
    });
  }, []);

  const setMode = useCallback((newMode: DataSourceMode) => {
    api.setMode(newMode);
    setModeState(newMode);
  }, []);

  const loadData = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setError(null);

      if (mode === 'mock') {
        // Find closest mock city or mock default
        const mockFound = CITIES_DATA.find(
          (c) => c.id.toLowerCase() === selectedLocation.id.toLowerCase() ||
                 c.name.toLowerCase() === selectedLocation.name.toLowerCase()
        ) || CITIES_DATA[0];

        setData({
          ...mockFound,
          id: selectedLocation.id,
          name: selectedLocation.name,
          country: selectedLocation.country,
          region: selectedLocation.region,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        });
        setLoading(false);
        setLastFetchedAt(new Date());
        return;
      }

      // Real live API mode
      try {
        const liveRecord = await fetchEnvironmentalData(selectedLocation, { forceRefresh });
        setData(liveRecord);
        setError(null);
        setLastFetchedAt(new Date());
      } catch (err: any) {
        console.error('Failed to fetch real environmental data:', err);
        setError(err.message || 'Unable to retrieve live environmental measurements.');
        // Provide graceful fallback record with unavailable indicator
        const base = CITIES_DATA[0];
        setData((prev) => ({
          ...prev,
          name: selectedLocation.name,
          country: selectedLocation.country,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          isStale: true,
        }));
      } finally {
        setLoading(false);
      }
    },
    [selectedLocation, mode]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  return (
    <EnvironmentalDataContext.Provider
      value={{
        data,
        loading,
        error,
        mode,
        setMode,
        refresh,
        lastFetchedAt,
      }}
    >
      {children}
    </EnvironmentalDataContext.Provider>
  );
};

export function useEnvironmentalData(): EnvironmentalDataContextType {
  const context = useContext(EnvironmentalDataContext);
  if (!context) {
    throw new Error('useEnvironmentalData must be used within an EnvironmentalDataProvider');
  }
  return context;
}
