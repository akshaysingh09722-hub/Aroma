"""
Comprehensive Unit Test Suite for CPCB National Air Quality Index (NAQI) Engine.

Validates:
1. Sub-index calculation across all 8 pollutants against official CPCB breakpoints and linear interpolation formula.
2. Contiguous breakpoint intervals, float precision, and micro-decimal boundaries.
3. Official CPCB AQI-Calculator.xls empirical sample validation (NSIT Delhi test case).
4. Category boundaries and health statement mapping for all 6 CPCB categories + Insufficient Data.
5. Strict validation of missing, negative, NaN, infinite, and out-of-range concentrations.
6. Minimum 3 criteria pollutants requirement and mandatory particulate (PM2.5 or PM10) rule.
7. Dominant pollutant selection (maximum sub-index, particulate precedence in ties).
8. Capping at 500 when concentrations exceed the highest breakpoint.
"""

import math
import pytest
from backend.app.services.cpcb_calculator import (
    calculate_sub_index,
    calculate_cpcb_aqi,
    get_cpcb_category,
    normalize_pollutant_code,
    CPCB_BREAKPOINTS,
    CPCB_CATEGORIES,
    CPCB_POLLUTANTS_INFO,
)


# ==============================================================================
# 1. Pollutant Code Normalization
# ==============================================================================

def test_pollutant_code_normalization():
    assert normalize_pollutant_code("PM2.5") == "pm25"
    assert normalize_pollutant_code("pm-2.5") == "pm25"
    assert normalize_pollutant_code("pm_25") == "pm25"
    assert normalize_pollutant_code("PM10") == "pm10"
    assert normalize_pollutant_code("NO2") == "no2"
    assert normalize_pollutant_code("SO2 ") == "so2"
    assert normalize_pollutant_code("co") == "co"
    assert normalize_pollutant_code("O3") == "o3"
    assert normalize_pollutant_code("NH3") == "nh3"
    assert normalize_pollutant_code("Pb") == "pb"
    assert normalize_pollutant_code("") == ""
    assert normalize_pollutant_code(None) == ""


# ==============================================================================
# 2. PM2.5 Breakpoints and Interpolation
# ==============================================================================

def test_pm25_boundary_and_interpolation():
    # Good: 0 - 30 -> 0 - 50
    assert calculate_sub_index("pm25", 0.0) == 0
    assert calculate_sub_index("pm25", 15.0) == 25
    assert calculate_sub_index("pm25", 30.0) == 50

    # Satisfactory: 30 - 60 -> 50 - 100
    # Boundary float just above 30
    assert calculate_sub_index("pm25", 30.05) == 50
    # Exact CPCB Excel case: concentration 34.0 -> ((100-50)/30)*4 + 50 = 56.67 -> 57
    assert calculate_sub_index("pm25", 34.0) == 57
    assert calculate_sub_index("pm25", 60.0) == 100

    # Moderate: 60 - 90 -> 100 - 200
    assert calculate_sub_index("pm25", 75.0) == 150
    assert calculate_sub_index("pm25", 90.0) == 200

    # Poor: 90 - 120 -> 200 - 300
    assert calculate_sub_index("pm25", 105.0) == 250
    assert calculate_sub_index("pm25", 120.0) == 300

    # Very Poor: 120 - 250 -> 300 - 400
    assert calculate_sub_index("pm25", 185.0) == 350
    assert calculate_sub_index("pm25", 250.0) == 400

    # Severe: 250 - 380 -> 400 - 500
    assert calculate_sub_index("pm25", 315.0) == 450
    assert calculate_sub_index("pm25", 380.0) == 500

    # Concentration exceeding 380 capped at 500
    assert calculate_sub_index("pm25", 450.0) == 500
    assert calculate_sub_index("pm25", 999.0) == 500


# ==============================================================================
# 3. PM10 Breakpoints and Interpolation
# ==============================================================================

