import pytest
from app.services.impact import (
    calculate_electricity_impact, 
    calculate_commute_impact, 
    calculate_waste_diversion,
    calculate_water_impact
)
from app.services.solar import calculate_solar_simulation
from app.services.context import get_city_context
from app.services.forecast import generate_forecast
from app.database.db import init_db
from app.database.repositories import (
    seed_default_demo_data, 
    calculate_dashboard_metrics,
    get_actions,
    update_action_step
)
from app.agents.waste import analyze_waste
from app.agents.food import analyze_food
from app.agents.router import route_input
from app.agents.verifier import verify_output

def test_database_initialization_and_seeding():
    init_db()
    seed_default_demo_data()
    # Call a second time to ensure idempotency (no duplicate records)
    seed_default_demo_data()
    metrics = calculate_dashboard_metrics()
    assert 0 <= metrics["planet_score"] <= 100
    assert metrics["monthly_carbon_used_kg"] >= 0

def test_impact_calculations():
    # Electricity: 100 kWh with BESCOM factor 0.76 -> 76 kg CO2e
    co2, assump = calculate_electricity_impact(100.0, "bescom_karnataka")
    assert co2 == 76.0
    assert "kWh" in assump

    # Commute: 10 km, 10 trips = 100 km. Petrol car 0.192 -> 19.2 kg CO2e
    co2_car, _ = calculate_commute_impact(10.0, "car_petrol", 10)
    assert co2_car == 19.2

    # Waste: 1 kg Tetra Pak -> ~0.95 kg CO2e avoided
    co2_waste, _ = calculate_waste_diversion("tetra_pak", 1.0)
    assert co2_waste == 0.95

    # Water: 1000 litres
    co2_water, _ = calculate_water_impact(1000.0)
    assert co2_water == 0.38

def test_solar_simulation():
    res = calculate_solar_simulation(4.5, "Bengaluru")
    assert res["roof_area_kw"] == 4.5
    assert res["annual_generation_kwh"] > 5000
    assert res["annual_co2e_avoided_tons"] > 2.0
    assert res["annual_savings_inr"] > 10000
    assert res["estimated_payback_years"] > 0

def test_router_agent():
    decision, trace = route_input(input_text="My BESCOM electricity bill for September is 240 kWh")
    assert decision.input_type == "electricity"
    assert decision.specialist == "EnergyAuditorAgent"
    assert len(trace) >= 2

def test_waste_agent_and_verifier():
    res, trace = analyze_waste(input_text="Tetra Pak milk carton packaging")
    assert res.recommended_action == "RECYCLE"
    assert len(res.preparation_steps) >= 3

    v_res, v_trace = verify_output("WasteRecyclingAgent", res.dict())
    assert v_res.is_valid is True
    assert v_res.confidence_adjusted >= 0.8

def test_food_agent():
    res, trace = analyze_food(input_text="Spinach and tofu expiring soon")
    assert len(res.recipes) >= 3
    assert res.waste_avoided_kg > 0
    assert res.carbon_impact_kg > 0

def test_context_fallback():
    ctx = get_city_context("Bengaluru")
    assert ctx["city"] == "Bengaluru"
    assert ctx["aqi"] > 0
    assert "temperature_c" in ctx

def test_forecast_engine():
    fc = generate_forecast()
    assert "carbon" in fc
    assert fc["carbon"]["budget_kg"] > 0
    assert len(fc["chart_points"]) == 4

def test_action_completion():
    actions = get_actions(limit=5)
    assert len(actions) > 0
    first_id = actions[0]["id"]
    # Toggle step
    success = update_action_step(first_id, 0, True)
    assert success is True
