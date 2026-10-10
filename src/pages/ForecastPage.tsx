import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { CITIES_DATA, MOCK_MODEL_METADATA } from '../data/mockAirQualityData';
import { CityAirQualityRecord, ForecastPoint } from '../types/airQuality';
import { getAQIScale } from '../utils/aqiUtils';
import { CitySearch } from '../components/common/CitySearch';
import { ModulePlaceholder } from '../components/common/ModulePlaceholder';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Clock,
  Compass,
  CheckCircle2,
  Calendar,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';

export const ForecastPage: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityAirQualityRecord>(
    CITIES_DATA[0]
  );
  const [horizon, setHorizon] = useState<'24h' | '48h' | '7d'>('24h');
  const [showConfidence, setShowConfidence] = useState(true);

  const forecastPoints: ForecastPoint[] =
    horizon === '24h'
      ? selectedCity.forecast24h
      : horizon === '48h'
      ? selectedCity.forecast48h
      : selectedCity.forecast7d;

  // Chart data formatting: include confidence upper and lower bounds
  const chartData = forecastPoints.map((pt) => ({
    time: pt.timeLabel,
    predictedAQI: pt.predictedAQI,
    lowerBound: pt.lowerBound,
    upperBound: pt.upperBound,
    confidence: pt.confidenceScore,
    driver: pt.primaryDriver,
    trend: pt.trend,
  }));

  // Find peak and lowest AQI point in this horizon
  const sortedPoints = [...forecastPoints].sort(
    (a, b) => b.predictedAQI - a.predictedAQI
  );
  const peakPoint = sortedPoints[0];
  const minPoint = sortedPoints[sortedPoints.length - 1];
  const peakScale = getAQIScale(peakPoint.predictedAQI);
  const minScale = getAQIScale(minPoint.predictedAQI);

  const exportForecastCSV = () => {
    const headers = 'Time,PredictedAQI,LowerBound,UpperBound,Driver,Trend\n';
    const rows = forecastPoints
      .map(
        (p) =>
          `"${p.timeLabel}",${p.predictedAQI},${p.lowerBound},${p.upperBound},"${p.primaryDriver}","${p.trend}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCity.id}-forecast-${horizon}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Prominent Demo State Notice */}
      <div className="rounded-xl bg-amber-50 border border-amber-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900 shadow-sm">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>Demo forecast — AI model integration pending</span>
              <span className="text-[10px] font-mono uppercase bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                Phase 1 Prototype
              </span>
            </div>
            <p className="text-amber-800 text-xs mt-0.5">
              The forecast points displayed below are generated using synthetic spatiotemporal diurnal curves while the ML model is being trained by Member 3.
            </p>
          </div>
        </div>

        <span className="shrink-0 text-xs font-mono bg-white px-2.5 py-1 rounded-md border border-amber-200 text-amber-900 font-semibold">
          Model: TFT-LSTM v1.4
        </span>
      </div>

      {/* Header and City Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Air Quality Forecast Engine
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Predictive neural network projections with 95% uncertainty estimation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <CitySearch
            selectedCityId={selectedCity.id}
            onSelectCity={setSelectedCity}
            className="w-full sm:w-64"
          />

          <button
            onClick={exportForecastCSV}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all shrink-0"
            title="Download CSV of forecast series"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Horizon Selector and Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
            Target Horizon:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60">
            <button
              onClick={() => setHorizon('24h')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                horizon === '24h'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Next 24 Hours
            </button>
            <button
              onClick={() => setHorizon('48h')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                horizon === '48h'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Next 48 Hours
            </button>
            <button
              onClick={() => setHorizon('7d')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                horizon === '7d'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7-Day Projection
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setShowConfidence(!showConfidence)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold text-xs transition-all ${
              showConfidence
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            {showConfidence ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>95% Confidence Band: {showConfidence ? 'ON' : 'OFF'}</span>
          </button>

          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>2026-10-10 11:45 UTC</span>
          </div>
        </div>
      </div>

      {/* Main Forecast Line & Uncertainty Chart */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-5 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Predicted AQI Trajectory with 95% Confidence Interval
            </h3>
            <p className="text-xs text-slate-500">
              {selectedCity.name} — Shaded area represents model uncertainty envelope
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-600" />
              <span>Predicted AQI</span>
            </div>
            {showConfidence && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-emerald-100 border border-emerald-300" />
                <span>Uncertainty Range</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                domain={[0, 'dataMax + 25']}
              />

              <ReferenceLine
                y={50}
                stroke="#10B981"
                strokeDasharray="2 2"
                label={{ value: 'Good (50)', fill: '#10B981', fontSize: 10, position: 'right' }}
              />
              <ReferenceLine
                y={100}
                stroke="#F59E0B"
                strokeDasharray="2 2"
                label={{ value: 'Moderate (100)', fill: '#F59E0B', fontSize: 10, position: 'right' }}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs rounded-xl shadow-xl p-3.5 border border-slate-700 min-w-[170px] space-y-1">
                        <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-emerald-400" />
                          {label}
                        </div>
                        <div className="text-xl font-black text-emerald-400">
                          AQI {data.predictedAQI}
                        </div>
                        {showConfidence && (
                          <div className="text-[11px] text-slate-300">
                            Confidence Range: [{data.lowerBound} – {data.upperBound}]
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          Driver: {data.driver}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Shaded Upper Uncertainty Area */}
              {showConfidence && (
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="transparent"
                  fill="#10B981"
                  fillOpacity={0.12}
                />
              )}
              {/* Predicted Line */}
              <Area
                type="monotone"
                dataKey="predictedAQI"
                stroke="#059669"
                strokeWidth={3}
                fill="url(#forecastArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Key Insights Grid */}
      {/* Forecast Key Insights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Peak Pollution Alert */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-subtle space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Expected Peak Window
          </div>
          <div className="text-2xl font-black text-slate-900">
            {peakPoint.timeLabel}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${peakScale.hex}20`, color: peakScale.hex }}
            >
              Peak AQI {peakPoint.predictedAQI} ({peakScale.category})
            </span>
          </div>
          <p className="text-xs text-slate-600 pt-1 leading-relaxed">
            {peakPoint.primaryDriver}
          </p>
        </div>

        {/* Cleanest Window */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-subtle space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Cleanest Air Window
          </div>
          <div className="text-2xl font-black text-slate-900">
            {minPoint.timeLabel}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${minScale.hex}20`, color: minScale.hex }}
            >
              Min AQI {minPoint.predictedAQI} ({minScale.category})
            </span>
          </div>
          <p className="text-xs text-slate-600 pt-1 leading-relaxed">
            Optimal window for outdoor exercise and structural building ventilation.
          </p>
        </div>

        {/* Trend Direction */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-subtle space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Trend Trajectory
          </div>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>{peakPoint.trend.toUpperCase()}</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Atmospheric dispersion is projected to remain stable across the {horizon} horizon with moderate nocturnal accumulation.
          </p>
        </div>

        {/* Meteorological Driver */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-subtle space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Dominant Weather Driver
          </div>
          <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-cyan-600" />
            <span>Boundary Layer Inversion</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Light surface wind speeds below 10 km/h will limit horizontal pollutant transport through early morning hours.
          </p>
        </div>
      </div>

      {/* Member 3 AI Model Architecture & Handoff Card */}
      <ModulePlaceholder
        title="AI / ML Forecasting Module Architecture"
        subtitle="This interface will connect directly to the trained neural network model outputting 95% Bayesian uncertainty envelopes."
        assignedMember="Team Member 3"
        memberRole="AI / Machine Learning Engineer"
        targetFile="src/services/api.ts (getAQIForecast)"
        icon={BrainCircuit}
        badgeText="Model Contract: TFT-LSTM"
      >
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Model Architecture</span>
              <span className="font-bold text-slate-800">{MOCK_MODEL_METADATA.modelName}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Validation MAE</span>
              <span className="font-bold text-emerald-600">{MOCK_MODEL_METADATA.validationMAE} AQI points</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">R² Score</span>
              <span className="font-bold text-cyan-600">{MOCK_MODEL_METADATA.r2Score}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Last Trained</span>
              <span className="font-bold text-slate-800">{MOCK_MODEL_METADATA.lastTrained}</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-800 mb-1">
              Planned Ingestion Features for Production Engine:
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {MOCK_MODEL_METADATA.inputFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-1.5 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ModulePlaceholder>
    </div>
  );
};
