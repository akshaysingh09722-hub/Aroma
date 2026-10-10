import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { CITIES_DATA } from '../../data/mockAirQualityData';
import { CityAirQualityRecord } from '../../types/airQuality';
import { getAQIScale } from '../../utils/aqiUtils';
import { AQIBadge } from '../common/AQIBadge';
import { X, ArrowRightLeft, Wind, Thermometer, Droplets, CheckCircle2 } from 'lucide-react';

interface CityCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCityA?: CityAirQualityRecord;
}

export const CityCompareModal: React.FC<CityCompareModalProps> = ({
  isOpen,
  onClose,
  defaultCityA = CITIES_DATA[0],
}) => {
  const [cityAId, setCityAId] = useState(defaultCityA.id);
  const [cityBId, setCityBId] = useState(
    CITIES_DATA.find((c) => c.id !== defaultCityA.id)?.id || CITIES_DATA[1].id
  );

  if (!isOpen) return null;

  const cityA = CITIES_DATA.find((c) => c.id === cityAId) || CITIES_DATA[0];
  const cityB = CITIES_DATA.find((c) => c.id === cityBId) || CITIES_DATA[1];

  const scaleA = getAQIScale(cityA.currentAQI);
  const scaleB = getAQIScale(cityB.currentAQI);

  // Pollutant comparison dataset
  const pollutantCompareData = [
    {
      name: 'PM2.5 (µg/m³)',
      [cityA.name]: cityA.pollutants.pm25.value,
      [cityB.name]: cityB.pollutants.pm25.value,
      limit: cityA.pollutants.pm25.standardLimit,
    },
    {
      name: 'PM10 (µg/m³)',
      [cityA.name]: cityA.pollutants.pm10.value,
      [cityB.name]: cityB.pollutants.pm10.value,
      limit: cityA.pollutants.pm10.standardLimit,
    },
    {
      name: 'NO2 (ppb)',
      [cityA.name]: cityA.pollutants.no2.value,
      [cityB.name]: cityB.pollutants.no2.value,
      limit: cityA.pollutants.no2.standardLimit,
    },
    {
      name: 'O3 (ppb)',
      [cityA.name]: cityA.pollutants.o3.value,
      [cityB.name]: cityB.pollutants.o3.value,
      limit: cityA.pollutants.o3.standardLimit,
    },
    {
      name: 'SO2 (ppb)',
      [cityA.name]: cityA.pollutants.so2.value,
      [cityB.name]: cityB.pollutants.so2.value,
      limit: cityA.pollutants.so2.standardLimit,
    },
    {
      name: 'CO (ppm)',
      [cityA.name]: cityA.pollutants.co.value,
      [cityB.name]: cityB.pollutants.co.value,
      limit: cityA.pollutants.co.standardLimit,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Metropolitan Air Quality Benchmark
              </h2>
              <p className="text-xs text-slate-400">
                Direct comparative telemetry and criteria pollutant metrics between two cities.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close comparison modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* City Selectors */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              City Benchmark A:
            </label>
            <select
              value={cityAId}
              onChange={(e) => setCityAId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              {CITIES_DATA.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country} (AQI {c.currentAQI})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              City Benchmark B:
            </label>
            <select
              value={cityBId}
              onChange={(e) => setCityBId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              {CITIES_DATA.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country} (AQI {c.currentAQI})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Side by side overview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City A Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{cityA.name}</h3>
                  <AQIBadge aqi={cityA.currentAQI} category={cityA.category} size="sm" />
                </div>
                <div
                  className="text-4xl font-black tabular-nums my-2"
                  style={{ color: scaleA.hex }}
                >
                  {cityA.currentAQI}
                </div>
                <p className="text-xs text-slate-500">
                  Dominant Driver: <strong className="text-slate-800 uppercase">{cityA.dominantPollutant}</strong>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                <span>{cityA.weather.temperature}°C</span>
                <span>{cityA.weather.humidity}% Hum</span>
                <span>{cityA.weather.windSpeed} km/h</span>
              </div>
            </div>

            {/* City B Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{cityB.name}</h3>
                  <AQIBadge aqi={cityB.currentAQI} category={cityB.category} size="sm" />
                </div>
                <div
                  className="text-4xl font-black tabular-nums my-2"
                  style={{ color: scaleB.hex }}
                >
                  {cityB.currentAQI}
                </div>
                <p className="text-xs text-slate-500">
                  Dominant Driver: <strong className="text-slate-800 uppercase">{cityB.dominantPollutant}</strong>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                <span>{cityB.weather.temperature}°C</span>
                <span>{cityB.weather.humidity}% Hum</span>
                <span>{cityB.weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>

          {/* Criteria Pollutant Side-by-Side Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Criteria Pollutants Concentrations Comparison
            </h4>
            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pollutantCompareData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: '1px solid #334155',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey={cityA.name} fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={cityB.name} fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            Close Benchmark
          </button>
        </div>
      </div>
    </div>
  );
};
