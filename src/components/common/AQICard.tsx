import React from 'react';
import { getAQIScale, AQI_LEVELS } from '../../utils/aqiUtils';
import { AQIBadge } from './AQIBadge';
import { ShieldAlert, Wind } from 'lucide-react';

interface AQICardProps {
  aqi: number;
  cityName: string;
  country: string;
  dominantPollutant: string;
  lastUpdated?: string;
  isDemo?: boolean;
  className?: string;
}

export const AQICard: React.FC<AQICardProps> = ({
  aqi,
  cityName,
  country,
  dominantPollutant,
  lastUpdated = '2026-10-10 12:00 UTC',
  isDemo = true,
  className = '',
}) => {
  const scale = getAQIScale(aqi);

  // Calculate percentage along 0 - 350 EPA scale for indicator marker
  const percentage = Math.min(Math.max((aqi / 350) * 100, 2), 98);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-card p-6 sm:p-7 flex flex-col justify-between transition-all hover:shadow-card-hover ${className}`}
    >
      {/* Subtle background color wash */}
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-20"
        style={{ backgroundColor: scale.hex }}
      />

      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {cityName}
              </h2>
              <span className="text-sm font-medium text-slate-500">
                {country}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>Last updated: {lastUpdated}</span>
              {isDemo && (
                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  DEMO DATA
                </span>
              )}
            </p>
          </div>

          <AQIBadge aqi={aqi} category={scale.category} size="md" />
        </div>

        {/* Big AQI Number & Qualitative Status */}
        <div className="my-5 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
          <div className="flex items-baseline gap-2">
            <span
              className="text-6xl sm:text-7xl font-extrabold tracking-tighter tabular-nums"
              style={{ color: scale.hex }}
            >
              {Math.round(aqi)}
            </span>
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
              AQI (US EPA)
            </span>
          </div>

          <div className="sm:border-l sm:border-slate-200 sm:pl-5">
            <div className="text-base font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-slate-400" />
              Primary Pollutant:{' '}
              <span className="text-emerald-700 font-bold uppercase">
                {dominantPollutant}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
              {scale.description}
            </p>
          </div>
        </div>

        {/* EPA Scale Gradient Bar */}
        <div className="mt-6 mb-3">
          <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1.5">
            <span>0 Good</span>
            <span className="hidden sm:inline">100 Moderate</span>
            <span>200 Unhealthy</span>
            <span className="hidden sm:inline">300 Very Unhealthy</span>
            <span>500 Hazardous</span>
          </div>

          <div className="relative h-2.5 w-full rounded-full overflow-hidden bg-slate-100 flex">
            {AQI_LEVELS.map((lvl) => (
              <div
                key={lvl.category}
                className="h-full flex-1"
                style={{ backgroundColor: lvl.hex }}
                title={`${lvl.category} (${lvl.range})`}
              />
            ))}
          </div>

          {/* Marker needle */}
          <div className="relative w-full h-3">
            <div
              className="absolute -top-1 -ml-1.5 transition-all duration-300"
              style={{ left: `${percentage}%` }}
            >
              <div
                className="w-3 h-3 rotate-45 border-2 border-white shadow-sm"
                style={{ backgroundColor: scale.hex }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Advice bottom row */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
        <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0" />
        <span className="font-medium text-slate-800">Recommendation:</span>
        <span className="text-slate-600 truncate">{scale.actionAdvice}</span>
      </div>
    </div>
  );
};
