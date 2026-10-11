import React, { useState } from 'react';
import { useLocationContext } from '../context/LocationContext';
import { useEnvironmentalData } from '../context/EnvironmentalDataContext';
import { CITIES_DATA } from '../data/mockAirQualityData';
import { CityAirQualityRecord } from '../types/airQuality';
import { getAQIScale } from '../utils/aqiUtils';
import { AQIBadge } from '../components/common/AQIBadge';
import { GlobalCityMap } from '../components/maps/GlobalCityMap';
import { CityDetailModal } from '../components/common/CityDetailModal';
import { DemoNotice } from '../components/common/DemoNotice';
import { CitySearch } from '../components/common/CitySearch';
import {
  Search,
  MapPin,
  ArrowUpDown,
  LayoutGrid,
  Map,
  ArrowRight,
  Wind,
  Thermometer,
  Eye,
  CheckCircle2,
  ArrowRightLeft,
  Filter,
  Radio,
} from 'lucide-react';
import { CityCompareModal } from '../components/dashboard/CityCompareModal';

export const CityExplorerPage: React.FC = () => {
  const { selectedLocation, setSelectedLocation } = useLocationContext();
  const { data: activeLiveCity, mode } = useEnvironmentalData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'aqi-desc' | 'aqi-asc' | 'name'>('aqi-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [inspectedCity, setInspectedCity] = useState<CityAirQualityRecord | null>(null);
  const [compareCity, setCompareCity] = useState<CityAirQualityRecord | null>(null);

  const regions = ['All', 'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];
  const categories = ['All', 'Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'];

  // Combine curated benchmark cities with the currently selected live city if it's new
  const allCitiesList: CityAirQualityRecord[] = React.useMemo(() => {
    const list = [...CITIES_DATA];
    const existingIdx = list.findIndex(
      (c) => c.name.toLowerCase() === activeLiveCity.name.toLowerCase() || c.id === activeLiveCity.id
    );
    if (existingIdx !== -1) {
      list[existingIdx] = activeLiveCity;
    } else {
      list.unshift(activeLiveCity);
    }
    return list;
  }, [activeLiveCity]);

  const filteredCities = allCitiesList.filter((city) => {
    const matchesSearch =
      city.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase().trim());

    const matchesRegion =
      selectedRegion === 'All' ||
      city.continent === selectedRegion ||
      city.region.includes(selectedRegion);

    const matchesCategory =
      selectedCategory === 'All' ||
      city.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesRegion && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'aqi-desc') return b.currentAQI - a.currentAQI;
    if (sortBy === 'aqi-asc') return a.currentAQI - b.currentAQI;
    return a.name.localeCompare(b.name);
  });

  const handleSelectCity = (city: CityAirQualityRecord) => {
    setSelectedLocation({
      id: city.id,
      name: city.name,
      country: city.country,
      region: city.region,
      latitude: city.latitude,
      longitude: city.longitude,
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Notice Banner */}
      {mode === 'mock' ? (
        <DemoNotice message="City Explorer sample catalog active. 12 cities loaded with simulated meteorological and sensor data." />
      ) : (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs text-emerald-950 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>
              Worldwide City Explorer: search any metropolitan center on Earth. Currently focusing on{' '}
              <strong>{selectedLocation.name}, {selectedLocation.country}</strong>.
            </span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-900/10 px-2 py-0.5 rounded font-bold">
            Live Open-Meteo
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Global City Explorer
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {filteredCities.length} Cities
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare air quality benchmarks, primary pollutants, and environmental conditions across global metropolitan centers.
          </p>
        </div>

        {/* View Mode Toggle: Grid vs Map */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Worldwide Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Global Search Input */}
          <div className="md:col-span-5">
            <CitySearch
              selectedCityId={selectedLocation.id}
              className="w-full"
            />
          </div>

          {/* Quick Filter Search */}
          <div className="md:col-span-3 relative">
            <div className="absolute left-3.5 top-3 pointer-events-none text-slate-400">
              <Filter className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter catalog..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Region Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg === 'All' ? 'All Continents' : reg}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="aqi-desc">Highest AQI First</option>
              <option value="aqi-asc">Cleanest First</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main View: Grid vs Leaflet Map */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredCities.map((city) => {
            const scale = getAQIScale(city.currentAQI);
            const isSelected =
              city.name.toLowerCase() === selectedLocation.name.toLowerCase() ||
              city.id === selectedLocation.id;

            return (
              <div
                key={city.id}
                className={`rounded-2xl bg-white border p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4 ${
                  isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/90'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <h3 className="font-extrabold text-slate-900 text-sm truncate">
                          {city.name}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate ml-5">
                        {city.country} • {city.region}
                      </p>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-black tabular-nums shrink-0"
                      style={{
                        backgroundColor: `${scale.hex}18`,
                        color: scale.hex,
                      }}
                    >
                      AQI {city.currentAQI}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold" style={{ color: scale.hex }}>
                      {scale.category}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Primary:</span>
                    <span className="font-mono text-slate-800 font-semibold uppercase">
                      {city.dominantPollutant}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Weather:</span>
                    <span className="text-slate-700">
                      {city.weather.temperature}°C • {city.weather.humidity}%
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleSelectCity(city)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {isSelected ? 'Active Selection' : 'Select City'}
                  </button>

                  <button
                    onClick={() => setInspectedCity(city)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    title="Inspect city details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <GlobalCityMap
          cities={filteredCities}
          selectedCityId={selectedLocation.id}
          onSelectCity={handleSelectCity}
        />
      )}

      {/* Inspect Detail Modal */}
      {inspectedCity && (
        <CityDetailModal
          city={inspectedCity}
          onClose={() => setInspectedCity(null)}
        />
      )}
    </div>
  );
};
