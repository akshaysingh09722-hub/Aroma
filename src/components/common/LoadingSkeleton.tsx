import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'card' | 'chart' | 'map' | 'text' | 'badge';
  count?: number;
}

export const LoadingSkeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'card',
  count = 1,
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'chart') {
    return (
      <div className={`rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4 animate-pulse ${className}`}>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-3 w-64 bg-slate-100 rounded" />
          </div>
          <div className="h-8 w-32 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-64 bg-slate-100/70 rounded-xl flex items-end p-4 gap-2">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="flex-1 bg-slate-200 rounded-t"
              style={{ height: `${30 + (idx % 5) * 15}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-3 w-48 bg-slate-100 rounded" />
          <div className="h-3 w-28 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'map') {
    return (
      <div className={`rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm animate-pulse ${className}`}>
        <div className="h-12 bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between">
          <div className="h-4 w-44 bg-slate-200 rounded" />
          <div className="h-4 w-28 bg-slate-200 rounded" />
        </div>
        <div className="h-72 bg-slate-200/60 relative flex items-center justify-center">
          <div className="text-slate-400 text-xs font-semibold">Initializing geospatial map layer...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={`rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4 animate-pulse ${className}`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-3 w-36 bg-slate-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-slate-200 rounded-full" />
          </div>
          <div className="h-12 w-28 bg-slate-200 rounded my-2" />
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="h-2 w-full bg-slate-100 rounded" />
            <div className="h-3 w-40 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </>
  );
};
