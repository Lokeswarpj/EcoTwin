import json
import time
import uuid
from datetime import datetime, timezone
from typing import Tuple, List, Dict, Any
from ..schemas.agent import TraceItem
from ..schemas.api import ActionItemModel, WeeklyPlanResponse
from ..database.repositories import get_budget_config, get_all_events, save_action, get_connection
from ..services.context import get_city_context

def generate_weekly_plan(city: str = "Bengaluru") -> Tuple[WeeklyPlanResponse, List[TraceItem]]:
    trace: List[TraceItem] = []
    ts = time.strftime("%H:%M:%S")

    trace.append(TraceItem(
        agent_name="PlannerAgent",
        status="INFO",
        explanation=f"Synthesizing planetary budget status, weather forecast, and historical consumption for {city}.",
        timestamp=ts
    ))

    cfg = get_budget_config()
    ctx = get_city_context(city)

    # City-specific transit and grid profiles
    city_profiles = {
        "Delhi": {
            "mobility_title": "Commit to 3 Delhi Metro (DMRC) Commute Days",
            "mobility_desc": f"Weather is {ctx['condition']} (AQI {ctx['aqi']}). Swap private vehicle driving with DMRC Yellow/Blue Line transit to avoid smog emissions.",
            "mobility_steps": [
                {"text": "Recharge DMRC smartcard online (+10 bonus pts)", "done": False},
                {"text": "Board Metro at Rajiv Chowk / Kashmere Gate by 09:00", "done": False}
            ],
            "energy_desc": "Align heavy appliance cycles between 11:30 AM - 02:30 PM when Northern Grid & Delhi rooftop solar generation peaks."
        },
        "Mumbai": {
            "mobility_title": "Commit to 3 Mumbai Metro & Suburban Rail Days",
            "mobility_desc": f"Weather is {ctx['condition']} (AQI {ctx['aqi']}). Swap Western Express highway driving with Metro Line 2A/7 & Local transit.",
            "mobility_steps": [
                {"text": "Recharge Mumbai 1 Mobility Card (+10 bonus pts)", "done": False},
                {"text": "Board Metro at Andheri / Gundavali station by 09:00", "done": False}
            ],
            "energy_desc": "Align heavy consumption cycles between 11:30 AM - 02:30 PM to avoid peak commercial power tariffs."
        },
        "Hyderabad": {
            "mobility_title": "Commit to 3 Hyderabad Metro Rail Commute Days",
            "mobility_desc": f"Weather is {ctx['condition']} (AQI {ctx['aqi']}). Swap solo cab rides with Hyderabad Metro Red/Blue Line.",
            "mobility_steps": [
                {"text": "Recharge TS Metro smartcard online (+10 bonus pts)", "done": False},
                {"text": "Board Metro at Ameerpet / Hitec City station by 09:15", "done": False}
            ],
            "energy_desc": "Align heavy washing & cooling cycles between 11:30 AM - 02:30 PM to match TSSPDCL peak solar feed."
        },
        "Chennai": {
            "mobility_title": "Commit to 3 Chennai Metro (CMRL) Commute Days",
            "mobility_desc": f"Weather is {ctx['condition']} (AQI {ctx['aqi']}). Swap solo motor travel with CMRL Blue Line transit.",
            "mobility_steps": [
                {"text": "Recharge Singara Chennai NCMC Card (+10 bonus pts)", "done": False},
                {"text": "Board Metro at Central / Guindy station by 09:00", "done": False}
            ],
            "energy_desc": "Align high-draw appliance cycles between 11:30 AM - 02:30 PM during peak coastal solar hours."
        },
        "Kochi": {
            "mobility_title": "Commit to 3 Kochi Metro & Water Metro Commute Days",
            "mobility_desc": f"Weather is {ctx['condition']} (AQI {ctx['aqi']}). Take zero-emission Kochi Water Metro & Blue Line instead of congested road transit.",
            "mobility_steps": [
                {"text": "Recharge Kochi1 Card online (+10 bonus pts)", "done": False},
                {"text": "Board Metro at Aluva / Edapally station by 09:00", "done": False}
            ],
            "energy_desc": "Align heavy appliance cycles between 11:30 AM - 02:30 PM to maximize KSEB green solar intake."
        },
        "Bengaluru": {
            "mobility_title": "Commit to 3 Namma Metro Commute Days",
            "mobility_desc": f"Weather is {ctx['condition']} (AQI {ctx['aqi']}). Swap solo driving with Purple Line transit.",
            "mobility_steps": [
                {"text": "Recharge smartcard online (+10 bonus pts)", "done": False},
                {"text": "Board Metro at Indiranagar station by 09:15", "done": False}
            ],
            "energy_desc": "Align heavy appliance cycles between 11:30 AM - 02:30 PM when Karnataka grid renewable mix is highest."
        }
    }

    prof = city_profiles.get(city, city_profiles["Delhi"] if "delhi" in city.lower() else city_profiles["Bengaluru"])

    # Planned priority actions for the week
    plan_actions_data = [
        {
            "category": "Food Waste Guard",
            "title": "Execute Zero-Waste Batch Cook (Palak & Tofu)",
            "description": "Utilize near-expiry crisper drawer vegetables for 3 high-protein meals before Thursday.",
            "co2_saving_kg": 2.16,
            "points": 40,
            "color": "green",
            "agent_name": "FoodWasteGuardAgent",
            "steps": [
                {"text": "Blanch and puree spinach stems", "done": False},
                {"text": "Portion curry into 2 airtight glass containers", "done": False}
            ]
        },
        {
            "category": "Mobility Negotiator",
            "title": prof["mobility_title"],
            "description": prof["mobility_desc"],
            "co2_saving_kg": 4.35,
            "points": 50,
            "color": "amber",
            "agent_name": "MobilityNegotiatorAgent",
            "steps": prof["mobility_steps"]
        },
        {
            "category": "Peak Load Shift",
            "title": "Shift Laundry & Water Heating to Midday Solar Peak",
            "description": prof["energy_desc"],
            "co2_saving_kg": 3.80,
            "points": 35,
            "color": "blue",
            "agent_name": "EnergyAuditorAgent",
            "steps": [
                {"text": "Program washing machine delay timer for 12:00 PM", "done": False},
                {"text": "Lower geyser target temperature by 2°C", "done": False}
            ]
        }
    ]

    action_models: List[ActionItemModel] = []
    total_co2_savings = 0.0

    now_iso = datetime.now(timezone.utc).isoformat()
    for item in plan_actions_data:
        action_id = f"action-plan-{uuid.uuid4().hex[:6]}"
        item_dict = {
            "id": action_id,
            "category": item["category"],
            "title": item["title"],
            "description": item["description"],
            "co2_saving_kg": item["co2_saving_kg"],
            "points": item["points"],
            "color": item["color"],
            "agent_name": item["agent_name"],
            "status": "pending",
            "in_plan": True,
            "steps": item["steps"],
            "created_at": now_iso
        }
        save_action(item_dict)
        total_co2_savings += item["co2_saving_kg"]
        action_models.append(ActionItemModel(**item_dict))

    week_id = "week-1"
    plan_resp = WeeklyPlanResponse(
        week_id=week_id,
        title="Planetary Alignment Plan: Week 1",
        summary=f"3 coordinated micro-actions targeting food freshness, peak solar load, and clean transit. Designed to save ~{total_co2_savings:.1f}kg CO2e.",
        projected_co2e_reduction_kg=round(total_co2_savings, 2),
        actions=action_models,
        context_notes=f"Context: {ctx['city']} AQI {ctx['aqi']} ({ctx['aqi_category']}). {ctx['recommendation']}",
        trace=trace
    )

    # Persist weekly plan to DB
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO weekly_plans (week_id, title, summary, projected_co2e_reduction_kg, actions_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        week_id,
        plan_resp.title,
        plan_resp.summary,
        plan_resp.projected_co2e_reduction_kg,
        json.dumps([a.dict() for a in action_models]),
        now_iso
    ))
    conn.commit()
    conn.close()

    trace.append(TraceItem(
        agent_name="PlannerAgent",
        status="SUCCESS",
        explanation=f"Generated and persisted weekly plan '{plan_resp.title}'. Potential saving: {total_co2_savings:.1f} kg CO2e.",
        timestamp=time.strftime("%H:%M:%S"),
        details={"actions_count": len(action_models), "projected_saving": total_co2_savings}
    ))

    return plan_resp, trace
