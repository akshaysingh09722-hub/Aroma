"""
Central Pollution Control Board (CPCB), Government of India
National Air Quality Index (NAQI) Calculation Engine.

Based on official CPCB guidelines:
- Sub-index formula: I = ((I_hi - I_lo) / (B_hi - B_lo)) * (C - B_lo) + I_lo
- Minimum of 3 pollutants required with at least one particulate matter (PM2.5 or PM10).
- Overall AQI is the maximum of the valid sub-indices.
"""

from typing import Dict, Optional, Tuple, List, Any
from dataclasses import dataclass


@dataclass
class CPCBAQIResult:
    aqi: Optional[int]
    category: str
    category_color: str
    dominant_pollutant: Optional[str]
    sub_indices: Dict[str, int]
    health_statement: str
    is_valid: bool
    status_message: str


# Official CPCB Breakpoints: (B_low, B_high, I_low, I_high)
# Units:
# - PM2.5: µg/m³ (24-hr)
# - PM10: µg/m³ (24-hr)
# - NO2: µg/m³ (24-hr)
# - SO2: µg/m³ (24-hr)
# - CO: mg/m³ (8-hr)
# - O3: µg/m³ (8-hr)
# - NH3: µg/m³ (24-hr)
# - Pb: µg/m³ (24-hr)
CPCB_BREAKPOINTS = {
    "pm25": [
        (0.0, 30.0, 0, 50),
        (30.1, 60.0, 51, 100),
        (60.1, 90.0, 101, 200),
        (90.1, 120.0, 201, 300),
        (120.1, 250.0, 301, 400),
        (250.1, 380.0, 401, 500),
    ],
    "pm10": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 250.0, 101, 200),
        (250.1, 350.0, 201, 300),
        (350.1, 430.0, 301, 400),
        (430.1, 510.0, 401, 500),
    ],
    "no2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 180.0, 101, 200),
        (180.1, 280.0, 201, 300),
        (280.1, 400.0, 301, 400),
        (400.1, 500.0, 401, 500),
    ],
    "so2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 380.0, 101, 200),
        (381.1, 800.0, 201, 300),
        (800.1, 1600.0, 301, 400),
        (1600.1, 2000.0, 401, 500),
    ],
    "co": [
        (0.0, 1.0, 0, 50),
        (1.01, 2.0, 51, 100),
        (2.01, 10.0, 101, 200),
        (10.01, 17.0, 201, 300),
        (17.01, 34.0, 301, 400),
        (34.01, 40.0, 401, 500),
    ],
    "o3": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 168.0, 101, 200),
        (168.1, 208.0, 201, 300),
        (208.1, 748.0, 301, 400),
        (748.1, 800.0, 401, 500),
    ],
    "nh3": [
        (0.0, 200.0, 0, 50),
        (200.1, 400.0, 51, 100),
        (400.1, 800.0, 101, 200),
        (800.1, 1200.0, 201, 300),
        (1200.1, 1800.0, 301, 400),
        (1800.1, 2000.0, 401, 500),
    ],
    "pb": [
        (0.0, 0.5, 0, 50),
        (0.51, 1.0, 51, 100),
        (1.01, 2.0, 101, 200),
        (2.01, 3.0, 201, 300),
        (3.01, 3.5, 301, 400),
        (3.51, 4.0, 401, 500),
    ],
}

# CPCB National Categories, Ranges, Colors, and Health Statements
CPCB_CATEGORIES = [
    (0, 50, "Good", "#10B981", "Minimal impact on human health."),
    (51, 100, "Satisfactory", "#84CC16", "Minor breathing discomfort to sensitive people."),
    (101, 200, "Moderate", "#EAB308", "Breathing discomfort to people with lungs, asthma, and heart diseases."),
    (201, 300, "Poor", "#F97316", "Breathing discomfort to most people on prolonged exposure."),
    (301, 400, "Very Poor", "#EF4444", "Respiratory illness on prolonged exposure."),
    (401, 500, "Severe", "#7F1D1D", "Affects healthy people and seriously impacts those with existing diseases."),
]


def get_cpcb_category(aqi: int) -> Tuple[str, str, str]:
    """Returns (category_name, hex_color, health_statement) for an overall AQI."""
    if aqi is None:
        return "Unknown", "#94A3B8", "AQI unavailable or insufficient data."
    clamped = max(0, min(500, aqi))
    for low, high, cat, color, statement in CPCB_CATEGORIES:
        if low <= clamped <= high:
            return cat, color, statement
    # Above 500 is extreme severe
    return "Severe", "#7F1D1D", CPCB_CATEGORIES[-1][4]


def calculate_sub_index(pollutant: str, concentration: Optional[float]) -> Optional[int]:
    """
    Calculates sub-index for a single pollutant according to CPCB formula:
    I = ((I_hi - I_lo) / (B_hi - B_lo)) * (C - B_lo) + I_lo
    Returns None if concentration is missing, negative, or invalid.
    """
    if concentration is None or concentration < 0:
        return None

    code = pollutant.lower().replace(".", "").replace("-", "")
    breakpoints = CPCB_BREAKPOINTS.get(code)
    if not breakpoints:
        return None

    # Check breakpoints
    for b_lo, b_hi, i_lo, i_hi in breakpoints:
        if b_lo <= concentration <= b_hi:
            sub = ((i_hi - i_lo) / (b_hi - b_lo)) * (concentration - b_lo) + i_lo
            return int(round(sub))

    # If concentration exceeds highest breakpoint, cap at 500 as per CPCB protocol
    highest = breakpoints[-1]
    if concentration > highest[1]:
        return 500

    return None


def calculate_cpcb_aqi(pollutant_concentrations: Dict[str, Optional[float]]) -> CPCBAQIResult:
    """
    Calculates overall National Air Quality Index (NAQI) using CPCB methodology.

    Rules:
    1. Minimum of 3 pollutants must be monitored.
    2. At least one must be PM2.5 or PM10.
    3. The overall AQI is the maximum of the valid sub-indices.
    """
    sub_indices: Dict[str, int] = {}
    for code, val in pollutant_concentrations.items():
        if val is not None and val >= 0:
            sub = calculate_sub_index(code, val)
            if sub is not None:
                sub_indices[code] = sub

    has_pm25 = "pm25" in sub_indices
    has_pm10 = "pm10" in sub_indices
    has_particulate = has_pm25 or has_pm10
    pollutant_count = len(sub_indices)

    if pollutant_count < 3 or not has_particulate:
        # Insufficient data according to official CPCB rules
        reason = []
        if pollutant_count < 3:
            reason.append(f"At least 3 criteria pollutants required (only {pollutant_count} valid)")
        if not has_particulate:
            reason.append("At least one particulate pollutant (PM2.5 or PM10) required")

        return CPCBAQIResult(
            aqi=None,
            category="Insufficient Data",
            category_color="#94A3B8",
            dominant_pollutant=None,
            sub_indices=sub_indices,
            health_statement="Official CPCB AQI cannot be calculated due to insufficient monitored pollutants.",
            is_valid=False,
            status_message="; ".join(reason),
        )

    # Determine maximum sub-index (overall AQI)
    dominant_pol = max(sub_indices.items(), key=lambda item: item[1])[0]
    overall_aqi = sub_indices[dominant_pol]

    category, color, statement = get_cpcb_category(overall_aqi)

    return CPCBAQIResult(
        aqi=overall_aqi,
        category=category,
        category_color=color,
        dominant_pollutant=dominant_pol,
        sub_indices=sub_indices,
        health_statement=statement,
        is_valid=True,
        status_message="Calculated in full accordance with CPCB NAQI guidelines.",
    )