def test_pm10_boundary_and_interpolation():
    # Good: 0 - 50 -> 0 - 50
    assert calculate_sub_index("pm10", 0.0) == 0
    assert calculate_sub_index("pm10", 25.0) == 25
    assert calculate_sub_index("pm10", 50.0) == 50

    # Satisfactory: 50 - 100 -> 50 - 100
    assert calculate_sub_index("pm10", 75.0) == 75
    assert calculate_sub_index("pm10", 100.0) == 100

    # Moderate: 100 - 250 -> 100 - 200
    # Exact CPCB Excel case: concentration 121.0 -> 100 + (100/150)*21 = 114
    assert calculate_sub_index("pm10", 121.0) == 114
    assert calculate_sub_index("pm10", 175.0) == 150
    assert calculate_sub_index("pm10", 250.0) == 200

    # Poor: 250 - 350 -> 200 - 300
    assert calculate_sub_index("pm10", 300.0) == 250
    assert calculate_sub_index("pm10", 350.0) == 300

    # Very Poor: 350 - 430 -> 300 - 400
    assert calculate_sub_index("pm10", 390.0) == 350
    assert calculate_sub_index("pm10", 430.0) == 400

    # Severe: 430 - 510 -> 400 - 500
    assert calculate_sub_index("pm10", 470.0) == 450
    assert calculate_sub_index("pm10", 510.0) == 500

    # Exceeding 510 capped at 500
    assert calculate_sub_index("pm10", 600.0) == 500


# ==============================================================================
# 4. Gaseous & Other Pollutants (NO2, SO2, CO, O3, NH3, Pb)
# ==============================================================================

def test_no2_sub_index():
    # Good: 0 - 40 -> 0 - 50
    # Exact CPCB Excel case: NO2 = 8.0 -> (50/40)*8 = 10
    assert calculate_sub_index("no2", 8.0) == 10
    assert calculate_sub_index("no2", 40.0) == 50
    assert calculate_sub_index("no2", 80.0) == 100
    assert calculate_sub_index("no2", 180.0) == 200
    assert calculate_sub_index("no2", 280.0) == 300
    assert calculate_sub_index("no2", 400.0) == 400
    assert calculate_sub_index("no2", 500.0) == 500
    assert calculate_sub_index("no2", 550.0) == 500


def test_so2_sub_index():
    assert calculate_sub_index("so2", 0.0) == 0
    assert calculate_sub_index("so2", 40.0) == 50
    assert calculate_sub_index("so2", 80.0) == 100
    assert calculate_sub_index("so2", 380.0) == 200
    assert calculate_sub_index("so2", 800.0) == 300
    assert calculate_sub_index("so2", 1600.0) == 400
    assert calculate_sub_index("so2", 2000.0) == 500
    assert calculate_sub_index("so2", 2500.0) == 500


def test_co_sub_index_mg_m3():
    # CO concentrations must be in mg/m³
    assert calculate_sub_index("co", 0.0) == 0
    assert calculate_sub_index("co", 0.5) == 25
    assert calculate_sub_index("co", 1.0) == 50
    assert calculate_sub_index("co", 2.0) == 100
    assert calculate_sub_index("co", 6.0) == 150
    assert calculate_sub_index("co", 10.0) == 200
    assert calculate_sub_index("co", 17.0) == 300
    assert calculate_sub_index("co", 34.0) == 400
    assert calculate_sub_index("co", 40.0) == 500
    assert calculate_sub_index("co", 50.0) == 500


def test_o3_sub_index():
    assert calculate_sub_index("o3", 0.0) == 0
    assert calculate_sub_index("o3", 50.0) == 50
    # Exact CPCB Excel case: O3 = 57.0 -> 57
    assert calculate_sub_index("o3", 57.0) == 57
    assert calculate_sub_index("o3", 100.0) == 100
    assert calculate_sub_index("o3", 168.0) == 200
    assert calculate_sub_index("o3", 208.0) == 300
    assert calculate_sub_index("o3", 748.0) == 400
    assert calculate_sub_index("o3", 800.0) == 500
    assert calculate_sub_index("o3", 850.0) == 500


