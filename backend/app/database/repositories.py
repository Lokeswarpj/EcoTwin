import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from .db import get_connection

def seed_default_demo_data():
    conn = get_connection()
    cursor = conn.cursor()

    # Check if budget config exists
    cursor.execute("SELECT id FROM budget_config WHERE id = 1")
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO budget_config (id, monthly_carbon_budget_kg, monthly_waste_budget_kg, monthly_water_budget_l, points, streak_days, updated_at)
            VALUES (1, 350.0, 25.0, 4200.0, 1350, 6, ?)
        """, (datetime.now(timezone.utc).isoformat(),))

    # Check if events exist
    cursor.execute("SELECT COUNT(*) FROM events")
    count = cursor.fetchone()[0]
    if count == 0:
        # Seed realistic baseline synthetic events for the month
        demo_events = [
            ("evt-seed-1", "2026-10-01T08:30:00Z", "electricity", "BESCOM Smart Meter", "Base lighting & refrigerator load", 4.2, 0.0, 0.0, 1.0, "BESCOM grid baseline factor 0.76 kg CO2/kWh", 1),
            ("evt-seed-2", "2026-10-03T11:15:00Z", "waste", "Recycle Bin Audit", "Recycled cardboard packaging", 0.0, 0.5, 0.0, 0.95, "Diverted dry corrugated paper", 1),
            ("evt-seed-3", "2026-10-05T09:00:00Z", "mobility", "Namma Metro Log", "Commute Indiranagar to MG Road", 0.18, 0.0, 0.0, 0.98, "Electric metro rail factor 0.014 kg CO2/km", 1),
            ("evt-seed-4", "2026-10-07T07:45:00Z", "water", "BWSSB Household Meter", "Morning showers and culinary use", 0.05, 0.0, 120.0, 0.9, "Cauvery pumping factor 0.00038 kg CO2/L", 1),
            ("evt-seed-5", "2026-10-08T19:20:00Z", "waste", "Camera Item Scan", "Separated Tetra Pak milk carton", -0.12, 0.3, 0.0, 0.95, "Tetra Pak dry recovery", 1)
        ]
        cursor.executemany("""
            INSERT INTO events (id, timestamp, activity_type, source, description, carbon_impact_kg, waste_diverted_kg, water_consumed_l, confidence, assumptions, is_demo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, demo_events)

    # Check if starting actions exist
    cursor.execute("SELECT COUNT(*) FROM actions")
    if cursor.fetchone()[0] == 0:
        now_str = datetime.now(timezone.utc).isoformat()
        sample_actions = [
            (
                "action-seed-1",
                "Recycle & Reuse",
                "Detected: Tetra Pak (Milk)",
                "\"High density polyethylene coating requires specific facility separation.\"",
                0.12,
                15,
                "green",
                "Gemini Vision v1.5",
                "pending",
                1,
                None,
                json.dumps([
                    {"text": "Rinse thoroughly", "done": True},
                    {"text": "Flatten the carton", "done": True},
                    {"text": "Drop in Dry Waste bin", "done": False}
                ]),
                now_str
            ),
            (
                "action-seed-2",
                "Negotiator AI",
                "Route Optimization",
                "\"Metro vs Bus: A trade-off between time cost and absolute emissions.\"",
                1.45,
                30,
                "amber",
                "Gemini Flash-1.5",
                "pending",
                1,
                json.dumps({
                    "option_a": "Metro: Low CO2",
                    "fare_a": "₹45",
                    "option_b": "Bus: Med CO2",
                    "fare_b": "₹20",
                    "recommendation": "Metro saves 1.45kg CO2 with 22m quicker transit"
                }),
                json.dumps([
                    {"text": "Board Metro Purple Line at 09:15", "done": False},
                    {"text": "Log Smartcard ticket confirmation", "done": False}
                ]),
                now_str
            ),
            (
                "action-seed-3",
                "Resource Alert",
                "Shower Optimization",
                "\"Detected 12 min usage today. Planetary budget allows 8 mins for score parity.\"",
                0.35,
                22,
                "blue",
                "Gemini Resource Agent",
                "pending",
                1,
                None,
                json.dumps([
                    {"text": "Switch to aerated nozzle", "done": True},
                    {"text": "Reduce temp by 2°C", "done": False}
                ]),
                now_str
            )
        ]
        cursor.executemany("""
            INSERT INTO actions (id, category, title, description, co2_saving_kg, points, color, agent_name, status, in_plan, trade_off_json, steps_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_actions)

    conn.commit()
    conn.close()

def get_budget_config() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM budget_config WHERE id = 1")
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return {
        "monthly_carbon_budget_kg": 350.0,
        "monthly_waste_budget_kg": 25.0,
        "monthly_water_budget_l": 4200.0,
        "points": 1350,
        "streak_days": 6
    }

def get_all_events(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_event(event_data: Dict[str, Any]) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    event_id = event_data.get("id") or f"evt-{uuid.uuid4().hex[:8]}"
    cursor.execute("""
        INSERT INTO events (id, timestamp, activity_type, source, description, carbon_impact_kg, waste_diverted_kg, water_consumed_l, confidence, assumptions, is_demo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        event_id,
        event_data.get("timestamp") or datetime.now(timezone.utc).isoformat(),
        event_data.get("activity_type", "general"),
        event_data.get("source", "user"),
        event_data.get("description", ""),
        float(event_data.get("carbon_impact_kg", 0.0)),
        float(event_data.get("waste_diverted_kg", 0.0)),
        float(event_data.get("water_consumed_l", 0.0)),
        float(event_data.get("confidence", 0.9)),
        event_data.get("assumptions", ""),
        1 if event_data.get("is_demo", False) else 0
    ))
    conn.commit()
    conn.close()
    return event_id

