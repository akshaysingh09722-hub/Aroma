import { AQICategory, PollutantType } from '../types/airQuality';

export interface AQIColorScale {
  category: AQICategory;
  range: string;
  min: number;
  max: number;
  hex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeBg: string;
  badgeText: string;
  gradient: string;
  description: string;
  actionAdvice: string;
}

export const AQI_LEVELS: AQIColorScale[] = [
  {
    category: 'Good',
    range: '0 - 50',
    min: 0,
    max: 50,
    hex: '#10B981',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-950/60',
    badgeText: 'text-emerald-300',
    gradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
    description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
    actionAdvice: 'Ideal for outdoor activities, sports, and natural room ventilation.',
  },
  {
    category: 'Moderate',
    range: '51 - 100',
    min: 51,
    max: 100,
    hex: '#F59E0B',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    badgeBg: 'bg-amber-950/60',
    badgeText: 'text-amber-300',
    gradient: 'from-amber-500/20 via-amber-600/10 to-transparent',
    description: 'Air quality is acceptable; however, very sensitive individuals may experience mild symptoms.',
    actionAdvice: 'Unusually sensitive individuals should consider reducing prolonged heavy outdoor exertion.',
  },
  {
    category: 'Unhealthy for Sensitive Groups',
    range: '101 - 150',
    min: 101,
    max: 150,
    hex: '#F97316',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500/30',
    badgeBg: 'bg-orange-950/60',
    badgeText: 'text-orange-300',
    gradient: 'from-orange-500/20 via-orange-600/10 to-transparent',
    description: 'Members of sensitive groups (children, elderly, asthma patients) may experience health effects.',
    actionAdvice: 'Sensitive groups should reduce outdoor exercise and keep relief medication handy.',
  },
  {
    category: 'Unhealthy',
    range: '151 - 200',
    min: 151,
    max: 200,
    hex: '#EF4444',
    bgClass: 'bg-rose-500/10',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/30',
    badgeBg: 'bg-rose-950/60',
    badgeText: 'text-rose-300',
    gradient: 'from-rose-500/20 via-rose-600/10 to-transparent',
    description: 'Everyone may begin to experience health effects; members of sensitive groups may experience serious effects.',
    actionAdvice: 'Avoid prolonged outdoor exertion. Wear particulate respirators (N95/FFP2) when outside.',
  },
  {
    category: 'Very Unhealthy',
    range: '201 - 300',
    min: 201,
    max: 300,
    hex: '#8B5CF6',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/30',
    badgeBg: 'bg-purple-950/60',
    badgeText: 'text-purple-300',
    gradient: 'from-purple-500/20 via-purple-600/10 to-transparent',
    description: 'Health alert: The risk of health effects is increased for the entire population.',
    actionAdvice: 'Remain indoors with HEPA air filtration. Keep windows sealed and limit physical exertion.',
  },
  {
    category: 'Hazardous',
    range: '301 - 500+',
    min: 301,
    max: 999,
    hex: '#7F1D1D',
    bgClass: 'bg-red-950/30',
    textClass: 'text-red-400',
    borderClass: 'border-red-700/50',
    badgeBg: 'bg-red-950/80',
    badgeText: 'text-red-200',
    gradient: 'from-red-900/30 via-red-950/20 to-transparent',
    description: 'Health warning of emergency conditions: The entire population is likely to be severely affected.',
    actionAdvice: 'Emergency conditions. Avoid all outdoor activity. Use certified air purifiers indoors.',
  },
];

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function getAQIScale(aqi: number): AQIColorScale {
  const category = getAQICategory(aqi);
  return AQI_LEVELS.find((l) => l.category === category) || AQI_LEVELS[0];
}

export const POLLUTANT_CONFIG: Record<
  PollutantType,
  {
    name: string;
    formula: string;
    standardLimit: number;
    unit: string;
    whoGuideline: number;
    description: string;
    healthRisk: string;
  }
> = {
  pm25: {
    name: 'Fine Particulate Matter',
    formula: 'PM2.5',
    standardLimit: 35.0, // EPA 24h standard µg/m³
    whoGuideline: 15.0, // WHO 24h standard µg/m³
    unit: 'µg/m³',
    description: 'Microscopic inhalable combustion particles under 2.5 micrometers that penetrate deep into alveolar lung tissue and the bloodstream.',
    healthRisk: 'Increased cardiovascular mortality, respiratory irritation, asthma aggravation, systemic vascular inflammation.',
  },
  pm10: {
    name: 'Coarse Particulate Matter',
    formula: 'PM10',
    standardLimit: 150.0,
    whoGuideline: 45.0,
    unit: 'µg/m³',
    description: 'Inhalable dust, pollen, and debris under 10 micrometers that settle in the upper airway and bronchial passages.',
    healthRisk: 'Chronic bronchitis, reduced pulmonary function, wheezing, upper respiratory tract irritation.',
  },
  no2: {
    name: 'Nitrogen Dioxide',
    formula: 'NO₂',
    standardLimit: 100.0,
    whoGuideline: 25.0,
    unit: 'ppb',
    description: 'Gaseous pollutant formed from vehicle combustion and industrial fuel oxidation, precursor to ground-level ozone.',
    healthRisk: 'Airway inflammation, bronchospasm in asthmatics, increased susceptibility to respiratory infections.',
  },
  so2: {
    name: 'Sulfur Dioxide',
    formula: 'SO₂',
    standardLimit: 75.0,
    whoGuideline: 40.0,
    unit: 'ppb',
    description: 'Pungent reactive gas from coal combustion, oil refining, and metal smelting.',
    healthRisk: 'Acute bronchoconstriction, throat irritation, burning sensation, aggravation of coronary conditions.',
  },
  co: {
    name: 'Carbon Monoxide',
    formula: 'CO',
    standardLimit: 9.0,
    whoGuideline: 4.0,
    unit: 'ppm',
    description: 'Colorless, odorless toxic gas emitted from incomplete combustion of carbon-based fuels.',
    healthRisk: 'Binds with hemoglobin to form carboxyhemoglobin, impeding cellular oxygen delivery, causing headaches and hypoxia.',
  },
  o3: {
    name: 'Ground-level Ozone',
    formula: 'O₃',
    standardLimit: 70.0,
    whoGuideline: 50.0,
    unit: 'ppb',
    description: 'Secondary photochemical oxidant produced when nitrogen oxides and volatile organic compounds react in strong solar radiation.',
    healthRisk: 'Pulmonary oxidative stress, reduced lung capacity, premature cell necrosis, coughing and chest tightness.',
  },
};

export function getPollutantRatio(type: PollutantType, value: number): number {
  const config = POLLUTANT_CONFIG[type];
  if (!config) return 0;
  return Math.min(Math.round((value / config.standardLimit) * 100), 200);
}

export function formatAQI(val: number): string {
  return Math.round(val).toString();
}

export function formatConcentration(val: number, unit: string): string {
  if (val >= 100) return `${Math.round(val)} ${unit}`;
  return `${val.toFixed(1)} ${unit}`;
}

export function getDominantPollutantLabel(key: string): string {
  switch (key.toLowerCase()) {
    case 'pm25':
      return 'PM2.5';
    case 'pm10':
      return 'PM10';
    case 'no2':
      return 'NO₂';
    case 'so2':
      return 'SO₂';
    case 'co':
      return 'CO';
    case 'o3':
      return 'O₃';
    default:
      return key.toUpperCase();
  }
}
