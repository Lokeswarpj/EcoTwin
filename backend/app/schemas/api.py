from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from .agent import TraceItem

class HealthResponse(BaseModel):
    status: str
    gemini_configured: bool
    version: str
    database: str

class ActionItemModel(BaseModel):
    id: str
    category: str
    title: str
    description: str
    co2_saving_kg: float
    points: int
    color: str
    agent_name: str
    status: str
    in_plan: bool
    trade_off: Optional[Dict[str, Any]] = None
    steps: List[Dict[str, Any]] = []
    created_at: str

class EventModel(BaseModel):
    id: str
    timestamp: str
    activity_type: str
    source: str
    description: str
    carbon_impact_kg: float
    waste_diverted_kg: float
    water_consumed_l: float
    confidence: float
    assumptions: str
    is_demo: bool = False

class DashboardMetrics(BaseModel):
    planet_score: float
    monthly_carbon_used_kg: float
    monthly_carbon_budget_kg: float
    monthly_waste_diverted_kg: float
    monthly_waste_budget_kg: float
    monthly_water_consumed_l: float
    monthly_water_budget_l: float
    points: int
    streak_days: int
    days_left_in_month: int
    budget_forecast_alert: str
    forecast_overshoot_days: Optional[int]

class DashboardResponse(BaseModel):
    metrics: DashboardMetrics
    recent_actions: List[ActionItemModel]
    recent_events: List[EventModel]
    city_context: Dict[str, Any]
    trace: List[TraceItem] = []

class AnalyzeRequest(BaseModel):
    input_text: Optional[str] = None
    city: str = "Bengaluru"
    language: str = "en"

class AnalyzeResponse(BaseModel):
    input_type: str
    specialist: str
    data: Dict[str, Any]
    action_card: ActionItemModel
    event_logged: Optional[EventModel] = None
    trace: List[TraceItem]
    is_live_ai: bool

class SolarSimulateRequest(BaseModel):
    roof_area_kw: float
    city: str = "Bengaluru"

class SolarSimulateResponse(BaseModel):
    roof_area_kw: float
    annual_generation_kwh: float
    annual_co2e_avoided_tons: float
    annual_savings_inr: float
    estimated_payback_years: float
    trees_equivalent: int
    methodology_note: str

class WeeklyPlanResponse(BaseModel):
    week_id: str
    title: str
    summary: str
    projected_co2e_reduction_kg: float
    actions: List[ActionItemModel]
    context_notes: str
    trace: List[TraceItem] = []

class ActionToggleResponse(BaseModel):
    success: bool
    action_id: str
    new_status: str
    points_awarded: int
    updated_planet_score: float

class ContextResponse(BaseModel):
    city: str
    temperature_c: float
    condition: str
    aqi: int
    aqi_category: str
    dominant_pollutant: str
    recommendation: str
    source: str
    is_live: bool
    last_updated: str
