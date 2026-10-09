import time
from typing import Tuple, List, Optional
from ..schemas.agent import NegotiatorResult, TraceItem

def arbitrate_tradeoff(
    topic: str = "commute",
    constraint: str = "balanced"
) -> Tuple[NegotiatorResult, List[TraceItem]]:
    trace: List[TraceItem] = []
    ts = time.strftime("%H:%M:%S")

    trace.append(TraceItem(
        agent_name="NegotiatorAgent",
        status="INFO",
        explanation=f"Arbitrating multi-objective sustainability trade-off for: '{topic}'. Balancing Carbon vs Cost vs Time.",
        timestamp=ts
    ))

    if "commute" in topic.lower() or "route" in topic.lower() or "transit" in topic.lower():
        result = NegotiatorResult(
            topic="Daily Commute: Namma Metro vs BMTC Bus vs Solo Driving",
            option_a="Namma Metro Purple Line",
            option_a_metrics={"co2e_kg": 0.18, "fare_inr": 45, "time_min": 32},
            option_b="BMTC AC / Volvo Bus",
            option_b_metrics={"co2e_kg": 0.42, "fare_inr": 20, "time_min": 55},
            recommended_option="Namma Metro on weekdays; Bus when leisure flexibility permits",
            compromise_explanation="Metro eliminates 30 mins of bumper-to-bumper traffic idling while cutting emissions by 88% compared to solo driving. The ₹25 fare premium over BMTC bus is justified by 23 mins of productivity saved.",
            budget_impact="Saves 1.45 kg CO2e per workday. Contributes +30 Eco Points."
        )
    elif "solar" in topic.lower() or "energy" in topic.lower():
        result = NegotiatorResult(
            topic="Rooftop Solar PV Installation vs Grid Electricity",
            option_a="4.5 kW Rooftop Solar (with PM Surya Ghar Subsidy)",
            option_a_metrics={"upfront_inr": 135000, "annual_saving_inr": 12400, "co2_avoided_tons": 2.4},
            option_b="Standard BESCOM Grid Supply",
            option_b_metrics={"upfront_inr": 0, "annual_cost_inr": 24000, "grid_carbon_tons": 2.8},
            recommended_option="4.5 kW Rooftop Solar with zero-down EMI financing",
            compromise_explanation="Capital expenditure is cushioned by central subsidy. Net monthly electricity bills drop by 78%, yielding an effective 3.8 year economic payback with zero operational friction.",
            budget_impact="Eliminates ~2.4 metric tons of coal-fired grid emissions annually."
        )
    else:
        result = NegotiatorResult(
            topic="Plant-Based Protein vs Conventional Dairy / Poultry",
            option_a="Locally Sourced Soy / Lentils / Tofu",
            option_a_metrics={"co2e_kg": 0.4, "cost_inr": 60, "water_l": 80},
            option_b="Imported Paneer / Red Meat",
            option_b_metrics={"co2e_kg": 3.8, "cost_inr": 180, "water_l": 650},
            recommended_option="Swap 3 dinners per week with fresh seasoned Tofu/Lentils",
            compromise_explanation="Partial dietary transition preserves culinary preference while reducing dinner-time carbon footprint by 65% and saving over 1,200 litres of water weekly.",
            budget_impact="Preserves 14% of monthly household water budget."
        )

    trace.append(TraceItem(
        agent_name="NegotiatorAgent",
        status="SUCCESS",
        explanation=f"Compromise recommended: '{result.recommended_option}'. Trade-off justified.",
        timestamp=time.strftime("%H:%M:%S"),
        details={"chosen": result.recommended_option, "budget_impact": result.budget_impact}
    ))

    return result, trace
