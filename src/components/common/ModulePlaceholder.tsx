import React from 'react';
import { LucideIcon, Sparkles, Terminal, Code2 } from 'lucide-react';

interface ModulePlaceholderProps {
  title: string;
  subtitle: string;
  assignedMember: string;
  memberRole: string;
  targetFile: string;
  icon: LucideIcon;
  badgeText?: string;
  children?: React.ReactNode;
  className?: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  title,
  subtitle,
  assignedMember,
  memberRole,
  targetFile,
  icon: Icon,
  badgeText = 'Phase 2 Module Interface',
  children,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border-2 border-dashed border-slate-300/80 bg-slate-50/70 p-6 sm:p-7 relative overflow-hidden transition-all hover:border-emerald-300 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-emerald-600 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {title}
              </h3>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-100/70 text-cyan-800 border border-cyan-200">
                {badgeText}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Member assignment pill */}
        <div className="shrink-0 bg-white border border-slate-200 rounded-xl p-3 shadow-sm min-w-[210px]">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Assigned: {assignedMember}</span>
          </div>
          <div className="text-xs font-semibold text-slate-800">{memberRole}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-slate-500 truncate" title={targetFile}>
            <Code2 className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{targetFile}</span>
          </div>
        </div>
      </div>

      {children ? (
        <div className="mt-4">{children}</div>
      ) : (
        <div className="mt-4 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Clean interface and typed data contracts ready for implementation
          </span>
          <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
            See README.md for module guidelines
          </span>
        </div>
      )}
    </div>
  );
};
