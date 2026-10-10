import React from 'react';
import { HealthRecommendations, AQICategory } from '../../types/airQuality';
import {
  Users,
  HeartPulse,
  Activity,
  DoorOpen,
  ShieldCheck,
} from 'lucide-react';

interface HealthAdvisoryProps {
  recommendations: HealthRecommendations;
  category: AQICategory;
  className?: string;
}

export const HealthAdvisory: React.FC<HealthAdvisoryProps> = ({
  recommendations,
  category,
  className = '',
}) => {
  const items = [
    {
      title: 'General Public',
      text: recommendations.general,
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: 'Sensitive Groups',
      text: recommendations.sensitiveGroups,
      icon: HeartPulse,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      title: 'Outdoor Activities',
      text: recommendations.outdoorActivities,
      icon: Activity,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Indoor Ventilation',
      text: recommendations.ventilation,
      icon: DoorOpen,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    },
    {
      title: 'Masks & Respirators',
      text: recommendations.masksAndProtection,
      icon: ShieldCheck,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ];

  return (
    <div
      className={`rounded-2xl bg-white border border-slate-200 shadow-card p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Health & Activity Advisory
          </h3>
          <p className="text-xs text-slate-500">
            Guidance calibrated for {category} air quality
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          WHO & EPA Aligned
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${item.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
