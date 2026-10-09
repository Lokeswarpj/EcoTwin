import time
from typing import Tuple, List, Optional
from ..schemas.agent import MobilityAnalysis, MobilityOption, TraceItem
from ..services.impact import calculate_commute_impact

def analyze_mobility(
    input_text: Optional[str] = None
) -> Tuple[MobilityAnalysis, List[TraceItem]]:
    trace: List[TraceItem] = []
    ts = time.strftime("%H:%M:%S")

    trace.append(TraceItem(
        agent_name="MobilityNegotiatorAgent",
        status="INFO",
        explanation="Parsing commute route, distance, and transit alternatives against Bengaluru traffic factors.",
        timestamp=ts
    ))

    # Parse distance or use default 12 km
    dist = 12.0
    trips = 10  # 5 days x 2 ways
    if input_text:
        import re
        nums = re.findall(r"\b(\d+(?:\.\d+)?)\s*(?:km|kms|kilo)?\b", input_text.lower())
        if nums:
            try:
                dist = float(nums[0])
            except:
                pass

    car_co2, car_assump = calculate_commute_impact(dist, "car_petrol", trips)
    metro_co2, _ = calculate_commute_impact(dist, "metro_namma", trips)
    bus_co2, _ = calculate_commute_impact(dist, "bus_bmtc", trips)
    ev_co2, _ = calculate_commute_impact(dist, "two_wheeler_ev", trips)

    options = [
        MobilityOption(
            mode="Namma Metro (Purple / Green Line)",
            time_minutes=32,
            cost_inr=45.0,
            co2e_kg=metro_co2,
            recommended=True
        ),
        MobilityOption(
            mode="BMTC Electric / Volvo City Bus",
            time_minutes=55,
            cost_inr=25.0,
            co2e_kg=bus_co2,
            recommended=False
        ),
        MobilityOption(
            mode="Electric 2-Wheeler (EV)",
            time_minutes=38,
            cost_inr=15.0,
            co2e_kg=ev_co2,
            recommended=False
        ),
        MobilityOption(
            mode="Solo Petrol Car (Current Baseline)",
            time_minutes=62,
            cost_inr=180.0,
            co2e_kg=car_co2,
            recommended=False
        )
    ]

    analysis = MobilityAnalysis(
        distance_km=dist,
        current_mode="Solo Petrol Car",
        trips_per_week=trips,
        current_emissions_kg=car_co2,
        options=options,
        recommendation=f"Switching from Car to Metro saves {car_co2 - metro_co2:.1f} kg CO2e weekly and eliminates 30m of road congestion.",
        trade_off_explanation="Metro offers the optimal balance of carbon reduction (-92% vs car) and speed (32 min vs 62 min in Bengaluru peak traffic).",
        is_live_ai=False
    )

    trace.append(TraceItem(
        agent_name="MobilityNegotiatorAgent",
        status="SUCCESS",
        explanation=f"Calculated multimodal commute matrix for {dist} km trip. Potential saving: {car_co2 - metro_co2:.1f} kg CO2e/wk.",
        timestamp=time.strftime("%H:%M:%S"),
        details={"weekly_saving_kg": round(car_co2 - metro_co2, 2)}
    ))

    return analysis, trace
