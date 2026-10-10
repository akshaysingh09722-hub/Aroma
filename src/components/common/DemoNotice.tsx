import React from 'react';
import { Info, Sparkles } from 'lucide-react';
import { api, DataSourceMode } from '../../services/api';

interface DemoNoticeProps {
  message?: string;
  className?: string;
}

export const DemoNotice: React.FC<DemoNoticeProps> = ({
  message = 'Sample dataset active for frontend development. Values are illustrative and not real-time sensor measurements.',
  className = '',
}) => {
  const [mode, setMode] = React.useState<DataSourceMode>(api.getMode());

  React.useEffect(() => {
    return api.subscribeModeChange(setMode);
  }, []);

  const toggleMode = () => {
    const nextMode = mode === 'mock' ? 'live' : 'mock';
    api.setMode(nextMode);
  };

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
        mode === 'mock'
          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
          : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        <Info className={`w-4 h-4 shrink-0 ${mode === 'mock' ? 'text-amber-600' : 'text-emerald-600'}`} />
        <span className="font-medium">
          <strong className="font-semibold uppercase tracking-wider text-[11px] mr-1.5 px-1.5 py-0.5 rounded bg-white/70 border border-current">
            {mode === 'mock' ? 'DEMO DATA' : 'LIVE API'}
          </strong>
          {message}
        </span>
      </div>

      <button
        onClick={toggleMode}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white text-xs font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors w-fit shrink-0"
        title="Toggle between mock datasets and live backend endpoints"
      >
        <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
        Switch to {mode === 'mock' ? 'Live API Mode' : 'Demo Mock Mode'}
      </button>
    </div>
  );
};
