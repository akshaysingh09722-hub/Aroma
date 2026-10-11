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
import { useLocationContext } from '../context/LocationContext';
import { useEnvironmentalData } from '../context/EnvironmentalDataContext';
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
  Radio,
} from 'lucide-react';

export const ScenarioLabPage: React.FC = () => {
  const { selectedLocation } = useLocationContext();
  const { data: selectedCity, mode } = useEnvironmentalData();

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
  // Baseline AQI & Pollutants from real selected city modified by policy coefficients
  const scenarioResults = useMemo(() => {
    const baseAQI = selectedCity.currentAQI;
    const basePM25 = selectedCity.pollutants.pm25.value;
    const baseNO2 = selectedCity.pollutants.no2.value;

    const trafficMultiplier = 1 + trafficDelta / 100;
    const evMitigation = 1 - (evShare - 15) * 0.007;
    const effectiveTrafficEmission = trafficMultiplier * Math.max(0.2, evMitigation);

    const industrialMultiplier = 1 + industrialDelta / 100;
    const canopyDepositionFactor = 1 - (canopyExpansion - 10) * 0.005;

    // Combined concentration factors
    const simulatedPM25 = Math.max(
      3.0,
      basePM25 *
        (0.45 * effectiveTrafficEmission + 0.55 * industrialMultiplier) *
        inversionFactor *
        canopyDepositionFactor
    );

    const simulatedNO2 = Math.max(
      2.0,
      baseNO2 *
        (0.75 * effectiveTrafficEmission + 0.25 * industrialMultiplier) *
        inversionFactor
    );

    // Simulated AQI proportional to primary pollutant shifts
    const simulatedAQI = Math.max(
      10,
      Math.round(
        baseAQI *
          (0.55 * (simulatedPM25 / Math.max(1, basePM25)) +
            0.45 * (simulatedNO2 / Math.max(1, baseNO2)))
      )
    );

    const aqiDelta = simulatedAQI - baseAQI;
    const aqiPercentChange = baseAQI > 0 ? ((aqiDelta / baseAQI) * 100).toFixed(1) : '0';

    return {
      baseAQI,
      simulatedAQI,
      aqiDelta,
      aqiPercentChange,
      simulatedPM25: Number(simulatedPM25.toFixed(1)),
      simulatedNO2: Number(simulatedNO2.toFixed(1)),
      scale: getAQIScale(simulatedAQI),
      baseScale: getAQIScale(baseAQI),
    };
  }, [
    selectedCity,
    trafficDelta,
    evShare,
    industrialDelta,
    inversionFactor,
    canopyExpansion,
  ]);

  // Projected 24h diurnal comparison curve
  const diurnalComparisonData = useMemo(() => {
    const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
    const ratio = scenarioResults.baseAQI > 0 ? scenarioResults.simulatedAQI / scenarioResults.baseAQI : 1;

    return hours.map((hour, idx) => {
      // Typical urban diurnal wave with morning and evening traffic peaks
      const diurnalWeights = [0.85, 0.75, 0.95, 1.25, 1.05, 0.95, 1.30, 1.10];
      const baseVal = Math.round(scenarioResults.baseAQI * diurnalWeights[idx]);
      const simVal = Math.round(baseVal * ratio);

      return {
        time: hour,
        'Observed Baseline': baseVal,
        'Policy Simulation': simVal,
      };
    });
  }, [scenarioResults]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Notice Banner */}
      {mode === 'mock' ? (
        <DemoNotice message="Pollution Scenario Lab Prototype active. Computational box model calibrates atmospheric policy interventions." />
      ) : (
        <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-3.5 text-xs text-purple-950 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>
              Real Baseline Ingestion: Scenario simulations initialize from real Open-Meteo observations for{' '}
              <strong>{selectedCity.name}, {selectedCity.country}</strong> (Baseline AQI {selectedCity.currentAQI}).
            </span>
          </div>
          <span className="font-mono text-[10px] bg-purple-900/10 px-2 py-0.5 rounded font-bold">
            Real Starting Conditions
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Urban Policy & Dispersion Scenario Lab
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
              Box Model Heuristic
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate policy interventions against real baseline conditions for {selectedCity.name}, {selectedCity.country}.
          </p>
        </div>

        {/* Global City Search */}
        <div className="w-full sm:w-72">
          <CitySearch />
        </div>
      </div>

      {/* Preset Action Buttons Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-card text-xs">
        <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mr-1">
          Policy Presets:
        </span>
        <button
          onClick={() => applyPreset('clean')}
          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold border border-emerald-200 transition-colors"
        >
          High EV & Clean Fleet
        </button>
        <button
          onClick={() => applyPreset('industrial')}
          className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 font-semibold border border-blue-200 transition-colors"
        >
          Heavy Industrial Scrubbers
        </button>
        <button
          onClick={() => applyPreset('green')}
          className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 font-semibold border border-teal-200 transition-colors"
        >
          Urban Forest Canopy
        </button>
        <button
          onClick={() => applyPreset('inversion')}
          className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 font-semibold border border-rose-200 transition-colors"
        >
          Winter Thermal Inversion
        </button>
        <button
          onClick={() => applyPreset('reset')}
          className="ml-auto inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Levers</span>
        </button>
      </div>

      {/* Levers & Outcomes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Policy Levers (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Policy & Environmental Intervention Levers
              </h3>
            </div>
          </div>

          <div className="space-y-5 text-xs">
            {/* Lever 1: Traffic Volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline font-semibold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Car className="w-3.5 h-3.5 text-slate-500" />
                  Traffic Volume Adjustment:
                </span>
                <span className="font-mono tabular-nums text-slate-900">
                  {trafficDelta > 0 ? `+${trafficDelta}%` : `${trafficDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={trafficDelta}
                onChange={(e) => setTrafficDelta(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Lever 2: Electric Vehicle Share */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline font-semibold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Electric Vehicle Fleet Share:
                </span>
                <span className="font-mono tabular-nums text-slate-900">{evShare}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={evShare}
                onChange={(e) => setEvShare(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Lever 3: Industrial Output */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline font-semibold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Factory className="w-3.5 h-3.5 text-amber-500" />
                  Industrial Emission Intensity:
                </span>
                <span className="font-mono tabular-nums text-slate-900">
                  {industrialDelta > 0 ? `+${industrialDelta}%` : `${industrialDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={industrialDelta}
                onChange={(e) => setIndustrialDelta(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>

            {/* Lever 4: Atmospheric Inversion */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline font-semibold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Wind className="w-3.5 h-3.5 text-cyan-500" />
                  Atmospheric Trapping / Inversion Factor:
                </span>
                <span className="font-mono tabular-nums text-slate-900">
                  {inversionFactor.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.05"
                value={inversionFactor}
                onChange={(e) => setInversionFactor(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
            </div>

            {/* Lever 5: Urban Tree Canopy */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline font-semibold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Trees className="w-3.5 h-3.5 text-teal-500" />
                  Urban Canopy / Green Buffer Density:
                </span>
                <span className="font-mono tabular-nums text-slate-900">+{canopyExpansion}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={canopyExpansion}
                onChange={(e) => setCanopyExpansion(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Right: Projected Outcomes & Diurnal Response (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono uppercase text-slate-400">
                Simulated Outcome for {selectedCity.name}
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: `${scenarioResults.scale.hex}25`,
                  color: scenarioResults.scale.hex,
                  borderColor: `${scenarioResults.scale.hex}50`,
                }}
              >
                {scenarioResults.scale.category}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">Projected Ambient AQI</div>
                <div
                  className="text-5xl font-black tabular-nums tracking-tight"
                  style={{ color: scenarioResults.scale.hex }}
                >
                  {scenarioResults.simulatedAQI}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 mb-1">Delta vs Real Baseline</div>
                <div
                  className={`text-xl font-bold tabular-nums flex items-center justify-end gap-1 ${
                    scenarioResults.aqiDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {scenarioResults.aqiDelta <= 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  <span>
                    {scenarioResults.aqiDelta > 0
                      ? `+${scenarioResults.aqiDelta}`
                      : scenarioResults.aqiDelta}{' '}
                    AQI ({scenarioResults.aqiPercentChange}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 block mb-0.5">PM2.5 Concentration</span>
                <span className="font-bold text-white text-sm">
                  {scenarioResults.simulatedPM25} µg/m³
                </span>
                <span className="text-[10px] text-slate-400 block">
                  (Base: {selectedCity.pollutants.pm25.value})
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 block mb-0.5">NO2 Concentration</span>
                <span className="font-bold text-white text-sm">
                  {scenarioResults.simulatedNO2} µg/m³
                </span>
                <span className="text-[10px] text-slate-400 block">
                  (Base: {selectedCity.pollutants.no2.value})
                </span>
              </div>
            </div>
          </div>

          {/* Diurnal Curve Comparison */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Diurnal Trajectory Shift
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={diurnalComparisonData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" domain={[0, 'dataMax + 20']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                  <Line type="monotone" dataKey="Observed Baseline" stroke="#94a3b8" strokeDasharray="3 3" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="Policy Simulation" stroke="#a855f7" dot={false} strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
