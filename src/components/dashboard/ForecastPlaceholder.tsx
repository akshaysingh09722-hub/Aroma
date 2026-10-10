import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, ArrowUpRight, Cpu, LineChart } from 'lucide-react';
import { ModulePlaceholder } from '../common/ModulePlaceholder';
import { ForecastPoint } from '../../types/airQuality';
import { getAQIScale } from '../../utils/aqiUtils';

interface ForecastPlaceholderProps {
  forecastData: ForecastPoint[];
  cityName: string;
  className?: string;
}

export const ForecastPlaceholder: React.FC<ForecastPlaceholderProps> = ({
  forecastData,
  cityName,
  className = '',
}) => {
  // Take next 6 hours for a mini preview strip
  const previewPoints = forecastData.slice(0, 6);

  return (
    <ModulePlaceholder
      title="Next-Generation AI AQI Forecast"
      subtitle={`Spatiotemporal neural network projection for ${cityName}. Models diurnal traffic emissions, thermal boundary layer fluctuations, and satellite AOD.`}
      assignedMember="Team Member 3"
      memberRole="AI / Machine Learning Engineer"
      targetFile="src/pages/ForecastPage.tsx"
      icon={BrainCircuit}
      badgeText="ML Forecasting Module"
      className={className}
    >
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Short-Term Model Projection (Next 6 Hours)
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Demo Model State
            </span>
          </div>

          <Link
            to="/forecast"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>Open Dedicated Forecast Page</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mini hourly preview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {previewPoints.map((pt, idx) => {
            const scale = getAQIScale(pt.predictedAQI);
            return (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/80 text-center flex flex-col justify-between"
              >
                <div className="text-[11px] font-medium text-slate-500">
                  {pt.timeLabel}
                </div>
                <div
                  className="text-lg font-black my-1 tabular-nums"
                  style={{ color: scale.hex }}
                >
                  {pt.predictedAQI}
                </div>
                <div className="text-[10px] font-semibold text-slate-600 truncate">
                  {scale.category}
                </div>
                <div className="text-[9px] text-slate-400 mt-1">
                  ±{pt.upperBound - pt.predictedAQI} CI
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <LineChart className="w-3.5 h-3.5 text-slate-400" />
            TFT-LSTM Model Architecture • 95% Confidence Bounds
          </span>
          <span className="font-mono text-slate-400">
            Pending API hookup: GET /api/aqi/forecast
          </span>
        </div>
      </div>
    </ModulePlaceholder>
  );
};
