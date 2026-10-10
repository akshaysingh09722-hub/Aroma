import React, { useState } from 'react';
import { Map, Layers, Radio, Compass, RadioTower } from 'lucide-react';
import { ModulePlaceholder } from '../common/ModulePlaceholder';
import { MonitoringStation } from '../../types/airQuality';
import { getAQIScale } from '../../utils/aqiUtils';

interface CityMapPlaceholderProps {
  cityName: string;
  stations: MonitoringStation[];
  latitude: number;
  longitude: number;
  className?: string;
}

export const CityMapPlaceholder: React.FC<CityMapPlaceholderProps> = ({
  cityName,
  stations,
  latitude,
  longitude,
  className = '',
}) => {
  const [activeStationId, setActiveStationId] = useState<string>(
    stations[0]?.id || ''
  );

  const selectedStation =
    stations.find((s) => s.id === activeStationId) || stations[0];

  return (
    <ModulePlaceholder
      title="City Monitoring Station Spatial Grid"
      subtitle={`Geospatial station network and micro-sensor telemetry for ${cityName} (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E).`}
      assignedMember="Team Member 4"
      memberRole="Geospatial & 3D Visualization Specialist"
      targetFile="src/components/dashboard/CityMapPlaceholder.tsx"
      icon={Map}
      badgeText="Spatial Sensor Network"
      className={className}
    >
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Top toolbar */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="font-bold text-slate-800">
              {stations.length} Monitoring Stations Available
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              Lat: {latitude.toFixed(3)}°, Lon: {longitude.toFixed(3)}°
            </span>
            <span className="hidden sm:inline bg-white px-2 py-0.5 rounded border border-slate-200">
              Leaflet / Mapbox Ready
            </span>
          </div>
        </div>

        {/* Map Visualization Area */}
        <div className="relative h-64 sm:h-72 bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-6 flex flex-col justify-between text-white overflow-hidden">
          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Simulated topographical contour ring */}
          <div className="absolute -right-10 -bottom-10 w-96 h-96 rounded-full border border-emerald-500/20 pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-[480px] h-[480px] rounded-full border border-cyan-500/10 pointer-events-none" />

          {/* Overlay info */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
              <span className="text-slate-400">Urban Spatial Grid:</span>{' '}
              <span className="font-semibold text-emerald-400">{cityName}</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-slate-300">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Layer: Surface PM2.5 Dispersion</span>
            </div>
          </div>

          {/* Station pins placed across the simulated spatial grid */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 my-auto">
            {stations.map((st) => {
              const scale = getAQIScale(st.currentAQI);
              const isSelected = st.id === selectedStation?.id;

              return (
                <button
                  key={st.id}
                  onClick={() => setActiveStationId(st.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-slate-800/95 border-emerald-400 shadow-lg ring-1 ring-emerald-400/50'
                      : 'bg-slate-900/70 border-slate-700/80 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {st.stationCode}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: scale.hex }}
                    />
                  </div>

                  <div className="text-xs font-bold text-white truncate mb-1">
                    {st.name}
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400">AQI</span>
                    <span
                      className="font-extrabold text-sm tabular-nums"
                      style={{ color: scale.hex }}
                    >
                      {st.currentAQI}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom station readout */}
          {selectedStation && (
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-900/90 backdrop-blur-md p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <RadioTower className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-200">
                  {selectedStation.name}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  {selectedStation.sensorType}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Last broadcast: {selectedStation.lastReported}
              </span>
            </div>
          )}
        </div>
      </div>
    </ModulePlaceholder>
  );
};
