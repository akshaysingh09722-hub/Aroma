import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityParam = searchParams.get('city') || 'tokyo';

  const [selectedCity, setSelectedCity] = useState<CityAirQualityRecord>(() => {
    return (
      CITIES_DATA.find((c) => c.id.toLowerCase() === cityParam.toLowerCase()) ||
      CITIES_DATA[0]
    );
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isARModalOpen, setIsARModalOpen] = useState(false);

  useEffect(() => {
    const found = CITIES_DATA.find(
      (c) => c.id.toLowerCase() === cityParam.toLowerCase()
    );
    if (found) {
      setSelectedCity(found);
    }
  }, [cityParam]);

  const handleCityChange = (city: CityAirQualityRecord) => {
    setSelectedCity(city);
    setSearchParams({ city: city.id });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const quickCities = ['tokyo', 'new-york', 'london', 'new-delhi', 'paris', 'los-angeles'];
  const hasHighPollutionAlert = selectedCity.currentAQI >= 100;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Demo Notice Banner */}
      <DemoNotice message="Dashboard data is currently loaded from curated local sample records for interface design and module testing." />

      {/* City Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Air Quality Dashboard
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Live Station Feed (Mocked)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-pollutant concentrations and regulatory health categories.
          </p>
        </div>

        {/* Search & Tool Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <CitySearch
            selectedCityId={selectedCity.id}
            onSelectCity={handleCityChange}
            className="w-full sm:w-60"
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
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all shrink-0"
              title="Compare with another city"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Compare</span>
            </button>

            {/* AI Copilot Button */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-all shrink-0"
              title="Open Environmental Copilot"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copilot</span>
            </button>

            {/* AR Visualization Button */}
            <button
              onClick={() => setIsARModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold shadow-sm shadow-emerald-500/20 transition-all shrink-0 active:scale-95"
              title="Launch Street AR Air Pollution Visualization"
            >
              <Scan className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AR View</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center p-2 sm:py-2.5 sm:px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm transition-all shrink-0"
              title="Refresh sample readings"
              aria-label="Refresh data"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Quick City Switcher Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider shrink-0">
          Quick Jump:
        </span>
        {quickCities.map((cid) => {
          const c = CITIES_DATA.find((item) => item.id === cid);
          if (!c) return null;
          const isSelected = c.id === selectedCity.id;
          return (
            <button
              key={cid}
              onClick={() => handleCityChange(c)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Weather Strip for Selected City */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-subtle text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Temp:{' '}
            <strong className="text-slate-800 font-bold">
              {selectedCity.weather.temperature}°C
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Droplets className="w-4 h-4 text-cyan-500 shrink-0" />
          <span>
            Humidity:{' '}
            <strong className="text-slate-800 font-bold">
              {selectedCity.weather.humidity}%
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Wind className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Wind:{' '}
            <strong className="text-slate-800 font-bold">
              {selectedCity.weather.windSpeed} km/h ({selectedCity.weather.windDirection})
            </strong>
          </span>
        </div>
        <div className="text-slate-500 truncate" title={selectedCity.weather.condition}>
          Atmosphere: <span className="text-slate-700">{selectedCity.weather.condition}</span>
        </div>
      </div>

      {isRefreshing ? (
        <div className="space-y-6">
          <LoadingSkeleton variant="card" count={1} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <LoadingSkeleton variant="card" count={6} />
          </div>
          <LoadingSkeleton variant="chart" />
        </div>
      ) : (
        <>
          {/* Main AQI Overview Hero Card */}
          <AQICard
            aqi={selectedCity.currentAQI}
            cityName={selectedCity.name}
            country={selectedCity.country}
            dominantPollutant={selectedCity.dominantPollutant}
            lastUpdated={selectedCity.lastUpdated}
            isDemo={true}
          />

          {/* Key Pollutant Cards: PM2.5, PM10, NO2, SO2, CO, O3 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Pollutant Breakdown
                </h2>
                <p className="text-xs text-slate-500">
                  Concentrations measured against EPA 24-hour health exposure limits
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                6 Criteria Pollutants
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Historical Trend Chart */}
          <HistoricalChart
            data24h={selectedCity.historical24h}
            data7d={selectedCity.historical7d}
            cityName={selectedCity.name}
          />
        </>
      )}

      {/* Health Advisory Section */}
      <HealthAdvisory
        recommendations={selectedCity.healthRecommendations}
        category={selectedCity.category}
      />

      {/* Interactive City Monitoring Station Leaflet Map */}
      <CityStationMap
        cityName={selectedCity.name}
        stations={selectedCity.stations}
        latitude={selectedCity.latitude}
        longitude={selectedCity.longitude}
      />

      {/* Predictive AI Forecast Module Card */}
      <ForecastPlaceholder
        forecastData={selectedCity.forecast24h}
        cityName={selectedCity.name}
      />

      {/* Street-Level AR Visualization Compact Feature Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 text-white border border-teal-500/30 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold tracking-wide uppercase">
              <Scan className="w-3.5 h-3.5" />
              <span>AR Visualization Module</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              See {selectedCity.name}&apos;s Air Pollution in Augmented Reality
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Overlay real-time WebGL particulate motes (PM2.5, PM10) and volumetric smog directly onto photos of local streets or stream live via your device camera. Adjust AQI from 0 to 500 to observe atmospheric dispersion changes.
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsARModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Scan className="w-4 h-4" />
              <span>Launch AR Mode</span>
            </button>
            <a
              href={`/ar?city=${selectedCity.id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              <span>Dedicated Page</span>
            </a>
          </div>
        </div>
      </div>

      {/* Floating AR Visualization Option Button inside Dashboard */}
      <button
        onClick={() => setIsARModalOpen(true)}
        className="fixed bottom-20 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-400 hover:via-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/30 border border-emerald-300/80 transition-all hover:scale-105 active:scale-95 group"
        title="Open Street AR Air Pollution Visualization"
        aria-label="Open Street AR Air Pollution Visualization"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950" />
        </span>
        <Scan className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
        <span className="tracking-tight">AR Visualization</span>
        <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
          3D
        </span>
      </button>

      {/* Modals & Overlays */}
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

      {/* AR Visualization Modal Overlay */}
      {isARModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="w-full max-w-7xl max-h-[96vh] overflow-y-auto bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 relative">
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
