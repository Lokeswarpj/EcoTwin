import json
from pathlib import Path
from typing import Dict, Any, Tuple
from ..config import DATA_DIR

FACTORS_FILE = DATA_DIR / "emission_factors.json"

def load_emission_factors() -> Dict[str, Any]:
    with open(FACTORS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

FACTORS = load_emission_factors()

def calculate_electricity_impact(kwh: float, grid_key: str = "bescom_karnataka") -> Tuple[float, str]:
    grid = FACTORS.get("electricity", {}).get(grid_key, FACTORS["electricity"]["in_grid_average"])
    factor = grid["factor"]
    co2e_kg = round(kwh * factor, 2)
    assumption = f"{kwh} kWh × {factor} kg CO2e/kWh ({grid['source']})"
    return co2e_kg, assumption

def calculate_commute_impact(distance_km: float, mode_key: str, trips_per_week: int = 10) -> Tuple[float, str]:
    trans = FACTORS.get("transport", {}).get(mode_key, FACTORS["transport"]["car_petrol"])
    factor = trans["factor"]
    weekly_distance = distance_km * trips_per_week
    co2e_kg = round(weekly_distance * factor, 2)
    assumption = f"{weekly_distance:.1f} km/wk × {factor} kg CO2e/km ({trans['description']} - {trans['source']})"
    return co2e_kg, assumption

def calculate_waste_diversion(material_key: str, mass_kg: float) -> Tuple[float, str]:
    waste_item = FACTORS.get("waste", {}).get(material_key, FACTORS["waste"]["tetra_pak"])
    saving_factor = waste_item.get("diverted_saving", 1.0)
    co2e_saved = round(mass_kg * saving_factor, 2)
    assumption = f"{mass_kg} kg {material_key} × {saving_factor} kg CO2e/kg landfill avoidance ({waste_item['source']})"
    return co2e_saved, assumption

def calculate_water_impact(litres: float) -> Tuple[float, str]:
    water_item = FACTORS.get("water", {}).get("municipal_tap")
    factor = water_item["factor"]
    co2e_kg = round(litres * factor, 3)
    assumption = f"{litres} L × {factor} kg CO2e/L ({water_item['source']})"
    return co2e_kg, assumption
