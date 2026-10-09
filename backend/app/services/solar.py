import json
from pathlib import Path
from typing import Dict, Any
from ..config import DATA_DIR

SOLAR_FILE = DATA_DIR / "solar_table.json"

def calculate_solar_simulation(roof_area_kw: float, city: str = "Bengaluru") -> Dict[str, Any]:
    with open(SOLAR_FILE, "r", encoding="utf-8") as f:
        solar_data = json.load(f)
    
    city_params = solar_data.get("cities", {}).get(city, solar_data["cities"]["Bengaluru"])

    kw = max(0.5, float(roof_area_kw))
    peak_sun_hours = city_params["peak_sun_hours_per_day"]
    performance_ratio = city_params["performance_ratio"]
    grid_tariff = city_params["grid_tariff_inr_per_kwh"]
    grid_factor = city_params["grid_emission_factor_kg_co2_kwh"]
    cost_per_kw = city_params["installed_cost_per_kw_inr"]

    # Annual generation formula: kW * peak_sun_hours * PR * 365
    annual_generation_kwh = round(kw * peak_sun_hours * performance_ratio * 365, 1)

    # Annual CO2e avoided (tons): (kWh * grid_factor) / 1000
    annual_co2e_avoided_tons = round((annual_generation_kwh * grid_factor) / 1000.0, 2)

    # Annual savings: generation * tariff
    annual_savings_inr = round(annual_generation_kwh * grid_tariff, 0)

    # Total system cost & payback
    total_installed_cost = kw * cost_per_kw
    payback_years = round(total_installed_cost / max(1.0, annual_savings_inr), 1)

    # Trees equivalent: ~21.7 kg CO2 absorbed per tree per year
    trees_equivalent = int((annual_co2e_avoided_tons * 1000.0) / 21.7)

    return {
        "roof_area_kw": kw,
        "annual_generation_kwh": annual_generation_kwh,
        "annual_co2e_avoided_tons": annual_co2e_avoided_tons,
        "annual_savings_inr": annual_savings_inr,
        "estimated_payback_years": payback_years,
        "trees_equivalent": trees_equivalent,
        "methodology_note": f"Solar PV model: {peak_sun_hours} peak sun hrs/day, {int(performance_ratio*100)}% PR, BESCOM tariff ₹{grid_tariff}/kWh. Benchmark data for {city}."
    }
