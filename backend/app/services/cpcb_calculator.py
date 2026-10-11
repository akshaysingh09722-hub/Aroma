"""
Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change,
Government of India — National Air Quality Index (NAQI) Calculation Engine.

Verified and audited against:
1. CPCB Technical Report: "National Air Quality Index" (October 2014), Table 3 & Section 3.2.
2. Official CPCB Operational Calculator: `AQI-Calculator.xls` (downloaded from https://cpcb.nic.in/upload/national-air-quality-index/AQI-Calculator.xls).
3. Central Pollution Control Board NAAQS (National Ambient Air Quality Standards) Gazette Notification (2009).

Methodology Rules:
- Linear segmented interpolation formula:
      I_p = [ (I_hi - I_lo) / (B_hi - B_lo) ] * (C_p - B_lo) + I_lo
- Minimum of 3 criteria pollutants must be present with valid sub-indices.
- At least one particulate pollutant (PM2.5 or PM10) is mandatory.
- Overall AQI is the maximum of the valid sub-indices.
- Dominant pollutant is the pollutant with the maximum sub-index.
- Sub-indices and overall AQI are rounded to the nearest integer.
- Non-finite (NaN, inf), negative, or missing values are rejected as invalid.
- CPCB sub-index is capped at 500 when concentration exceeds the highest breakpoint.
"""

import math
from typing import Dict, Optional, Tuple, List, Any
from dataclasses import dataclass, field


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
    pollutants_present: List[str] = field(default_factory=list)
    has_particulate: bool = False


# Official CPCB Breakpoints: (B_low, B_high, I_low, I_high)
# Verified against CPCB October 2014 Report Table 3 and decompiled AQI-Calculator.xls:
# - PM2.5: µg/m³, 24-hr averaging period
# - PM10:  µg/m³, 24-hr averaging period
# - NO2:   µg/m³, 24-hr averaging period
# - SO2:   µg/m³, 24-hr averaging period
# - CO:    mg/m³, 8-hr averaging period (Concentrations MUST be in mg/m³)
# - O3:    µg/m³, 8-hr averaging period
# - NH3:   µg/m³, 24-hr averaging period
# - Pb:    µg/m³, 24-hr averaging period
CPCB_BREAKPOINTS = {
    "pm25": [
        (0.0, 30.0, 0, 50),
        (30.0, 60.0, 50, 100),
        (60.0, 90.0, 100, 200),
        (90.0, 120.0, 200, 300),
        (120.0, 250.0, 300, 400),
        (250.0, 380.0, 400, 500),
    ],
    "pm10": [
        (0.0, 50.0, 0, 50),
        (50.0, 100.0, 50, 100),
        (100.0, 250.0, 100, 200),
        (250.0, 350.0, 200, 300),
        (350.0, 430.0, 300, 400),
        (430.0, 510.0, 400, 500),
    ],
    "no2": [
        (0.0, 40.0, 0, 50),
        (40.0, 80.0, 50, 100),
        (80.0, 180.0, 100, 200),
        (180.0, 280.0, 200, 300),
        (280.0, 400.0, 300, 400),
        (400.0, 500.0, 400, 500),
    ],
    "so2": [
        (0.0, 40.0, 0, 50),
        (40.0, 80.0, 50, 100),
        (80.0, 380.0, 100, 200),
        (380.0, 800.0, 200, 300),
        (800.0, 1600.0, 300, 400),
        (1600.0, 2000.0, 400, 500),
    ],
    "co": [
        (0.0, 1.0, 0, 50),
        (1.0, 2.0, 50, 100),
        (2.0, 10.0, 100, 200),
        (10.0, 17.0, 200, 300),
        (17.0, 34.0, 300, 400),
        (34.0, 40.0, 400, 500),
    ],
    "o3": [
        (0.0, 50.0, 0, 50),
        (50.0, 100.0, 50, 100),
        (100.0, 168.0, 100, 200),
        (168.0, 208.0, 200, 300),
        (208.0, 748.0, 300, 400),
        (748.0, 800.0, 400, 500),
    ],
    "nh3": [
        (0.0, 200.0, 0, 50),
        (200.0, 400.0, 50, 100),
        (400.0, 800.0, 100, 200),
        (800.0, 1200.0, 200, 300),
        (1200.0, 1800.0, 300, 400),
        (1800.0, 2000.0, 400, 500),
    ],
    "pb": [
        (0.0, 0.5, 0, 50),
        (0.5, 1.0, 50, 100),
        (1.0, 2.0, 100, 200),
        (2.0, 3.0, 200, 300),
        (3.0, 3.5, 300, 400),
        (3.5, 4.0, 400, 500),
    ],
}

