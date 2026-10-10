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
import { HistoricalReading } from '../../types/airQuality';
import { Calendar, Info } from 'lucide-react';

interface HistoricalChartProps {
  data24h: HistoricalReading[];
  data7d: Array<{ date: string; avgAQI: number; minAQI: number; maxAQI: number }>;
  cityName: string;
  className?: string;
}

export const HistoricalChart: React.FC<HistoricalChartProps> = ({
  data24h,
  data7d,
  cityName,
  className = '',
}) => {
  const [range, setRange] = useState<'24h' | '7d'>('24h');

  const chartData: Array<{ time: string; aqi: number; [key: string]: any }> =
    range === '24h'
      ? data24h.map((d) => ({
          time: d.timeLabel,
          aqi: d.aqi,
          pm25: d.pm25,
          pm10: d.pm10,
        }))
      : data7d.map((d) => ({
          time: d.date,
          aqi: d.avgAQI,
          minAQI: d.minAQI,
          maxAQI: d.maxAQI,
        }));

  return (
    <div
      className={`rounded-2xl bg-white border border-slate-200 shadow-card p-5 sm:p-6 flex flex-col justify-between ${className}`}
    >
      {/* Header with Title and Range Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Historical Air Quality Trend
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              DEMO SAMPLE DATA
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {cityName} historical ground sensor observations
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60">
          <button
            onClick={() => setRange('24h')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              range === '24h'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past 24 Hours
          </button>
          <button
            onClick={() => setRange('7d')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              range === '7d'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past 7 Days
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
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
              domain={[0, 'dataMax + 20']}
            />

            {/* EPA Category Breakpoint Reference Lines */}
            <ReferenceLine
              y={50}
              stroke="#10B981"
              strokeDasharray="3 3"
              label={{ value: 'Good (50)', fill: '#10B981', fontSize: 10, position: 'right' }}
            />
            <ReferenceLine
              y={100}
              stroke="#F59E0B"
              strokeDasharray="3 3"
              label={{ value: 'Moderate (100)', fill: '#F59E0B', fontSize: 10, position: 'right' }}
            />
            <ReferenceLine
              y={150}
              stroke="#EF4444"
              strokeDasharray="3 3"
              label={{ value: 'Unhealthy (150)', fill: '#EF4444', fontSize: 10, position: 'right' }}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value;
                  return (
                    <div className="bg-slate-900 text-white text-xs rounded-xl shadow-lg p-3 border border-slate-700 min-w-[130px]">
                      <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        {label}
                      </div>
                      <div className="text-base font-extrabold text-emerald-400">
                        AQI {val}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        EPA Air Quality Standard
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#aqiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Standards Note */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span>Reference lines represent US EPA AQI regulatory breakpoints.</span>
        </div>
        <span className="text-[11px] font-mono text-slate-600">
          Source: OpenAQ Ground Sensor Archive (Mocked)
        </span>
      </div>
    </div>
  );
};