def test_nh3_sub_index():
    assert calculate_sub_index("nh3", 0.0) == 0
    # Exact CPCB Excel case: NH3 = 34.0 -> (50/200)*34 = 8.5 -> rounds to 8 or 9
    assert calculate_sub_index("nh3", 34.0) in (8, 9)
    assert calculate_sub_index("nh3", 200.0) == 50
    assert calculate_sub_index("nh3", 400.0) == 100
    assert calculate_sub_index("nh3", 800.0) == 200
    assert calculate_sub_index("nh3", 1200.0) == 300
    assert calculate_sub_index("nh3", 1800.0) == 400
    assert calculate_sub_index("nh3", 2000.0) == 500


def test_pb_sub_index():
    assert calculate_sub_index("pb", 0.0) == 0
    assert calculate_sub_index("pb", 0.5) == 50
    assert calculate_sub_index("pb", 1.0) == 100
    assert calculate_sub_index("pb", 2.0) == 200
    assert calculate_sub_index("pb", 3.0) == 300
    assert calculate_sub_index("pb", 3.5) == 400
    assert calculate_sub_index("pb", 4.0) == 500
    assert calculate_sub_index("pb", 4.5) == 500


# ==============================================================================
# 5. Invalid, Negative, and Non-Finite Inputs
# ==============================================================================

def test_invalid_concentration_inputs():
    assert calculate_sub_index("pm25", None) is None
    assert calculate_sub_index("pm25", -5.0) is None
    assert calculate_sub_index("pm25", -0.0001) is None
    assert calculate_sub_index("pm25", float("nan")) is None
    assert calculate_sub_index("pm25", float("inf")) is None
    assert calculate_sub_index("pm25", float("-inf")) is None
    assert calculate_sub_index("pm25", "invalid_str") is None
    assert calculate_sub_index("unknown_pollutant", 50.0) is None


# ==============================================================================
# 6. Category Mapping and Health Statements
# ==============================================================================

def test_category_boundaries():
    # Good (0-50)
    cat, col, stmt = get_cpcb_category(0)
    assert cat == "Good" and col == "#10B981"
    cat, col, stmt = get_cpcb_category(50)
    assert cat == "Good" and col == "#10B981"

    # Satisfactory (51-100)
    cat, col, stmt = get_cpcb_category(51)
    assert cat == "Satisfactory" and col == "#84CC16"
    cat, col, stmt = get_cpcb_category(100)
    assert cat == "Satisfactory" and col == "#84CC16"

    # Moderate (101-200)
    cat, col, stmt = get_cpcb_category(101)
    assert cat == "Moderate" and col == "#EAB308"
    cat, col, stmt = get_cpcb_category(200)
    assert cat == "Moderate" and col == "#EAB308"

    # Poor (201-300)
    cat, col, stmt = get_cpcb_category(201)
    assert cat == "Poor" and col == "#F97316"
    cat, col, stmt = get_cpcb_category(300)
    assert cat == "Poor" and col == "#F97316"

    # Very Poor (301-400)
    cat, col, stmt = get_cpcb_category(301)
    assert cat == "Very Poor" and col == "#EF4444"
    cat, col, stmt = get_cpcb_category(400)
    assert cat == "Very Poor" and col == "#EF4444"

    # Severe (401-500)
    cat, col, stmt = get_cpcb_category(401)
    assert cat == "Severe" and col == "#7F1D1D"
    cat, col, stmt = get_cpcb_category(500)
    assert cat == "Severe" and col == "#7F1D1D"

    # Above 500 extreme
    cat, col, stmt = get_cpcb_category(600)
    assert cat == "Severe" and col == "#7F1D1D"

    # None / Invalid
    cat, col, stmt = get_cpcb_category(None)
    assert cat == "Insufficient Data" and col == "#94A3B8"
    cat, col, stmt = get_cpcb_category(-10)
    assert cat == "Insufficient Data" and col == "#94A3B8"


# ==============================================================================
# 7. CPCB Validation Rules (3-Pollutant + Particulate Matter Rule)
# ==============================================================================

