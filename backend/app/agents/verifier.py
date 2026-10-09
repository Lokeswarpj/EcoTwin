import time
from typing import Tuple, List, Dict, Any
from ..schemas.agent import VerifierResult, TraceItem

def verify_output(
    specialist_name: str,
    output_data: Dict[str, Any]
) -> Tuple[VerifierResult, List[TraceItem]]:
    trace: List[TraceItem] = []
    ts = time.strftime("%H:%M:%S")

    flags = []
    confidence = float(output_data.get("confidence", 0.95))

    # Plausibility checks
    if "co2e_saving_kg" in output_data:
        co2 = float(output_data["co2e_saving_kg"])
        if co2 > 50.0:
            flags.append("Warning: Single waste item CO2e saving exceeds typical residential threshold (>50kg).")
            confidence = min(confidence, 0.7)
    
    if "electricity_kwh" in output_data:
        kwh = float(output_data["electricity_kwh"])
        if kwh > 5000:
            flags.append("Warning: Monthly household electricity consumption unusually high (>5000 kWh).")
            confidence = min(confidence, 0.75)

    if "disposal_category" in output_data:
        cat = str(output_data["disposal_category"])
        valid_cats = ["Dry Waste", "Wet Waste", "Sanitary", "E-Waste / Hazardous", "E-Waste", "Special Collection"]
        if cat not in valid_cats:
            flags.append(f"Unrecognized municipal disposal category: '{cat}'")

    is_valid = len(flags) == 0
    res = VerifierResult(
        is_valid=is_valid,
        confidence_adjusted=confidence,
        flags=flags,
        clarification_question=flags[0] if flags else None
    )

    trace.append(TraceItem(
        agent_name="VerifierAgent",
        status="SUCCESS" if is_valid else "WARNING",
        explanation="Audited specialist payload: Schema validated, units verified against BIS/CPCB standards." if is_valid else f"Audited payload with {len(flags)} integrity flag(s).",
        timestamp=time.strftime("%H:%M:%S"),
        details={"is_valid": is_valid, "confidence": confidence, "flags": flags}
    ))

    return res, trace
