import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CITIES_DATA } from '../data/mockAirQualityData';
import { CityAirQualityRecord } from '../types/airQuality';
import { getAQIScale } from '../utils/aqiUtils';
import { AQIBadge } from '../components/common/AQIBadge';
import { GlobalCityMap } from '../components/maps/GlobalCityMap';
import { CityDetailModal } from '../components/common/CityDetailModal';
import { DemoNotice } from '../components/common/DemoNotice';
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
} from 'lucide-react';
import { CityCompareModal } from '../components/dashboard/CityCompareModal';

export const CityExplorerPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'aqi-desc' | 'aqi-asc' | 'name'>('aqi-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [inspectedCity, setInspectedCity] = useState<CityAirQualityRecord | null>(null);
  const [compareCity, setCompareCity] = useState<CityAirQualityRecord | null>(null);

  const regions = ['All', 'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];
  const categories = ['All', 'Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy'];

  const filteredCities = CITIES_DATA.filter((city) => {
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

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Demo Notice Banner */}
      <DemoNotice message="City Explorer sample catalog active. 12 cities loaded with simulated meteorological and sensor data." />

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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city name or country (e.g., Tokyo, London, India)..."
              className="w-full pl-9 pr-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs self-end sm:self-auto shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-500 uppercase text-[11px]">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="aqi-desc">Worst Air Quality (Highest AQI)</option>
              <option value="aqi-asc">Best Air Quality (Lowest AQI)</option>
              <option value="name">City Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Region Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Continent:
          </span>
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 border ${
                selectedRegion === reg
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>

        {/* AQI Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>AQI Scale:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all shrink-0 border ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Map View or Grid View */}
      {viewMode === 'map' ? (
        <div className="space-y-6">
          <GlobalCityMap
            cities={filteredCities}
            selectedCityId={inspectedCity?.id}
            onSelectCity={(city) => setInspectedCity(city)}
          />

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span className="font-semibold">
              Tip: Click any marker on the world map to open the full meteorological & sensor telemetry modal.
            </span>
            <button
              onClick={() => setViewMode('grid')}
              className="text-emerald-700 font-bold hover:underline shrink-0"
            >
              Switch back to Grid View &rarr;
            </button>
          </div>
        </div>
      ) : filteredCities.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-3">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No cities match "{searchQuery}"
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or reset the continent filter to see all 12 available cities.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRegion('All');
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCities.map((city) => {
            const scale = getAQIScale(city.currentAQI);

            return (
              <div
                key={city.id}
                className="rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all p-5 sm:p-6 flex flex-col justify-between group"
              >
                <div>
                  {/* City Title and AQI Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {city.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span>{city.country}</span>
                        <span>•</span>
                        <span>{city.region}</span>
                      </p>
                    </div>

                    <AQIBadge aqi={city.currentAQI} category={city.category} size="sm" />
                  </div>

                  {/* Big Number and Primary Pollutant */}
                  <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Current AQI
                      </div>
                      <div
                        className="text-3xl font-black tabular-nums"
                        style={{ color: scale.hex }}
                      >
                        {city.currentAQI}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Primary Driver
                      </div>
                      <div className="text-sm font-bold text-slate-800 uppercase flex items-center gap-1 justify-end">
                        <Wind className="w-3.5 h-3.5 text-slate-400" />
                        <span>{city.dominantPollutant}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {city.pollutants[city.dominantPollutant].value}{' '}
                        {city.pollutants[city.dominantPollutant].unit}
                      </span>
                    </div>
                  </div>

                  {/* Pollutant metrics comparison */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100/80">
                      <span className="text-[11px] text-slate-500 block">PM2.5:</span>
                      <span className="font-bold text-slate-800">
                        {city.pollutants.pm25.value} µg/m³
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100/80">
                      <span className="text-[11px] text-slate-500 block">PM10:</span>
                      <span className="font-bold text-slate-800">
                        {city.pollutants.pm10.value} µg/m³
                      </span>
                    </div>
                  </div>

                  {/* Weather snapshot */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4 pb-3 border-b border-slate-100">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-500" />
                      {city.weather.temperature}°C, {city.weather.condition}
                    </span>
                    <span>{city.stations.length} Stations</span>
                  </div>
                </div>

                {/* Actions: Quick Inspect + Compare + Open in Dashboard */}
                <div className="grid grid-cols-3 gap-1.5 pt-2">
                  <button
                    onClick={() => setInspectedCity(city)}
                    className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors"
                    title="Quick inspect telemetry"
                  >
                    <Eye className="w-3 h-3 text-slate-500" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => setCompareCity(city)}
                    className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors"
                    title="Benchmark against another city"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                    <span>Compare</span>
                  </button>

                  <Link
                    to={`/dashboard?city=${city.id}`}
                    className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-[11px] font-bold text-white transition-all shadow-sm"
                  >
                    <span>Dashboard</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Member 4 Integration Status */}
      <div className="rounded-2xl bg-slate-100 border border-slate-200/80 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Interactive Geospatial Leaflet Engine Live
            </h4>
            <p className="text-xs text-slate-600">
              Assigned to Team Member 4 (Geospatial & 3D). Active Leaflet coordinate grid with dynamic AQI color scale markers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
          className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-all shrink-0 shadow-sm"
        >
          Toggle {viewMode === 'grid' ? 'World Map View' : 'Card Grid View'}
        </button>
      </div>

      {/* City Detail Modal */}
      <CityDetailModal
        city={inspectedCity}
        onClose={() => setInspectedCity(null)}
      />

      {/* City Comparison Modal */}
      <CityCompareModal
        isOpen={!!compareCity}
        onClose={() => setCompareCity(null)}
        defaultCityA={compareCity || undefined}
      />
    </div>
  );
};
