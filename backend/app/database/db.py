import sqlite3
from ..config import DB_PATH

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Events table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        source TEXT NOT NULL,
        description TEXT NOT NULL,
        carbon_impact_kg REAL NOT NULL,
        waste_diverted_kg REAL NOT NULL,
        water_consumed_l REAL NOT NULL,
        confidence REAL NOT NULL,
        assumptions TEXT,
        is_demo INTEGER DEFAULT 0
    )
    """)

    # Actions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS actions (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        co2_saving_kg REAL NOT NULL,
        points INTEGER NOT NULL,
        color TEXT NOT NULL,
        agent_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        in_plan INTEGER DEFAULT 0,
        trade_off_json TEXT,
        steps_json TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # Budget config table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS budget_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        monthly_carbon_budget_kg REAL NOT NULL,
        monthly_waste_budget_kg REAL NOT NULL,
        monthly_water_budget_l REAL NOT NULL,
        points INTEGER NOT NULL DEFAULT 1350,
        streak_days INTEGER NOT NULL DEFAULT 5,
        updated_at TEXT NOT NULL
    )
    """)

    # Weekly plans table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS weekly_plans (
        week_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        projected_co2e_reduction_kg REAL NOT NULL,
        actions_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()
