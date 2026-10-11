import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEnvironmentalData } from '../context/EnvironmentalDataContext';
import { useLocationContext } from '../context/LocationContext';
import { CITIES_DATA } from '../data/mockAirQualityData';
import { CityAirQualityRecord } from '../types/airQuality';
import { CitySearch } from '../components/common/CitySearch';
import { AQICard } from '../components/common/AQICard';
import { PollutantCard } from '../components/common/PollutantCard';
import { HistoricalChart } from '../components/dashboard/HistoricalChart';
import { HealthAdvisory } from '../components/dashboard/HealthAdvisory';
import { ForecastPlaceholder } from '../components/dashboard/ForecastPlaceholder';
import { CityStationMap } from '../components/maps/CityStationMap';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { DemoNotice } from '../components/common/DemoNotice';
import { PollutionAlertModal } from '../components/alerts/PollutionAlertModal';
import { CityCompareModal } from '../components/dashboard/CityCompareModal';
import { EnvironmentalCopilot } from '../components/copilot/EnvironmentalCopilot';
import { ARView } from '../ar/ARView';
import {
  Thermometer,
  Droplets,
  Wind,
  RefreshCw,
  Bell,
  ArrowRightLeft,
  Bot,
  Activity,
  Scan,
  Sparkles,
  Globe,
  Radio,
  AlertCircle,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [, setSearchParams] = useSearchParams();
  const { selectedLocation, setSelectedLocation } = useLocationContext();
  const { data: selectedCity, loading, error, mode, refresh, lastFetchedAt } = useEnvironmentalData();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isARModalOpen, setIsARModalOpen] = useState(false);

  const handleCityChange = (city: CityAirQualityRecord) => {
    setSelectedLocation({
      id: city.id,
      name: city.name,
      country: city.country,
      region: city.region,
      latitude: city.latitude,
      longitude: city.longitude,
    });
    setSearchParams({ city: city.name.toLowerCase() });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const quickCities = [
    { name: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
    { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
    { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
    { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060 },
    { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
    { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  ];

  const hasHighPollutionAlert = selectedCity.currentAQI >= 100;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Dynamic Data Mode Banner */}
      {mode === 'mock' ? (
        <DemoNotice message="Demo Mock Mode active. Displaying curated baseline records. Switch to Live API in top navigation bar for real-time worldwide data." />
      ) : (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 sm:p-4 text-xs sm:text-sm text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-emerald-900">
                Live Environmental Satellite & Station Telemetry:
              </span>{' '}
              <span className="text-emerald-800">
                Data dynamically sourced from Open-Meteo & Copernicus Atmospheric Monitoring Service (CAMS) for {selectedLocation.name}, {selectedLocation.country}.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono bg-emerald-900/10 text-emerald-900 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
              CPCB NAQI Computed • Real-Time
            </span>
          </div>
        </div>
      )}

      {/* Error notification if API failed */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Notice: {error} Displaying cached or fallback environmental measurements.</span>
        </div>
      )}

      {/* City Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Air Quality Dashboard
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {mode === 'mock' ? 'Demo Mode' : 'Live Data: Worldwide'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-pollutant concentrations and regulatory health categories for {selectedCity.name}, {selectedCity.country}.
          </p>
        </div>

        {/* Search & Tool Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <CitySearch
            selectedCityId={selectedCity.id}
            onSelectCity={handleCityChange}
            className="w-full sm:w-72"
          />

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {/* Alert Rules Button */}
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className={`relative inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl border text-xs font-semibold shadow-sm transition-all shrink-0 ${
                hasHighPollutionAlert
                  ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Configure pollution threshold alerts"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Alerts</span>
              {hasHighPollutionAlert && (
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5 animate-ping" />
              )}
            </button>

            {/* Compare Cities Button */}
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all shrink-0"
              title="Benchmark two cities side-by-side"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compare</span>
            </button>

            {/* Copilot Action Button */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-sm transition-all shrink-0"
              title="Open AI Environmental Copilot"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Copilot</span>
            </button>

            {/* In-Place AR Modal Launcher */}
            <button
              onClick={() => setIsARModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all shrink-0"
              title="Preview in Augmented Reality"
            >
              <Scan className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">AR View</span>
            </button>

            {/* Refresh Live Data */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 shrink-0"
              title="Refresh telemetry"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing || loading ? 'animate-spin text-emerald-600' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Quick City Navigation Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider shrink-0">
          Worldwide Cities:
        </span>
        {quickCities.map((q) => {
          const isSelected = selectedLocation.name.toLowerCase() === q.name.toLowerCase();
          return (
            <button
              key={q.name}
              onClick={() => {
                setSelectedLocation({
                  id: q.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                  name: q.name,
                  country: q.country,
                  region: q.country,
                  latitude: q.lat,
                  longitude: q.lng,
                });
                setSearchParams({ city: q.name.toLowerCase() });
              }}
              className={`px-3 py-1 rounded-lg border font-semibold transition-all shrink-0 ${
                isSelected
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {q.name}
            </button>
          );
        })}
      </div>

      {/* Weather & Atmospheric Conditions Strip */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-slate-600">
            <Thermometer className="w-4 h-4 text-amber-500" />
            <span>Temperature:</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {selectedCity.weather.temperature}°C
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Droplets className="w-4 h-4 text-cyan-500" />
            <span>Relative Humidity:</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {selectedCity.weather.humidity}%
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Wind className="w-4 h-4 text-emerald-500" />
            <span>Surface Wind:</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {selectedCity.weather.windSpeed} km/h ({selectedCity.weather.windDirection})
            </span>
          </div>

          <div className="text-slate-500 truncate" title={selectedCity.weather.condition}>
            Atmosphere: <span className="text-slate-700 font-semibold">{selectedCity.weather.condition}</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-emerald-500" />
          <span>Coords: {selectedLocation.latitude.toFixed(2)}°, {selectedLocation.longitude.toFixed(2)}°</span>
          {lastFetchedAt && (
            <span className="hidden md:inline">• Synced {lastFetchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      </div>

      {/* Primary AQI Headline Banner */}
      <AQICard
        aqi={selectedCity.currentAQI}
        cityName={selectedCity.name}
        country={selectedCity.country}
        dominantPollutant={selectedCity.dominantPollutant}
        lastUpdated={selectedCity.lastUpdated}
        isDemo={mode === 'mock'}
      />

      {/* Criteria Pollutant Breakdown Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Criteria Pollutants Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Continuous multi-pollutant concentrations versus national ambient air standards.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            6 Criteria Pollutants
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <PollutantCard
            pollutant={selectedCity.pollutants.pm25}
            isPrimary={selectedCity.dominantPollutant === 'pm25'}
          />
          <PollutantCard
            pollutant={selectedCity.pollutants.pm10}
            isPrimary={selectedCity.dominantPollutant === 'pm10'}
          />
          <PollutantCard
            pollutant={selectedCity.pollutants.no2}
            isPrimary={selectedCity.dominantPollutant === 'no2'}
          />
          <PollutantCard
            pollutant={selectedCity.pollutants.so2}
            isPrimary={selectedCity.dominantPollutant === 'so2'}
          />
          <PollutantCard
            pollutant={selectedCity.pollutants.co}
            isPrimary={selectedCity.dominantPollutant === 'co'}
          />
          <PollutantCard
            pollutant={selectedCity.pollutants.o3}
            isPrimary={selectedCity.dominantPollutant === 'o3'}
          />
        </div>
      </div>

      {/* Historical Trend Chart & Health Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <HistoricalChart
            data24h={selectedCity.historical24h}
            data7d={selectedCity.historical7d}
            cityName={selectedCity.name}
          />
        </div>

        <div className="lg:col-span-4">
          <HealthAdvisory
            recommendations={selectedCity.healthRecommendations}
            category={selectedCity.category}
          />
        </div>
      </div>

      {/* Leaflet Spatial Monitoring Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Ground Stations & Sensor Network
            </h2>
            <p className="text-xs text-slate-500">
              Spatial distribution of monitoring stations across the {selectedCity.name} metropolitan grid.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            OSM / CartoDB Tile Layer
          </span>
        </div>

        <CityStationMap
          cityName={selectedCity.name}
          stations={selectedCity.stations}
          latitude={selectedLocation.latitude}
          longitude={selectedLocation.longitude}
        />
      </div>

      {/* Predictive Forecast Teaser */}
      <ForecastPlaceholder
        cityName={selectedCity.name}
        forecastData={selectedCity.forecast24h}
      />

      {/* Modals & Slide-overs */}
      <PollutionAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        city={selectedCity}
      />

      <CityCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        defaultCityA={selectedCity}
      />

      <EnvironmentalCopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        city={selectedCity}
      />

      {/* In-place AR View Modal */}
      {isARModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            <ARView
              initialAQI={selectedCity.currentAQI}
              initialCityName={selectedCity.name}
              onClose={() => setIsARModalOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
