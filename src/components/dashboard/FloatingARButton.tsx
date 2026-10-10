import React from 'react';
import { Eye, Sparkles, ChevronRight } from 'lucide-react';

interface FloatingARButtonProps {
  onClick: () => void;
  currentAQI?: number;
  cityName?: string;
}

export const FloatingARButton: React.FC<FloatingARButtonProps> = ({
  onClick,
  currentAQI,
  cityName,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-30 group animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Glow pulse layer */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-70 blur-md group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 animate-pulse pointer-events-none" />

      {/* Button card */}
      <button
        onClick={onClick}
        type="button"
        aria-label="Open AR Air Pollution Visualization"
        className="relative flex items-center gap-3.5 px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-900/95 hover:bg-slate-900 text-white rounded-2xl border border-emerald-500/40 shadow-2xl backdrop-blur-xl transition-all duration-300 transform group-hover:-translate-y-0.5 group-active:translate-y-0 text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 text-slate-950 font-black shadow-inner shadow-emerald-200/50 shrink-0">
          <Eye className="w-5 h-5 text-slate-950 transition-transform duration-300 group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
        </div>

        <div className="flex flex-col pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              AR Visualization
            </span>
            <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-2.5 h-2.5" /> 3D
            </span>
          </div>
          <span className="text-[11px] text-slate-300 font-medium leading-tight">
            {cityName ? `Simulate outdoor air in ${cityName}` : 'Simulate in 3D / Camera'}
            {typeof currentAQI === 'number' && (
              <span className="ml-1 text-emerald-400 font-bold">({currentAQI} AQI)</span>
            )}
          </span>
        </div>

        <div className="hidden sm:flex items-center justify-center w-6 h-6 rounded-lg bg-white/10 text-slate-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
};
