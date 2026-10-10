import React from 'react';
import { PollutantMeasurement } from '../../types/airQuality';
import { POLLUTANT_CONFIG } from '../../utils/aqiUtils';

interface PollutantCardProps {
  pollutant: PollutantMeasurement;
  isPrimary?: boolean;
  className?: string;
}

export const PollutantCard: React.FC<PollutantCardProps> = ({
  pollutant,
  isPrimary = false,
  className = '',
}) => {
  const meta = POLLUTANT_CONFIG[pollutant.id] || {
    name: pollutant.name,
    formula: pollutant.chemicalFormula,
    standardLimit: pollutant.standardLimit,
    unit: pollutant.unit,
  };

  const percentageOfLimit = Math.min(
    Math.round((pollutant.value / pollutant.standardLimit) * 100),
    200
  );

  let statusColor = 'bg-emerald-500';
  let badgeText = 'Within Limit';
  let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (percentageOfLimit > 100) {
    statusColor = 'bg-rose-500';
    badgeText = 'Exceeds Standard';
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (percentageOfLimit > 70) {
    statusColor = 'bg-amber-500';
    badgeText = 'Approaching Limit';
    badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div
      className={`rounded-xl bg-white border p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between ${
        isPrimary ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-slate-200'
      } ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                {pollutant.chemicalFormula}
              </span>
              {isPrimary && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Primary
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 truncate max-w-[170px]" title={pollutant.name}>
              {pollutant.name}
            </p>
          </div>

          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeClass}`}>
            {badgeText}
          </span>
        </div>

        {/* Current Concentration Reading */}
        <div className="my-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {pollutant.value}
          </span>
          <span className="text-xs font-semibold text-slate-600">
            {pollutant.unit}
          </span>
        </div>
      </div>

      <div>
        {/* Threshold bar */}
        <div className="mb-1.5 flex justify-between text-[11px] text-slate-600">
          <span>Standard Limit</span>
          <span className="font-semibold text-slate-700">
            {pollutant.standardLimit} {pollutant.unit}
          </span>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
            style={{ width: `${Math.min(percentageOfLimit, 100)}%` }}
          />
        </div>

        <div className="mt-2 text-[11px] text-slate-600 flex justify-between items-center">
          <span>{percentageOfLimit}% of threshold</span>
          <span className="opacity-70">EPA Standard</span>
        </div>
      </div>
    </div>
  );
};
