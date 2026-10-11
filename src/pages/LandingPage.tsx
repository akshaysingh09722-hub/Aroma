import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wind,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  MapPin,
  Sparkles,
  Boxes,
  SlidersHorizontal,
  Bot,
  Radio,
} from 'lucide-react';
import { useEnvironmentalData } from '../context/EnvironmentalDataContext';
import { useLocationContext } from '../context/LocationContext';
import { getAQIScale } from '../utils/aqiUtils';
import { DemoNotice } from '../components/common/DemoNotice';
import { AtmosphericHeroCanvas } from '../components/three/AtmosphericHeroCanvas';

export const LandingPage: React.FC = () => {
  const { selectedLocation } = useLocationContext();
  const { data: sampleCity, mode } = useEnvironmentalData();
  const scale = getAQIScale(sampleCity.currentAQI);

  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8">
      {/* Dynamic Data Mode Banner */}
      {mode === 'mock' ? (
        <DemoNotice message="Demo Mock Mode active. Sample telemetry and forecast projections are illustrative." />
      ) : (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>
              Real-world environmental intelligence active for <strong>{sampleCity.name}, {sampleCity.country}</strong> via Open-Meteo & Copernicus CAMS.
            </span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-900/10 px-2 py-0.5 rounded font-bold">
            Live Mode
          </span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-navy-900 via-navy-950 to-slate-950 text-white p-8 sm:p-14 lg:p-16 border border-slate-800 shadow-2xl">
        {/* Three.js Atmospheric Background Canvas */}
        <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
          <AtmosphericHeroCanvas />
        </div>

        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Worldwide Environmental AI Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Understand Your Air.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Predict Your Future.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
              AeroSense AI combines ground sensor networks, satellite optical depth, and spatiotemporal neural models to provide actionable urban air quality monitoring and 7-day predictive health alerts for any city on Earth.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/forecast"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all"
              >
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>View Forecast</span>
              </Link>

              <Link
                to="/experience-3d"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 transition-all"
              >
                <Boxes className="w-4 h-4 text-emerald-400" />
                <span>3D Simulation</span>
              </Link>
            </div>

            {/* Micro stats */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left">
              <div>
                <div className="text-2xl font-black text-white tabular-nums">Global</div>
                <div className="text-xs text-slate-400">Any City Worldwide</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400 tabular-nums">7 Days</div>
                <div className="text-xs text-slate-400">Forecast Horizon</div>
              </div>
              <div>
                <div className="text-2xl font-black text-cyan-400 tabular-nums">6</div>
                <div className="text-xs text-slate-400">Key Pollutants</div>
              </div>
            </div>
          </div>

          {/* Hero Right: Live-Looking Teaser Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-6 shadow-2xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white text-sm">
                    {sampleCity.name}, {sampleCity.country}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {mode === 'mock' ? 'DEMO DATA' : 'LIVE API'}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">
                    Ambient AQI
                  </div>
                  <div
                    className="text-5xl font-black tabular-nums tracking-tight"
                    style={{ color: scale.hex }}
                  >
                    {sampleCity.currentAQI}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold border"
                    style={{
                      backgroundColor: `${scale.hex}25`,
                      color: scale.hex,
                      borderColor: `${scale.hex}50`,
                    }}
                  >
                    {scale.category}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Dominant: {sampleCity.dominantPollutant.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Pollutant mini bars */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>PM2.5 (Fine Particles)</span>
                  <span className="font-semibold">{sampleCity.pollutants.pm25.value} µg/m³</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((sampleCity.pollutants.pm25.value / 60) * 100))}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-300 pt-1">
                  <span>PM10 (Coarse Particles)</span>
                  <span className="font-semibold">{sampleCity.pollutants.pm10.value} µg/m³</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((sampleCity.pollutants.pm10.value / 100) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Temp: {sampleCity.weather.temperature}°C • Hum: {sampleCity.weather.humidity}%</span>
                <Link
                  to="/dashboard"
                  className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: 3 Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Environmental Intelligence
          </h2>
          <p className="text-sm text-slate-600">
            A modular architecture designed for high-resolution sensor ingestion, predictive neural modeling, and actionable public health protection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
          {/* Card 1: Real-Time Monitoring */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Real-Time Monitoring
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-station telemetry for PM2.5, PM10, NO2, SO2, CO, and O3 with automatic EPA / CPCB categorization and sensor health status.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <span>Standard-aligned thresholds</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* Card 2: AI Forecasting */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                AI Forecasting Engine
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Temporal Fusion Transformers project pollution trends up to 7 days ahead, incorporating wind dispersion patterns and boundary layers.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-cyan-700 flex items-center gap-1">
              <span>95% Confidence Bounds</span>
              <TrendingUp className="w-4 h-4 text-cyan-600" />
            </div>
          </div>

          {/* Card 3: Air Quality Insights */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Air Quality Insights
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Actionable advisories customized for the general public, sensitive individuals, outdoor athletics, and room ventilation protocols.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-purple-700 flex items-center gap-1">
              <span>Targeted Health Guidance</span>
              <Wind className="w-4 h-4 text-purple-600" />
            </div>
          </div>

          {/* Card 4: 3D Simulation & AR */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-navy-900 text-white border border-slate-700/80 p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">
                3D Urban Simulation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Interactive Three.js procedural city model simulating volumetric smog dispersion, particulate density, and wind vectors in real time.
              </p>
            </div>
            <Link
              to="/experience-3d"
              className="pt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Launch 3D Canvas &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Scenario Lab & Copilot Interactive Showcase */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-navy-950 text-white p-7 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Policy & Dispersion Sandbox</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Pollution Scenario Lab
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore hypothetical interventions in traffic congestion, fleet electrification, industrial smoke, and thermal atmospheric inversions with real-time box-model calculations.
            </p>
          </div>
          <Link
            to="/scenario-lab"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-5 py-3 rounded-xl transition-all self-start"
          >
            <span>Launch Policy Lab</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="rounded-3xl bg-white p-7 sm:p-8 border border-slate-200/90 shadow-card flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold">
              <Bot className="w-3.5 h-3.5 text-cyan-600" />
              <span>Grounded Ambient AI</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              AI Environmental Copilot
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Get direct answers grounded in actual multi-station sensor telemetry, diurnal patterns, and 7-day model forecasts with EPA citations and uncertainty bounds.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-3 rounded-xl transition-all self-start"
          >
            <span>Try Copilot on Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
