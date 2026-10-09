from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TraceItem(BaseModel):
    agent_name: str
    status: str = "SUCCESS"  # SUCCESS, INFO, WARNING, ERROR
    explanation: str
    timestamp: str
    details: Optional[Dict[str, Any]] = None

class RouterDecision(BaseModel):
    input_type: str = Field(..., description="waste, food, electricity, mobility, product, circular")
    specialist: str = Field(..., description="Target specialist agent name")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    reasoning: str

class WasteAnalysis(BaseModel):
    item_name: str
    material: str
    condition: str = "Clean/Dry"
    recommended_action: str = Field(..., description="RECYCLE, COMPOST, REUSE, E_WASTE, HAZARDOUS, LANDFILL, SPECIAL_COLLECTION")
    confidence: float = Field(default=0.95, ge=0.0, le=1.0)
    explanation: str
    preparation_steps: List[str]
    disposal_category: str = "Dry Waste"
    estimated_mass_kg: float = 0.15
    landfill_diversion_kg: float = 0.15
    co2e_saving_kg: float = 0.22
    supporting_rules: str = "BBMP Dry Waste Segregation Guidelines / Hasiru Dala Protocol"
    clarification_needed: Optional[str] = None
    is_live_ai: bool = True

class FoodItemDetail(BaseModel):
    name: str
    quantity: str
    shelf_life_days: int
    urgency: str  # high, medium, low

class RecipeSuggestion(BaseModel):
    name: str
    cook_time: str
    ingredients_used: List[str]
    description: str

class FoodAnalysis(BaseModel):
    detected_items: List[FoodItemDetail]
    recipes: List[RecipeSuggestion]
    low_waste_shopping_list: List[str]
    storage_recommendations: List[str]
    waste_avoided_kg: float = 1.2
    carbon_impact_kg: float = 2.16
    suggested_action: str
    is_live_ai: bool = True

class EnergySavingsAction(BaseModel):
    title: str
    potential_kwh_saving: float
    carbon_saving_kg: float
    difficulty: str

class EnergyAnalysis(BaseModel):
    billing_period: str
    electricity_kwh: float
    water_litres: float = 0.0
    tariff_amount: float
    carbon_emissions_kg: float
    historical_benchmark_comparison: str
    saving_actions: List[EnergySavingsAction]
    next_bill_target_kwh: float
    is_live_ai: bool = True

class MobilityOption(BaseModel):
    mode: str
    time_minutes: int
    cost_inr: float
    co2e_kg: float
    recommended: bool = False

class MobilityAnalysis(BaseModel):
    distance_km: float
    current_mode: str
    trips_per_week: int
    current_emissions_kg: float
    options: List[MobilityOption]
    recommendation: str
    trade_off_explanation: str
    is_live_ai: bool = True

class ProductAnalysis(BaseModel):
    product_name: str
    packaging_material: str
    indicative_score: int = Field(default=75, ge=0, le=100)
    assessment_summary: str
    greener_alternatives: List[str]
    refill_repair_tips: List[str]
    greenwashing_alerts: Optional[str] = None
    is_live_ai: bool = True

class PartnerMatch(BaseModel):
    name: str
    category: str
    city: str
    accepted_materials: List[str]
    contact: str
    demo_label: str

class CircularAnalysis(BaseModel):
    item_name: str
    material: str
    suggested_action: str  # REPAIR, DONATE, SWAP, UPCYCLE
    matched_partners: List[PartnerMatch]
    suggested_outreach_message: str
    is_live_ai: bool = True

class NegotiatorResult(BaseModel):
    topic: str
    option_a: str
    option_a_metrics: Dict[str, Any]
    option_b: str
    option_b_metrics: Dict[str, Any]
    recommended_option: str
    compromise_explanation: str
    budget_impact: str

class VerifierResult(BaseModel):
    is_valid: bool = True
    confidence_adjusted: float
    flags: List[str] = []
    clarification_question: Optional[str] = None
