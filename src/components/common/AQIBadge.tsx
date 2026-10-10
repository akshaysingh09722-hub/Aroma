import React from 'react';
import { AQICategory } from '../../types/airQuality';
import { getAQIScale } from '../../utils/aqiUtils';

interface AQIBadgeProps {
  aqi: number;
  category?: AQICategory;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AQIBadge: React.FC<AQIBadgeProps> = ({
  aqi,
  category,
  showValue = true,
  size = 'md',
  className = '',
}) => {
  const scale = getAQIScale(aqi);
  const displayCategory = category || scale.category;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all ${scale.badgeBg} ${scale.badgeText} ${scale.borderClass} ${sizeClasses[size]} ${className}`}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0 animate-pulse"
        style={{ backgroundColor: scale.hex }}
      />
      {showValue && (
        <span className="font-bold tabular-nums">
          AQI {Math.round(aqi)}
        </span>
      )}
      {showValue && <span className="opacity-40">•</span>}
      <span>{displayCategory}</span>
    </span>
  );
};
