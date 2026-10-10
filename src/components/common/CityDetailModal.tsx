import React from 'react';
import { Link } from 'react-router-dom';
import { CityAirQualityRecord } from '../../types/airQuality';
import { getAQIScale } from '../../utils/aqiUtils';
import { AQIBadge } from './AQIBadge';
import {
  X,
  MapPin,
  Wind,
  Thermometer,
  Droplets,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  Radio,
} from 'lucide-react';

interface CityDetailModalProps {
  city: CityAirQualityRecord | null;
  onClose: () => void;
}

export const CityDetailModal: React.FC<CityDetailModalProps> = ({
  city,
  onClose,
}) => {
  if (!city) return null;

  const scale = getAQIScale(city.currentAQI);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {city.continent} • {city.region}
            </span>
            <span className="text-xs text-slate-400">
              Pop: {(city.population / 1_000_000).toFixed(1)}M
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-4 mt-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {city.name}
              </h2>
              <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{city.country} • {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E</span>
              </p>
            </div>

            <AQIBadge aqi={city.currentAQI} category={city.category} size="lg" />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Big Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span
                className="text-5xl font-black tabular-nums tracking-tight"
                style={{ color: scale.hex }}
              >
                {city.currentAQI}
              </span>
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  EPA Index
                </div>
                <div className="text-xs text-slate-500">
                  Dominant: <strong className="text-slate-700 uppercase">{city.dominantPollutant}</strong>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 sm:max-w-xs leading-relaxed">
              {scale.description}
            </p>
          </div>

          {/* 6 Pollutants Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Criteria Pollutants Snapshot
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {Object.values(city.pollutants).map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 shadow-subtle flex flex-col justify-between"
                >
                  <span className="text-[11px] font-bold text-slate-500">{p.chemicalFormula}</span>
                  <div className="my-1">
                    <span className="text-base font-extrabold text-slate-900 tabular-nums">
                      {p.value}
                    </span>{' '}
                    <span className="text-[10px] text-slate-500 font-semibold">{p.unit}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Limit: {p.standardLimit} {p.unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weather & Station Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-600 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{city.weather.temperature}°C</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>{city.weather.humidity}% Hum</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2">
              <Wind className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{city.weather.windSpeed} km/h</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-500 shrink-0" />
              <span>{city.stations.length} Sensors</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>

          <Link
            to={`/forecast?city=${city.id}`}
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
            <span>View Forecast</span>
          </Link>

          <Link
            to={`/dashboard?city=${city.id}`}
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-all"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Open in Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
