from typing import Dict, Any, List
from datetime import datetime, timezone
from ..database.repositories import get_all_events, get_budget_config

def generate_forecast() -> Dict[str, Any]:
    events = get_all_events(limit=100)
    cfg = get_budget_config()

    carbon_budget = float(cfg["monthly_carbon_budget_kg"])
    waste_budget = float(cfg["monthly_waste_budget_kg"])
    water_budget = float(cfg["monthly_water_budget_l"])

    day_of_month = datetime.now(timezone.utc).day
    days_in_month = 30
    days_elapsed = max(1, day_of_month)
    days_remaining = max(1, days_in_month - day_of_month)

    # Accumulate by category
    category_carbon = {}
    total_carbon = 0.0
    total_waste_diverted = 0.0
    total_water = 0.0

    for ev in events:
        c = float(ev.get("carbon_impact_kg", 0.0))
        act = ev.get("activity_type", "other")
        if c > 0:
            category_carbon[act] = category_carbon.get(act, 0.0) + c
            total_carbon += c
        total_waste_diverted += float(ev.get("waste_diverted_kg", 0.0))
        total_water += float(ev.get("water_consumed_l", 0.0))

    # Daily burn rates
    daily_carbon_rate = total_carbon / days_elapsed
    daily_water_rate = total_water / days_elapsed

    # Projections
    projected_carbon = round(total_carbon + (daily_carbon_rate * days_remaining), 1)
    projected_water = round(total_water + (daily_water_rate * days_remaining), 1)
    projected_waste_diverted = round(total_waste_diverted * (days_in_month / days_elapsed), 1)

    # Overshoot days calculation
    carbon_overshoot_days = None
    if daily_carbon_rate > 0:
        days_to_limit = int((carbon_budget - total_carbon) / daily_carbon_rate)
        if 0 < days_to_limit < days_remaining:
            carbon_overshoot_days = days_to_limit

    # Top contributing categories
    sorted_categories = sorted(category_carbon.items(), key=lambda x: x[1], reverse=True)
    top_categories = [{"category": k, "carbon_kg": round(v, 1)} for k, v in sorted_categories]

    # Chart data points (Weeks 1 to 4)
    chart_points = [
        {"week": "Week 1", "actual_carbon": round(total_carbon * 0.3, 1), "budget_limit": round(carbon_budget * 0.25, 1), "projected": round(carbon_budget * 0.25, 1)},
        {"week": "Week 2", "actual_carbon": round(total_carbon * 0.7, 1), "budget_limit": round(carbon_budget * 0.50, 1), "projected": round(total_carbon * 0.7, 1)},
        {"week": "Week 3", "actual_carbon": round(total_carbon, 1), "budget_limit": round(carbon_budget * 0.75, 1), "projected": round(total_carbon + daily_carbon_rate * 7, 1)},
        {"week": "Week 4 (End)", "actual_carbon": None, "budget_limit": carbon_budget, "projected": projected_carbon}
    ]

    return {
        "days_elapsed": days_elapsed,
        "days_remaining": days_remaining,
        "carbon": {
            "current_kg": round(total_carbon, 1),
            "budget_kg": carbon_budget,
            "projected_month_end_kg": projected_carbon,
            "projected_overshoot_kg": max(0.0, round(projected_carbon - carbon_budget, 1)),
            "overshoot_in_days": carbon_overshoot_days
        },
        "water": {
            "current_l": round(total_water, 1),
            "budget_l": water_budget,
            "projected_month_end_l": projected_water
        },
        "waste": {
            "current_diverted_kg": round(total_waste_diverted, 1),
            "budget_kg": waste_budget,
            "projected_diverted_kg": projected_waste_diverted
        },
        "top_categories": top_categories,
        "chart_points": chart_points
    }
