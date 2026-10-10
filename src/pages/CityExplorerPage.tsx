import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CITIES_DATA } from '../data/mockAirQualityData';
import { getAQIScale } from '../utils/aqiUtils';
import { AQIBadge } from '../components/common/AQIBadge';
import { ModulePlaceholder } from '../components/common/ModulePlaceholder';
import { DemoNotice } from '../components/common/DemoNotice';
import {
  Search,
  MapPin,
  ArrowUpDown,
  Compass,
  ArrowRight,
  Wind,
  Thermometer,
} from 'lucide-react';

export const CityExplorerPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [sortBy, setSortBy] = useState<'aqi-desc' | 'aqi-asc' | 'name'>('aqi-desc');

  const regions = ['All', 'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];

  const filteredCities = CITIES_DATA.filter((city) => {
    const matchesSearch =
      city.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase().trim());

    const matchesRegion =
      selectedRegion === 'All' ||
      city.continent === selectedRegion ||
      city.region.includes(selectedRegion);

    return matchesSearch && matchesRegion;
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
      </div>

      {/* City Cards Grid */}
      {filteredCities.length === 0 ? (
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

                {/* View Details Link */}
                <Link
                  to={`/dashboard?city=${city.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-xs font-bold text-slate-800 transition-all group-hover:bg-emerald-600 group-hover:text-white"
                >
                  <span>Open in Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Member 4 Spatial Map Placeholder */}
      <ModulePlaceholder
        title="Interactive Multi-City Geospatial Map"
        subtitle="Full Leaflet/Mapbox vector layer embedding with dynamic AQI heat circles and station clusters."
        assignedMember="Team Member 4"
        memberRole="Geospatial & 3D Visualization Specialist"
        targetFile="src/components/maps/GlobalCityMap.tsx"
        icon={Compass}
        badgeText="Spatial GIS Module"
      >
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-xs text-slate-600">
            <span className="font-bold text-slate-900 block">
              Global Station Coordinate Grid Ready
            </span>
            <p>
              Pre-configured with coordinates for all 12 cities across 5 continents with custom SVG marker pins.
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-semibold shrink-0">
            Endpoint: GET /api/cities?view=map
          </span>
        </div>
      </ModulePlaceholder>
    </div>
  );
};
