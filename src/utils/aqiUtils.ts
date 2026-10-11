import { AQICategory, PollutantType } from '../types/airQuality';
import {
  CPCB_AQI_LEVELS,
  CPCBAQIScale,
  calculateCPCBNAQI,
  calculateCPCBSubIndex,
  getCPCBSale,
} from './cpcbAqiCalculator';

export {
  CPCB_AQI_LEVELS,
  calculateCPCBNAQI,
  calculateCPCBSubIndex,
  getCPCBSale,
};

export type AQIColorScale = CPCBAQIScale;

/**
 * Official Central Pollution Control Board (CPCB), Govt of India
 * National Air Quality Index (NAQI) Scale
 */
export const AQI_LEVELS: AQIColorScale[] = CPCB_AQI_LEVELS;

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function getAQIScale(aqi: number): AQIColorScale {
  return getCPCBSale(aqi);
}

/**
 * CPCB Criteria Pollutants Configuration & Regulatory Standards
 * Units:
 * - Particulate Matter (PM2.5, PM10): µg/m³ (24-hr)
 * - Nitrogen Dioxide (NO2): µg/m³ (24-hr)
 * - Sulfur Dioxide (SO2): µg/m³ (24-hr)
 * - Carbon Monoxide (CO): mg/m³ (8-hr)
 * - Ground-level Ozone (O3): µg/m³ (8-hr)
 * - Ammonia (NH3): µg/m³ (24-hr)
 * - Lead (Pb): µg/m³ (24-hr)
 */
export const POLLUTANT_CONFIG: Record<
  PollutantType,
  {
    name: string;
    formula: string;
    standardLimit: number; // CPCB National Ambient Air Quality Standard
    whoGuideline: number;
    unit: string;
    description: string;
    healthRisk: string;
  }
> = {
  pm25: {
    name: 'Fine Particulate Matter',
    formula: 'PM2.5',
    standardLimit: 60.0, // CPCB 24-hr standard: 60 µg/m³
    whoGuideline: 15.0,
    unit: 'µg/m³',
    description: 'Fine inhalable particles under 2.5 µm from vehicular exhaust, biomass burning, and thermal generation.',
    healthRisk: 'Penetrates deep into pulmonary alveoli; increases cardiovascular and chronic respiratory risks.',
  },
  pm10: {
    name: 'Coarse Particulate Matter',
    formula: 'PM10',
    standardLimit: 100.0, // CPCB 24-hr standard: 100 µg/m³
    whoGuideline: 45.0,
    unit: 'µg/m³',
    description: 'Inhalable dust, road re-suspension, construction debris, and coarse industrial particles under 10 µm.',
    healthRisk: 'Upper respiratory irritation, persistent cough, reduced lung vital capacity.',
  },
  no2: {
    name: 'Nitrogen Dioxide',
    formula: 'NO₂',
    standardLimit: 80.0, // CPCB 24-hr standard: 80 µg/m³
    whoGuideline: 25.0,
    unit: 'µg/m³',
    description: 'Reactive traffic gas formed in high-temperature diesel and petrol combustion; key precursor to winter smog.',
    healthRisk: 'Airway inflammation, heightened asthma frequency, reduced resistance to respiratory infections.',
  },
  so2: {
    name: 'Sulfur Dioxide',
    formula: 'SO₂',
    standardLimit: 80.0, // CPCB 24-hr standard: 80 µg/m³
    whoGuideline: 40.0,
    unit: 'µg/m³',
    description: 'Emissions from thermal power plants, brick kilns, and industrial coal combustion.',
    healthRisk: 'Bronchoconstriction, throat irritation, burning sensation, and aggravation of cardiac conditions.',
  },
  co: {
    name: 'Carbon Monoxide',
    formula: 'CO',
    standardLimit: 2.0, // CPCB 8-hr standard: 2.0 mg/m³
    whoGuideline: 4.0,
    unit: 'mg/m³',
    description: 'Toxic odorless gas resulting from incomplete combustion in vehicular idling and solid fuel usage.',
    healthRisk: 'Carboxyhemoglobin formation, reducing oxygen delivery to vital organs, causing headaches and fatigue.',
  },
  o3: {
    name: 'Ground-level Ozone',
    formula: 'O₃',
    standardLimit: 100.0, // CPCB 8-hr standard: 100 µg/m³
    whoGuideline: 100.0,
    unit: 'µg/m³',
    description: 'Secondary photochemical pollutant formed during sunny hours from volatile organic compounds and nitrogen oxides.',
    healthRisk: 'Chest pain, pulmonary oxidative damage, airway reactivity, and aggravated respiratory illness.',
  },
  nh3: {
    name: 'Ammonia',
    formula: 'NH₃',
    standardLimit: 400.0, // CPCB 24-hr standard: 400 µg/m³
    whoGuideline: 100.0,
    unit: 'µg/m³',
    description: 'Agricultural emissions, fertilizer handling, waste decomposition, and livestock management.',
    healthRisk: 'Eye and throat irritation, respiratory discomfort, exacerbation of asthma.',
  },
  pb: {
    name: 'Lead',
    formula: 'Pb',
    standardLimit: 1.0, // CPCB 24-hr standard: 1.0 µg/m³
    whoGuideline: 0.5,
    unit: 'µg/m³',
    description: 'Battery recycling, metal smelting, and industrial manufacturing emissions.',
    healthRisk: 'Neurotoxic impacts, renal impairment, and adverse cardiovascular consequences.',
  },
};

export function getPollutantRatio(type: PollutantType, value: number): number {
  const config = POLLUTANT_CONFIG[type];
  if (!config) return 0;
  return Math.min(Math.round((value / config.standardLimit) * 100), 250);
}

export function formatAQI(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
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
    case 'nh3':
      return 'NH₃';
    case 'pb':
      return 'Pb';
    default:
      return key.toUpperCase();
  }
}

/**
 * Formats timestamps in Indian Standard Time (IST - UTC+05:30)
 */
export function formatISTDateTime(isoOrDateString?: string | Date): string {
  if (!isoOrDateString) return 'Just now (IST)';
  try {
    const d = new Date(isoOrDateString);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d) + ' IST';
  } catch {
    return String(isoOrDateString);
  }
}
