/**
 * Central Pollution Control Board (CPCB), Ministry of Environment, Forest & Climate Change, Govt of India
 * Official National Air Quality Index (NAQI) Calculation Engine (TypeScript / Client-side).
 */

export type CPCB_CategoryName =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe'
  | 'Insufficient Data';

export interface CPCBAQIScale {
  category: CPCB_CategoryName;
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

export const CPCB_AQI_LEVELS: CPCBAQIScale[] = [
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
    description: 'Minimal impact on human health.',
    actionAdvice: 'Ideal for all outdoor activities and natural room ventilation.',
  },
  {
    category: 'Satisfactory',
    range: '51 - 100',
    min: 51,
    max: 100,
    hex: '#84CC16',
    bgClass: 'bg-lime-500/10',
    textClass: 'text-lime-400',
    borderClass: 'border-lime-500/30',
    badgeBg: 'bg-lime-950/60',
    badgeText: 'text-lime-300',
    gradient: 'from-lime-500/20 via-lime-600/10 to-transparent',
    description: 'Minor breathing discomfort to sensitive people.',
    actionAdvice: 'Sensitive individuals should consider monitoring heavy exertion outdoors.',
  },
  {
    category: 'Moderate',
    range: '101 - 200',
    min: 101,
    max: 200,
    hex: '#EAB308',
    bgClass: 'bg-yellow-500/10',
    textClass: 'text-yellow-400',
    borderClass: 'border-yellow-500/30',
    badgeBg: 'bg-yellow-950/60',
    badgeText: 'text-yellow-300',
    gradient: 'from-yellow-500/20 via-yellow-600/10 to-transparent',
    description: 'Breathing discomfort to people with lung disease, asthma, and heart conditions.',
    actionAdvice: 'Reduce intense prolonged outdoor sports; keep rescue inhalers handy if asthmatic.',
  },
  {
    category: 'Poor',
    range: '201 - 300',
    min: 201,
    max: 300,
    hex: '#F97316',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500/30',
    badgeBg: 'bg-orange-950/60',
    badgeText: 'text-orange-300',
    gradient: 'from-orange-500/20 via-orange-600/10 to-transparent',
    description: 'Breathing discomfort to most people on prolonged exposure.',
    actionAdvice: 'Avoid prolonged outdoor jogging; wear N95/FFP2 masks during morning and evening rush.',
  },
  {
    category: 'Very Poor',
    range: '301 - 400',
    min: 301,
    max: 400,
    hex: '#EF4444',
    bgClass: 'bg-rose-500/10',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/30',
    badgeBg: 'bg-rose-950/60',
    badgeText: 'text-rose-300',
    gradient: 'from-rose-500/20 via-rose-600/10 to-transparent',
    description: 'Respiratory illness to the people on prolonged exposure.',
    actionAdvice: 'Keep doors and windows shut; run indoor HEPA purifiers; vulnerable groups remain indoors.',
  },
  {
    category: 'Severe',
    range: '401 - 500+',
    min: 401,
    max: 999,
    hex: '#7F1D1D',
    bgClass: 'bg-red-950/30',
    textClass: 'text-red-400',
    borderClass: 'border-red-600/40',
    badgeBg: 'bg-red-950',
    badgeText: 'text-red-300',
    gradient: 'from-red-600/30 via-red-900/20 to-transparent',
    description: 'Affects healthy people and seriously impacts those with existing diseases.',
    actionAdvice: 'Health emergency: completely avoid outdoor exposure. Work from home where feasible.',
  },
];

// Official CPCB Breakpoints: [B_low, B_high, I_low, I_high]
const CPCB_BREAKPOINTS: Record<string, [number, number, number, number][]> = {
  pm25: [
    [0.0, 30.0, 0, 50],
    [30.1, 60.0, 51, 100],
    [60.1, 90.0, 101, 200],
    [90.1, 120.0, 201, 300],
    [120.1, 250.0, 301, 400],
    [250.1, 380.0, 401, 500],
  ],
  pm10: [
    [0.0, 50.0, 0, 50],
    [50.1, 100.0, 51, 100],
    [100.1, 250.0, 101, 200],
    [250.1, 350.0, 201, 300],
    [350.1, 430.0, 301, 400],
    [430.1, 510.0, 401, 500],
  ],
  no2: [
    [0.0, 40.0, 0, 50],
    [40.1, 80.0, 51, 100],
    [80.1, 180.0, 101, 200],
    [180.1, 280.0, 201, 300],
    [280.1, 400.0, 301, 400],
    [400.1, 500.0, 401, 500],
  ],
  so2: [
    [0.0, 40.0, 0, 50],
    [40.1, 80.0, 51, 100],
    [80.1, 380.0, 101, 200],
    [381.1, 800.0, 201, 300],
    [800.1, 1600.0, 301, 400],
    [1600.1, 2000.0, 401, 500],
  ],
  co: [
    [0.0, 1.0, 0, 50],
    [1.01, 2.0, 51, 100],
    [2.01, 10.0, 101, 200],
    [10.01, 17.0, 201, 300],
    [17.01, 34.0, 301, 400],
    [34.01, 40.0, 401, 500],
  ],
  o3: [
    [0.0, 50.0, 0, 50],
    [50.1, 100.0, 51, 100],
    [100.1, 168.0, 101, 200],
    [168.1, 208.0, 201, 300],
    [208.1, 748.0, 301, 400],
    [748.1, 800.0, 401, 500],
  ],
  nh3: [
    [0.0, 200.0, 0, 50],
    [200.1, 400.0, 51, 100],
    [400.1, 800.0, 101, 200],
    [800.1, 1200.0, 201, 300],
    [1200.1, 1800.0, 301, 400],
    [1800.1, 2000.0, 401, 500],
  ],
  pb: [
    [0.0, 0.5, 0, 50],
    [0.51, 1.0, 51, 100],
    [1.01, 2.0, 101, 200],
    [2.01, 3.0, 201, 300],
    [3.01, 3.5, 301, 400],
    [3.51, 4.0, 401, 500],
  ],
};