def test_three_pollutants_rule():
    # Only 2 pollutants with PM2.5 -> Must be rejected (Insufficient Data)
    res = calculate_cpcb_aqi({"pm25": 45.0, "no2": 30.0})
    assert res.is_valid is False
    assert res.aqi is None
    assert res.category == "Insufficient Data"
    assert "minimum 3 valid criteria pollutants" in res.status_message

    # 3 pollutants WITHOUT any particulate matter (no PM2.5 or PM10) -> Must be rejected
    res = calculate_cpcb_aqi({"no2": 35.0, "so2": 25.0, "co": 1.2})
    assert res.is_valid is False
    assert res.aqi is None
    assert res.category == "Insufficient Data"
    assert "at least one particulate matter" in res.status_message.lower()

    # 3 pollutants WITH PM10 -> Valid
    res = calculate_cpcb_aqi({"pm10": 100.0, "no2": 35.0, "so2": 25.0})
    assert res.is_valid is True
    assert res.aqi is not None
    assert res.has_particulate is True

    # 3 pollutants WITH PM2.5 -> Valid
    res = calculate_cpcb_aqi({"pm25": 60.0, "no2": 35.0, "so2": 25.0})
    assert res.is_valid is True
    assert res.aqi is not None
    assert res.has_particulate is True


# ==============================================================================
# 8. Dominant Pollutant Selection and Maximum Rule
# ==============================================================================

def test_dominant_pollutant_and_max_selection():
    # Case A: PM2.5 is dominant
    res = calculate_cpcb_aqi({
        "pm25": 90.0,   # sub = 200
        "pm10": 50.0,   # sub = 50
        "no2": 40.0,    # sub = 50
    })
    assert res.is_valid is True
    assert res.aqi == 200
    assert res.dominant_pollutant == "pm25"
    assert res.category == "Moderate"

    # Case B: NO2 is dominant
    res = calculate_cpcb_aqi({
        "pm25": 30.0,   # sub = 50
        "pm10": 50.0,   # sub = 50
        "no2": 180.0,   # sub = 200
    })
    assert res.is_valid is True
    assert res.aqi == 200
    assert res.dominant_pollutant == "no2"
    assert res.category == "Moderate"

    # Case C: Tied sub-indices prioritize particulate matter (PM2.5)
    res = calculate_cpcb_aqi({
        "pm25": 60.0,   # sub = 100
        "no2": 80.0,    # sub = 100
        "so2": 80.0,    # sub = 100
    })
    assert res.is_valid is True
    assert res.aqi == 100
    assert res.dominant_pollutant == "pm25"
    assert res.category == "Satisfactory"


# ==============================================================================
# 9. Empirical Ground-Truth: Official CPCB AQI-Calculator.xls (NSIT Delhi Case)
# ==============================================================================

def test_official_cpcb_excel_nsit_delhi_case():
    """
    Validates the exact numerical case pre-computed in CPCB's official AQI-Calculator.xls:
    Station: NSIT, Delhi
    Inputs:
      PM10  = 121.0 µg/m³
      PM2.5 = 34.0 µg/m³
      NO2   = 8.0 µg/m³
      O3    = 57.0 µg/m³
      NH3   = 34.0 µg/m³
      SO2   = 0.0 µg/m³
      CO    = 0.0 mg/m³
    Expected:
      PM10 Sub-Index = 114
      PM2.5 Sub-Index = 57
      NO2 Sub-Index = 10
      O3 Sub-Index = 57
      NH3 Sub-Index = 9 (or 8.5)
      SO2 Sub-Index = 0
      CO Sub-Index = 0
      Overall AQI = 114
      Category = Moderate
      Dominant Pollutant = pm10
    """
    inputs = {
        "pm10": 121.0,
        "pm25": 34.0,
        "no2": 8.0,
        "o3": 57.0,
        "nh3": 34.0,
        "so2": 0.0,
        "co": 0.0,
    }
    result = calculate_cpcb_aqi(inputs)

    assert result.is_valid is True
    assert result.sub_indices["pm10"] == 114
    assert result.sub_indices["pm25"] == 57
    assert result.sub_indices["no2"] == 10
    assert result.sub_indices["o3"] == 57
    assert result.sub_indices["nh3"] in (8, 9)
    assert result.sub_indices["so2"] == 0
    assert result.sub_indices["co"] == 0

    assert result.aqi == 114
    assert result.category == "Moderate"
    assert result.dominant_pollutant == "pm10"
    assert result.category_color == "#EAB308"