# CPCB Criteria Pollutants Metadata & Standards
CPCB_POLLUTANTS_INFO = {
    "pm25": {
        "name": "Particulate Matter 2.5",
        "unit": "µg/m³",
        "averaging_period": "24-hr",
        "naaqs_standard": 60.0,
        "is_particulate": True,
    },
    "pm10": {
        "name": "Particulate Matter 10",
        "unit": "µg/m³",
        "averaging_period": "24-hr",
        "naaqs_standard": 100.0,
        "is_particulate": True,
    },
    "no2": {
        "name": "Nitrogen Dioxide",
        "unit": "µg/m³",
        "averaging_period": "24-hr",
        "naaqs_standard": 80.0,
        "is_particulate": False,
    },
    "so2": {
        "name": "Sulfur Dioxide",
        "unit": "µg/m³",
        "averaging_period": "24-hr",
        "naaqs_standard": 80.0,
        "is_particulate": False,
    },
    "co": {
        "name": "Carbon Monoxide",
        "unit": "mg/m³",
        "averaging_period": "8-hr",
        "naaqs_standard": 2.0,
        "is_particulate": False,
    },
    "o3": {
        "name": "Ozone",
        "unit": "µg/m³",
        "averaging_period": "8-hr",
        "naaqs_standard": 100.0,
        "is_particulate": False,
    },
    "nh3": {
        "name": "Ammonia",
        "unit": "µg/m³",
        "averaging_period": "24-hr",
        "naaqs_standard": 400.0,
        "is_particulate": False,
    },
    "pb": {
        "name": "Lead",
        "unit": "µg/m³",
        "averaging_period": "24-hr",
        "naaqs_standard": 1.0,
        "is_particulate": False,
    },
}

# CPCB National Categories, Ranges, Colors, and Health Statements
# Verified against CPCB NAQI guidelines
CPCB_CATEGORIES = [
    (0, 50, "Good", "#10B981", "Minimal impact on human health."),
    (51, 100, "Satisfactory", "#84CC16", "Minor breathing discomfort to sensitive people."),
    (101, 200, "Moderate", "#EAB308", "Breathing discomfort to people with lung, asthma, and heart diseases."),
    (201, 300, "Poor", "#F97316", "Breathing discomfort to most people on prolonged exposure."),
    (301, 400, "Very Poor", "#EF4444", "Respiratory illness on prolonged exposure."),
    (401, 500, "Severe", "#7F1D1D", "Affects healthy people and seriously impacts those with existing diseases."),
]


def normalize_pollutant_code(pollutant: str) -> str:
    """Normalizes pollutant keys such as 'PM2.5', 'pm_25', 'pm-2.5' to standard code 'pm25'."""
    if not pollutant or not isinstance(pollutant, str):
        return ""
    return (
        pollutant.lower()
        .replace(".", "")
        .replace("-", "")
        .replace("_", "")
        .replace(" ", "")
        .strip()
    )


def get_cpcb_category(aqi: Optional[int]) -> Tuple[str, str, str]:
    """
    Returns (category_name, hex_color, health_statement) for an overall AQI.
    Returns ('Insufficient Data', '#94A3B8', ...) if AQI is None.
    """
    if aqi is None:
        return "Insufficient Data", "#94A3B8", "AQI unavailable or insufficient monitored pollutants."
    if aqi < 0:
        return "Insufficient Data", "#94A3B8", "Invalid negative AQI value."

    # Look up in standard categories
    for low, high, cat, color, statement in CPCB_CATEGORIES:
        if low <= aqi <= high:
            return cat, color, statement

    # AQI > 500 is extreme severe / emergency conditions
    return "Severe", "#7F1D1D", CPCB_CATEGORIES[-1][4]


