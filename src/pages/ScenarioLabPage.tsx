import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { CITIES_DATA } from '../data/mockAirQualityData';
import { CityAirQualityRecord } from '../types/airQuality';
import { getAQIScale } from '../utils/aqiUtils';
import { CitySearch } from '../components/common/CitySearch';
import { DemoNotice } from '../components/common/DemoNotice';
import {
  SlidersHorizontal,
  Flame,
  Car,
  Factory,
  Trees,
  Wind,
  RotateCcw,
  Download,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const ScenarioLabPage: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityAirQualityRecord>(
    CITIES_DATA[0]
  );

  // Scenario Levers
  const [trafficDelta, setTrafficDelta] = useState<number>(0); // -50% to +50%
  const [evShare, setEvShare] = useState<number>(15); // 0% to 100%
  const [industrialDelta, setIndustrialDelta] = useState<number>(0); // -50% to +50%
  const [inversionFactor, setInversionFactor] = useState<number>(1.0); // 0.6x to 1.8x
  const [canopyExpansion, setCanopyExpansion] = useState<number>(10); // 0% to 50%

  // Apply Presets
  const applyPreset = (preset: 'clean' | 'inversion' | 'industrial' | 'green' | 'reset') => {
    switch (preset) {
      case 'clean':
        setTrafficDelta(-30);
        setEvShare(70);
        setIndustrialDelta(-20);
        setInversionFactor(1.0);
        setCanopyExpansion(25);
        break;
      case 'inversion':
        setTrafficDelta(15);
        setEvShare(15);
        setIndustrialDelta(10);
        setInversionFactor(1.6);
        setCanopyExpansion(10);
        break;
      case 'industrial':
        setTrafficDelta(0);
        setEvShare(15);
        setIndustrialDelta(-45);
        setInversionFactor(1.0);
        setCanopyExpansion(15);
        break;
      case 'green':
        setTrafficDelta(-15);
        setEvShare(35);
        setIndustrialDelta(-15);
        setInversionFactor(0.85);
        setCanopyExpansion(45);
        break;
      case 'reset':
      default:
        setTrafficDelta(0);
        setEvShare(15);
        setIndustrialDelta(0);
        setInversionFactor(1.0);
        setCanopyExpansion(10);
        break;
    }
  };

  // Computational Heuristic Model (Box-Model Formulation)
  // Baseline AQI & Pollutants modified by policy coefficients
  const scenarioResults = useMemo(() => {
    const baseAQI = selectedCity.currentAQI;
    const basePM25 = selectedCity.pollutants.pm25.value;
    const baseNO2 = selectedCity.pollutants.no2.value;

    // Traffic impact primarily affects NO2 and PM2.5
    // Each 1% EV reduces traffic tailpipe NO2 by ~0.8% and PM2.5 by ~0.4%
    const trafficMultiplier = 1 + trafficDelta / 100;
    const evMitigation = 1 - (evShare - 15) * 0.007; // baseline 15% EV
    const effectiveTrafficEmission = trafficMultiplier * Math.max(0.2, evMitigation);

    // Industrial output affects PM2.5, SO2, CO
    const industrialMultiplier = 1 + industrialDelta / 100;

    // Green canopy deposition velocity sink (up to 18% pollutant capture)
    const canopySink = 1 - (canopyExpansion / 100) * 0.35;

    // Meteorological dispersion/stagnation factor
    const meteorology = inversionFactor;

    // Calculate simulated pollutant concentrations
    const simulatedPM25 = Math.max(
      3,
      Math.round(basePM25 * (effectiveTrafficEmission * 0.45 + industrialMultiplier * 0.55) * canopySink * meteorology * 10) / 10
    );

    const simulatedNO2 = Math.max(
      2,
      Math.round(baseNO2 * effectiveTrafficEmission * canopySink * meteorology * 10) / 10
    );

    // Simulated AQI projection
    const aqiRatio = (simulatedPM25 / Math.max(1, basePM25) + simulatedNO2 / Math.max(1, baseNO2)) / 2;
    const simulatedAQI = Math.max(12, Math.round(baseAQI * aqiRatio));

    const aqiDelta = simulatedAQI - baseAQI;
    const aqiDeltaPercent = Math.round(((simulatedAQI - baseAQI) / baseAQI) * 100);

    // Generate 24h comparative diurnal curves
    const chartData = selectedCity.historical24h.map((pt) => {
      const simHourAQI = Math.max(10, Math.round(pt.aqi * aqiRatio));
      return {
        time: pt.timeLabel,
        baselineAQI: pt.aqi,
        simulatedAQI: simHourAQI,
      };
    });

    return {
      simulatedAQI,
      baseAQI,
      aqiDelta,
      aqiDeltaPercent,
      simulatedPM25,
      basePM25,
      simulatedNO2,
      baseNO2,
      chartData,
    };
  }, [
    selectedCity,
    trafficDelta,
    evShare,
    industrialDelta,
    inversionFactor,
    canopyExpansion,
  ]);

  const baseScale = getAQIScale(scenarioResults.baseAQI);
  const simScale = getAQIScale(scenarioResults.simulatedAQI);

  const exportScenarioCSV = () => {
    const headers = 'Hour,BaselineAQI,SimulatedAQI,TrafficDelta%,EVShare%,IndustryDelta%,InversionFactor,Canopy%\n';
    const rows = scenarioResults.chartData
      .map(
        (p) =>
          `"${p.time}",${p.baselineAQI},${p.simulatedAQI},${trafficDelta},${evShare},${industrialDelta},${inversionFactor},${canopyExpansion}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCity.id}-scenario-simulation.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Demo Notice Banner */}
      <DemoNotice message="Pollution Scenario Lab active. This policy simulator uses conceptual box-model heuristics to illustrate emission intervention dynamics. Not certified regulatory projections." />

      {/* Header and City Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pollution Scenario Lab
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Experimental Policy Sandbox
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate hypothetical changes in urban traffic volume, industrial output, fleet electrification, and meteorological thermal inversion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CitySearch
            selectedCityId={selectedCity.id}
            onSelectCity={setSelectedCity}
            className="w-full sm:w-64"
          />

          <button
            onClick={exportScenarioCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all shrink-0"
            title="Export scenario comparison CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export Run</span>
          </button>
        </div>
      </div>

      {/* Presets Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Policy Presets:</span>
          </span>

          <button
            onClick={() => applyPreset('clean')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-slate-700 font-semibold transition-all shrink-0"
          >
            EV Fleet & Clean Transit
          </button>

          <button
            onClick={() => applyPreset('inversion')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 text-slate-700 font-semibold transition-all shrink-0"
          >
            Winter Thermal Inversion
          </button>

          <button
            onClick={() => applyPreset('industrial')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200 text-slate-700 font-semibold transition-all shrink-0"
          >
            Industrial Decarbonization
          </button>

          <button
            onClick={() => applyPreset('green')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 text-slate-700 font-semibold transition-all shrink-0"
          >
            Urban Forest Canopy
          </button>
        </div>

        <button
          onClick={() => applyPreset('reset')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-semibold transition-all self-end sm:self-auto shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* Main Grid: Control Levers (Left) & Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Scenario Controls */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Intervention Levers</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              Adjustable Coefficients
            </span>
          </div>

          {/* Lever 1: Traffic Volume Delta */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-cyan-600" />
                <span>Traffic Volume Change</span>
              </span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  trafficDelta > 0
                    ? 'bg-rose-100 text-rose-800'
                    : trafficDelta < 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {trafficDelta > 0 ? `+${trafficDelta}%` : `${trafficDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              step={5}
              value={trafficDelta}
              onChange={(e) => setTrafficDelta(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-50% (Lockdown)</span>
              <span>Baseline (0%)</span>
              <span>+50% (Congestion)</span>
            </div>
          </div>

          {/* Lever 2: Electric Vehicle & Clean Transit Fleet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-600" />
                <span>EV & Clean Transit Share</span>
              </span>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px]">
                {evShare}% Fleet
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={evShare}
              onChange={(e) => setEvShare(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Fossil)</span>
              <span>15% (Current)</span>
              <span>100% (Zero-Emission)</span>
            </div>
          </div>

          {/* Lever 3: Industrial Output Delta */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Factory className="w-4 h-4 text-amber-600" />
                <span>Industrial Emissions</span>
              </span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  industrialDelta > 0
                    ? 'bg-rose-100 text-rose-800'
                    : industrialDelta < 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {industrialDelta > 0 ? `+${industrialDelta}%` : `${industrialDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              step={5}
              value={industrialDelta}
              onChange={(e) => setIndustrialDelta(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-50% (Green Mfg)</span>
              <span>Baseline (0%)</span>
              <span>+50% (Peak Surge)</span>
            </div>
          </div>

          {/* Lever 4: Thermal Inversion & Atmospheric Dispersion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-cyan-600" />
                <span>Atmospheric Dispersion / Inversion</span>
              </span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  inversionFactor > 1.0
                    ? 'bg-amber-100 text-amber-800'
                    : inversionFactor < 1.0
                    ? 'bg-cyan-100 text-cyan-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {inversionFactor.toFixed(2)}x Trapping
              </span>
            </div>
            <input
              type="range"
              min={0.6}
              max={1.8}
              step={0.05}
              value={inversionFactor}
              onChange={(e) => setInversionFactor(Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.6x (High Wind)</span>
              <span>1.0x (Normal)</span>
              <span>1.8x (Trapped Smog)</span>
            </div>
          </div>

          {/* Lever 5: Urban Forest Canopy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Trees className="w-4 h-4 text-emerald-600" />
                <span>Urban Tree Canopy & Bio-Filters</span>
              </span>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px]">
                {canopyExpansion}% Coverage
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={canopyExpansion}
              onChange={(e) => setCanopyExpansion(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Bare Concrete)</span>
              <span>10% (Baseline)</span>
              <span>50% (Eco-Metropolis)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Outcomes */}
        <div className="lg:col-span-7 space-y-6">
          {/* Side-by-Side Impact Scorecard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Baseline Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Observed Baseline
                </span>
                <div
                  className="text-3xl font-black tabular-nums mt-1"
                  style={{ color: baseScale.hex }}
                >
                  AQI {scenarioResults.baseAQI}
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  {baseScale.category}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-3 space-y-0.5">
                <div>PM2.5: {scenarioResults.basePM25} µg/m³</div>
                <div>NO2: {scenarioResults.baseNO2} ppb</div>
              </div>
            </div>

            {/* Simulated Outcome Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Simulated Outcome
                </span>
                <div
                  className="text-3xl font-black tabular-nums mt-1"
                  style={{ color: simScale.hex }}
                >
                  AQI {scenarioResults.simulatedAQI}
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  {simScale.category}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-3 space-y-0.5">
                <div>PM2.5: {scenarioResults.simulatedPM25} µg/m³</div>
                <div>NO2: {scenarioResults.simulatedNO2} ppb</div>
              </div>
            </div>

            {/* Net Delta Card */}
            <div
              className={`p-5 rounded-2xl border shadow-card flex flex-col justify-between ${
                scenarioResults.aqiDelta < 0
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : scenarioResults.aqiDelta > 0
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                  Projected Net Impact
                </span>
                <div className="text-3xl font-black tabular-nums mt-1 flex items-center gap-1.5">
                  {scenarioResults.aqiDelta < 0 ? (
                    <TrendingDown className="w-6 h-6 text-emerald-600" />
                  ) : scenarioResults.aqiDelta > 0 ? (
                    <TrendingUp className="w-6 h-6 text-rose-600" />
                  ) : null}
                  <span>
                    {scenarioResults.aqiDelta > 0 ? `+${scenarioResults.aqiDelta}` : scenarioResults.aqiDelta}
                  </span>
                </div>
                <div className="text-xs font-bold mt-0.5">
                  {scenarioResults.aqiDeltaPercent > 0
                    ? `+${scenarioResults.aqiDeltaPercent}% Degradation`
                    : `${scenarioResults.aqiDeltaPercent}% Improvement`}
                </div>
              </div>

              <div className="text-[11px] pt-3 border-t border-black/10 mt-3 leading-relaxed">
                {scenarioResults.aqiDelta < 0
                  ? 'Shift towards safer health exposure thresholds.'
                  : scenarioResults.aqiDelta > 0
                  ? 'Heightened risk for cardiovascular and asthmatic cohorts.'
                  : 'Zero net change from baseline.'}
              </div>
            </div>
          </div>

          {/* Diurnal 24h Comparison Curve */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  24-Hour Diurnal Curve: Baseline vs. Simulated Policy
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedCity.name} — Hourly pollutant dispersion under active levers
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-3 h-1 bg-slate-400 rounded-full" />
                  <span>Baseline</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-3 h-1 bg-emerald-600 rounded-full" />
                  <span>Simulated</span>
                </div>
              </div>
            </div>

            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scenarioResults.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    domain={[0, 'dataMax + 20']}
                  />

                  <ReferenceLine
                    y={50}
                    stroke="#10B981"
                    strokeDasharray="2 2"
                    label={{ value: 'Good', fill: '#10B981', fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={100}
                    stroke="#F59E0B"
                    strokeDasharray="2 2"
                    label={{ value: 'Moderate', fill: '#F59E0B', fontSize: 10 }}
                  />

                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white text-xs rounded-xl shadow-xl p-3 border border-slate-700 space-y-1">
                            <div className="font-semibold text-slate-400">{label}</div>
                            <div className="text-slate-300">
                              Baseline AQI: <strong className="text-white">{payload[0].value}</strong>
                            </div>
                            <div className="text-emerald-400">
                              Simulated AQI: <strong className="text-emerald-300">{payload[1].value}</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="baselineAQI"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="simulatedAQI"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions & Scientific Limitations Banner */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 sm:p-7 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <AlertCircle className="w-4 h-4" />
          <span>Model Assumptions & Scientific Scope</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold">
          Linearized Box-Model Heuristics vs. Spatiotemporal Physics
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The Scenario Lab uses parameterized atmospheric deposition formulas coupled with standard EPA pollutant conversion functions. While responsive to policy exploration, real-world chemical transport involves non-linear photochemical ozone formation (VOC-NOx ratios) and complex 3D boundary layer dynamics.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800">
          <span>Eulerian dispersion formulation • Parameterized for hackathon policy sandbox</span>
          <span className="font-mono text-emerald-400">Target Integration: Member 3 TFT-Euler API</span>
        </div>
      </div>
    </div>
  );
};
