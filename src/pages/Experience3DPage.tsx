import React, { useState, useEffect } from 'react';
import { CITIES_DATA } from '../data/mockAirQualityData';
import { CityAirQualityRecord } from '../types/airQuality';
import { UrbanPollution3DCanvas } from '../components/three/UrbanPollution3DCanvas';
import { AQI_LEVELS, getAQIScale } from '../utils/aqiUtils';
import { DemoNotice } from '../components/common/DemoNotice';
import {
  Layers,
  Wind,
  Glasses,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export const Experience3DPage: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityAirQualityRecord>(
    CITIES_DATA[0]
  );
  const [simulatedAQI, setSimulatedAQI] = useState<number>(
    selectedCity.currentAQI
  );
  const [windSpeed, setWindSpeed] = useState<number>(14);
  const [showBoundaryLayer, setShowBoundaryLayer] = useState<boolean>(true);
  const [arSupported, setArSupported] = useState<boolean | null>(null);

  // Sync simulated AQI when city changes
  useEffect(() => {
    setSimulatedAQI(selectedCity.currentAQI);
    setWindSpeed(selectedCity.weather.windSpeed);
  }, [selectedCity]);

  // Check WebXR AR capability
  useEffect(() => {
    if ('xr' in navigator && (navigator as any).xr?.isSessionSupported) {
      (navigator as any).xr
        .isSessionSupported('immersive-ar')
        .then((supported: boolean) => setArSupported(supported))
        .catch(() => setArSupported(false));
    } else {
      setArSupported(false);
    }
  }, []);

  const handleResetSimulation = () => {
    setSimulatedAQI(selectedCity.currentAQI);
    setWindSpeed(selectedCity.weather.windSpeed);
    setShowBoundaryLayer(true);
  };

  const currentScale = getAQIScale(simulatedAQI);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Notice Banner */}
      <DemoNotice message="3D Urban Simulation Prototype. Uses WebGL procedural rendering and volumetric particle dispersion based on atmospheric mechanics." />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              3D Urban Pollution & Dispersion Engine
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
              Three.js WebGL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore volumetric particulate smog, wind vectors, and boundary layer capping over procedural metropolitan blocks.
          </p>
        </div>

        {/* AR Status Badge */}
        <div className="flex items-center gap-2">
          {arSupported ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>WebXR AR Device Ready</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold" title="WebXR immersive-ar requires compatible Android/iOS AR headset/device">
              <Glasses className="w-4 h-4 text-slate-500" />
              <span>3D Desktop View (AR Simulated)</span>
            </span>
          )}
        </div>
      </div>

      {/* Interactive Control Deck */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Atmospheric Simulation Controls
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSimulation}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to City Actuals</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 text-xs">
          {/* City Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Metropolitan Target:
            </label>
            <select
              value={selectedCity.id}
              onChange={(e) => {
                const found = CITIES_DATA.find((c) => c.id === e.target.value);
                if (found) setSelectedCity(found);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
            >
              {CITIES_DATA.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country} (AQI {c.currentAQI})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 block">
              Observed AQI: {selectedCity.currentAQI} ({selectedCity.category})
            </span>
          </div>

          {/* AQI Intensity Slider */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex justify-between items-baseline">
              <label className="font-bold text-slate-700">
                Pollution Concentration (AQI):
              </label>
              <span
                className="font-black text-sm tabular-nums px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${currentScale.hex}20`,
                  color: currentScale.hex,
                }}
              >
                AQI {simulatedAQI} — {currentScale.category}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="450"
              value={simulatedAQI}
              onChange={(e) => setSimulatedAQI(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Clean (10)</span>
              <span>Moderate (75)</span>
              <span>Unhealthy (160)</span>
              <span>Hazardous (350+)</span>
            </div>
          </div>

          {/* Wind Speed Slider & Boundary Layer Toggle */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="font-bold text-slate-700">Wind Transport:</label>
                <span className="font-semibold text-slate-900">{windSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="2"
                max="45"
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={showBoundaryLayer}
                onChange={(e) => setShowBoundaryLayer(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-slate-700 text-xs">
                Show Inversion Layer Ring
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 3D Canvas Scene */}
      <UrbanPollution3DCanvas
        aqi={simulatedAQI}
        cityName={selectedCity.name}
        windSpeed={windSpeed}
        showBoundaryLayer={showBoundaryLayer}
      />

      {/* Pollution Intensity Visual Legend */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Volumetric Smog Intensity Scale
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            EPA Standard Intervals
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {AQI_LEVELS.map((lvl) => {
            const isActive = lvl.category === currentScale.category;
            return (
              <div
                key={lvl.category}
                className={`p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : 'border-slate-200/80 bg-slate-50/60 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: lvl.hex }}
                  />
                  <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    {lvl.range}
                  </span>
                </div>
                <div className="font-bold text-xs truncate mb-1">
                  {lvl.category}
                </div>
                <div className={`text-[10px] line-clamp-2 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                  {lvl.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Educational Handoff Info */}
      <div className="rounded-2xl bg-slate-100 border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-cyan-600 shrink-0" />
          <span>
            <strong>Simulated Dispersion Physics:</strong> Aerosol particle velocity in the 3D scene responds directly to the surface boundary layer height and horizontal wind vector.
          </span>
        </div>
        <span className="font-mono text-slate-500 text-[11px] bg-white px-2.5 py-1 rounded border border-slate-200 shrink-0">
          Member 4 3D Visualization Milestone
        </span>
      </div>
    </div>
  );
};