def calculate_sub_index(pollutant: str, concentration: Any) -> Optional[int]:
    """
    Calculates sub-index for a single pollutant according to official CPCB linear interpolation:
        I = [ (I_hi - I_lo) / (B_hi - B_lo) ] * (C - B_lo) + I_lo

    Validation Rules:
    - Returns None if concentration is None, non-numeric, NaN, infinite, or negative.
    - Continuous breakpoint intervals: first interval is [B_lo, B_hi], subsequent are (B_lo, B_hi].
    - Concentrations exceeding the highest breakpoint are capped at 500 per CPCB methodology.
    - Sub-index is rounded to the nearest integer.
    """
    if concentration is None:
        return None

    # Type & finiteness validation
    try:
        val = float(concentration)
    except (ValueError, TypeError):
        return None

    if math.isnan(val) or math.isinf(val):
        return None

    if val < 0.0:
        return None

    code = normalize_pollutant_code(pollutant)
    breakpoints = CPCB_BREAKPOINTS.get(code)
    if not breakpoints:
        return None

    # Continuous interval evaluation
    for i, (b_lo, b_hi, i_lo, i_hi) in enumerate(breakpoints):
        in_range = (b_lo <= val <= b_hi) if i == 0 else (b_lo < val <= b_hi)
        if in_range:
            if b_hi == b_lo:
                return i_lo
            sub = ((i_hi - i_lo) / (b_hi - b_lo)) * (val - b_lo) + i_lo
            return int(round(sub))

    # If concentration exceeds highest breakpoint, cap at 500 as per CPCB NAQI protocol
    highest_b_hi = breakpoints[-1][1]
    if val > highest_b_hi:
        return 500

    return None


def calculate_cpcb_aqi(pollutant_concentrations: Dict[str, Any]) -> CPCBAQIResult:
    """
    Calculates overall National Air Quality Index (NAQI) using official CPCB methodology.

    Rules:
    1. Minimum of 3 criteria pollutants must be successfully measured and valid.
    2. At least one particulate matter (PM2.5 or PM10) must be included.
    3. The overall AQI is the maximum of the valid sub-indices.
    4. The dominant pollutant is the one with the maximum sub-index. If multiple tie,
       particulate matter is given precedence.
    5. Returns is_valid=False with category="Insufficient Data" and a clear explanatory
       status message whenever requirements are not satisfied.
    """
    if not isinstance(pollutant_concentrations, dict):
        return CPCBAQIResult(
            aqi=None,
            category="Insufficient Data",
            category_color="#94A3B8",
            dominant_pollutant=None,
            sub_indices={},
            health_statement="Invalid input: pollutant_concentrations must be a dictionary.",
            is_valid=False,
            status_message="Invalid input payload.",
            pollutants_present=[],
            has_particulate=False,
        )

    sub_indices: Dict[str, int] = {}
    for raw_code, raw_val in pollutant_concentrations.items():
        norm_code = normalize_pollutant_code(raw_code)
        if not norm_code or norm_code not in CPCB_BREAKPOINTS:
            continue
        sub = calculate_sub_index(norm_code, raw_val)
        if sub is not None:
            sub_indices[norm_code] = sub

    has_pm25 = "pm25" in sub_indices
    has_pm10 = "pm10" in sub_indices
    has_particulate = has_pm25 or has_pm10
    pollutants_present = list(sub_indices.keys())
    pollutant_count = len(sub_indices)

    # Validate CPCB prerequisites
    if pollutant_count < 3 or not has_particulate:
        reasons = []
        if pollutant_count < 3:
            reasons.append(
                f"CPCB NAQI requires minimum 3 valid criteria pollutants (received {pollutant_count})"
            )
        if not has_particulate:
            reasons.append(
                "CPCB NAQI requires at least one particulate matter pollutant (PM2.5 or PM10)"
            )

        status_msg = "; ".join(reasons)
        return CPCBAQIResult(
            aqi=None,
            category="Insufficient Data",
            category_color="#94A3B8",
            dominant_pollutant=None,
            sub_indices=sub_indices,
            health_statement=(
                "Official CPCB NAQI cannot be calculated: "
                "Minimum 3 criteria pollutants with at least one particulate matter (PM2.5 or PM10) required."
            ),
            is_valid=False,
            status_message=status_msg,
            pollutants_present=pollutants_present,
            has_particulate=has_particulate,
        )

    # Determine maximum sub-index (overall AQI)
    max_val = max(sub_indices.values())

    # Find dominant pollutant: if tie, prioritize particulate matter (pm25 then pm10)
    tied_pollutants = [p for p, s in sub_indices.items() if s == max_val]
    if "pm25" in tied_pollutants:
        dominant_pol = "pm25"
    elif "pm10" in tied_pollutants:
        dominant_pol = "pm10"
    else:
        dominant_pol = tied_pollutants[0]

    overall_aqi = max_val
    category, color, statement = get_cpcb_category(overall_aqi)

    return CPCBAQIResult(
        aqi=overall_aqi,
        category=category,
        category_color=color,
        dominant_pollutant=dominant_pol,
        sub_indices=sub_indices,
        health_statement=statement,
        is_valid=True,
        status_message="Calculated in full accordance with official CPCB NAQI guidelines.",
        pollutants_present=pollutants_present,
        has_particulate=True,
    )