def get_actions(limit: int = 20) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM actions ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        d = dict(r)
        d["steps"] = json.loads(d["steps_json"]) if d.get("steps_json") else []
        d["trade_off"] = json.loads(d["trade_off_json"]) if d.get("trade_off_json") else None
        results.append(d)
    return results

def save_action(action_data: Dict[str, Any]) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    action_id = action_data.get("id") or f"action-{uuid.uuid4().hex[:8]}"
    cursor.execute("""
        INSERT INTO actions (id, category, title, description, co2_saving_kg, points, color, agent_name, status, in_plan, trade_off_json, steps_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        action_id,
        action_data.get("category", "General"),
        action_data.get("title", ""),
        action_data.get("description", ""),
        float(action_data.get("co2_saving_kg", 0.0)),
        int(action_data.get("points", 15)),
        action_data.get("color", "green"),
        action_data.get("agent_name", "Gemini Agent"),
        action_data.get("status", "pending"),
        1 if action_data.get("in_plan", False) else 0,
        json.dumps(action_data.get("trade_off")) if action_data.get("trade_off") else None,
        json.dumps(action_data.get("steps", [])),
        action_data.get("created_at") or datetime.now(timezone.utc).isoformat()
    ))
    conn.commit()
    conn.close()
    return action_id

def update_action_step(action_id: str, step_index: int, done: bool) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT steps_json, points FROM actions WHERE id = ?", (action_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
    
    steps = json.loads(row[0]) if row[0] else []
    if 0 <= step_index < len(steps):
        steps[step_index]["done"] = done
        cursor.execute("UPDATE actions SET steps_json = ? WHERE id = ?", (json.dumps(steps), action_id))
        
        # Check if all steps done
        all_done = all(s.get("done") for s in steps)
        if all_done:
            cursor.execute("UPDATE actions SET status = 'completed' WHERE id = ?", (action_id,))
            cursor.execute("UPDATE budget_config SET points = points + ? WHERE id = 1", (row[1],))
        
        conn.commit()
        conn.close()
        return True
    
    conn.close()
    return False

def calculate_dashboard_metrics() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    cfg = get_budget_config()
    
    # Sum current month events
    cursor.execute("""
        SELECT 
            COALESCE(SUM(CASE WHEN carbon_impact_kg > 0 THEN carbon_impact_kg ELSE 0 END), 0.0) as carbon_used,
            COALESCE(SUM(waste_diverted_kg), 0.0) as waste_diverted,
            COALESCE(SUM(water_consumed_l), 0.0) as water_used
        FROM events
    """)
    totals = cursor.fetchone()
    carbon_used = float(totals[0])
    waste_diverted = float(totals[1])
    water_used = float(totals[2])

    carbon_budget = float(cfg["monthly_carbon_budget_kg"])
    waste_budget = float(cfg["monthly_waste_budget_kg"])
    water_budget = float(cfg["monthly_water_budget_l"])

    # Formula:
    # Carbon score: 45% weight (1 - used/budget)
    # Water score: 35% weight (1 - used/budget)
    # Waste diversion score: 20% weight (diverted / (budget * 0.5))
    carbon_ratio = max(0.0, 1.0 - (carbon_used / max(1.0, carbon_budget)))
    water_ratio = max(0.0, 1.0 - (water_used / max(1.0, water_budget)))
    waste_ratio = min(1.0, waste_diverted / max(0.1, waste_budget * 0.5))

    calculated_score = (carbon_ratio * 45.0) + (water_ratio * 35.0) + (waste_ratio * 20.0)
    planet_score = min(100.0, max(0.0, round(calculated_score, 1)))

    # Forecast overshoot estimation
    # Assume 30 day month, average day index 9
    day_of_month = datetime.now(timezone.utc).day
    days_left = max(1, 30 - day_of_month)
    daily_carbon_rate = carbon_used / max(1, day_of_month)
    
    overshoot_days = None
    if daily_carbon_rate > 0:
        remaining_budget = max(0.0, carbon_budget - carbon_used)
        projected_days_until_exhaustion = int(remaining_budget / daily_carbon_rate)
        if projected_days_until_exhaustion < days_left:
            overshoot_days = max(1, projected_days_until_exhaustion)
            alert_text = f"At current rates, carbon budget will overshoot in {overshoot_days} days."
        else:
            alert_text = f"Planetary budget optimal. +{days_left - projected_days_until_exhaustion} day buffer maintained."
    else:
        alert_text = "Budget consumption within healthy threshold."

    conn.close()
    return {
        "planet_score": planet_score,
        "monthly_carbon_used_kg": round(carbon_used, 1),
        "monthly_carbon_budget_kg": carbon_budget,
        "monthly_waste_diverted_kg": round(waste_diverted, 1),
        "monthly_waste_budget_kg": waste_budget,
        "monthly_water_consumed_l": round(water_used, 1),
        "monthly_water_budget_l": water_budget,
        "points": cfg.get("points", 1350),
        "streak_days": cfg.get("streak_days", 6),
        "days_left_in_month": days_left,
        "budget_forecast_alert": alert_text,
        "forecast_overshoot_days": overshoot_days
    }