export function calculateCPCBSubIndex(pollutant: string, concentration: number | null | undefined): number | null {
  if (concentration === null || concentration === undefined || concentration < 0 || isNaN(concentration)) {
    return null;
  }

  const key = pollutant.toLowerCase().replace(/[^a-z0-9]/g, '');
  const intervals = CPCB_BREAKPOINTS[key];
  if (!intervals) return null;

  for (const [bLo, bHi, iLo, iHi] of intervals) {
    if (concentration >= bLo && concentration <= bHi) {
      const sub = ((iHi - iLo) / (bHi - bLo)) * (concentration - bLo) + iLo;
      return Math.round(sub);
    }
  }

  // If concentration exceeds maximum published breakpoint, cap at 500 per CPCB rules
  const last = intervals[intervals.length - 1];
  if (concentration > last[1]) {
    return 500;
  }

  return null;
}

export interface CPCBCalculationResult {
  aqi: number | null;
  category: CPCB_CategoryName;
  scale: CPCBAQIScale;
  dominantPollutant: string | null;
  subIndices: Record<string, number>;
  isValid: boolean;
  statusMessage: string;
}

export function calculateCPCBNAQI(concentrations: Record<string, number | null | undefined>): CPCBCalculationResult {
  const subIndices: Record<string, number> = {};

  for (const [key, val] of Object.entries(concentrations)) {
    const sub = calculateCPCBSubIndex(key, val);
    if (sub !== null) {
      subIndices[key.toLowerCase()] = sub;
    }
  }

  const hasPm25 = 'pm25' in subIndices;
  const hasPm10 = 'pm10' in subIndices;
  const hasParticulate = hasPm25 || hasPm10;
  const validCount = Object.keys(subIndices).length;

  if (validCount < 3 || !hasParticulate) {
    const missing: string[] = [];
    if (validCount < 3) missing.push(`At least 3 criteria pollutants required (only ${validCount} valid)`);
    if (!hasParticulate) missing.push('At least one particulate pollutant (PM2.5 or PM10) required');

    const fallbackScale = CPCB_AQI_LEVELS[2]; // Moderate fallback styling for UI
    return {
      aqi: null,
      category: 'Insufficient Data',
      scale: {
        ...fallbackScale,
        category: 'Insufficient Data',
        hex: '#94A3B8',
        description: 'Official CPCB AQI cannot be computed because criteria requirements are not satisfied.',
      },
      dominantPollutant: null,
      subIndices,
      isValid: false,
      statusMessage: missing.join('; '),
    };
  }

  let maxAqi = -1;
  let dominantPol = 'pm25';

  for (const [pol, sub] of Object.entries(subIndices)) {
    if (sub > maxAqi) {
      maxAqi = sub;
      dominantPol = pol;
    }
  }

  const scale = getCPCBSale(maxAqi);
  return {
    aqi: maxAqi,
    category: scale.category,
    scale,
    dominantPollutant: dominantPol,
    subIndices,
    isValid: true,
    statusMessage: 'Calculated in accordance with Central Pollution Control Board (CPCB) NAQI formula.',
  };
}

export function getCPCBSale(aqi: number | null | undefined): CPCBAQIScale {
  if (aqi === null || aqi === undefined || isNaN(aqi)) {
    return {
      category: 'Insufficient Data',
      range: 'N/A',
      min: 0,
      max: 0,
      hex: '#94A3B8',
      bgClass: 'bg-slate-500/10',
      textClass: 'text-slate-400',
      borderClass: 'border-slate-500/30',
      badgeBg: 'bg-slate-900',
      badgeText: 'text-slate-300',
      gradient: 'from-slate-500/20 to-transparent',
      description: 'Air quality data currently unavailable or unverified.',
      actionAdvice: 'Awaiting station telemetry.',
    };
  }

  const clamped = Math.max(0, Math.min(500, Math.round(aqi)));
  for (const lvl of CPCB_AQI_LEVELS) {
    if (clamped >= lvl.min && clamped <= lvl.max) {
      return lvl;
    }
  }
  return CPCB_AQI_LEVELS[CPCB_AQI_LEVELS.length - 1];
}
