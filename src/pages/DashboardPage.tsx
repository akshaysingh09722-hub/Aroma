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
import { CityMapPlaceholder } from '../components/dashboard/CityMapPlaceholder';
import { DemoNotice } from '../components/common/DemoNotice';
import { FloatingARButton } from '../components/dashboard/FloatingARButton';
import { ARView } from '../ar/ARView';
import { Thermometer, Droplets, Wind, RefreshCw } from 'lucide-react';

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
  const [showARModal, setShowARModal] = useState(false);

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

        {/* Search & Refresh Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <CitySearch
            selectedCityId={selectedCity.id}
            onSelectCity={handleCityChange}
            className="w-full sm:w-72"
          />

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all shrink-0"
            title="Refresh sample readings"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`}
            />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
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

      {/* Health Advisory Section */}
      <HealthAdvisory
        recommendations={selectedCity.healthRecommendations}
        category={selectedCity.category}
      />

      {/* Placeholder: AI Forecast Module (Member 3) */}
      <ForecastPlaceholder
        forecastData={selectedCity.forecast24h}
        cityName={selectedCity.name}
      />

      {/* Placeholder: City Map Spatial Module (Member 4) */}
      <CityMapPlaceholder
        cityName={selectedCity.name}
        stations={selectedCity.stations}
        latitude={selectedCity.latitude}
        longitude={selectedCity.longitude}
      />

      {/* Floating AR Visualization Option inside the Dashboard */}
      <FloatingARButton
        onClick={() => setShowARModal(true)}
        currentAQI={selectedCity.currentAQI}
        cityName={selectedCity.name}
      />

      {/* Modal AR Visualization Experience */}
      {showARModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 sm:p-6 my-auto max-h-[92vh] overflow-y-auto">
            <ARView
              initialAQI={selectedCity.currentAQI}
              initialCityName={selectedCity.name}
              onClose={() => setShowARModal(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
