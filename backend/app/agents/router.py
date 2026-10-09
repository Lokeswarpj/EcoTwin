import time
from typing import Tuple, List, Optional
from ..schemas.agent import RouterDecision, TraceItem
from ..services.gemini import gemini_service

def route_input(input_text: Optional[str] = None, filename: Optional[str] = None) -> Tuple[RouterDecision, List[TraceItem]]:
    trace: List[TraceItem] = []
    ts = time.strftime("%H:%M:%S")

    trace.append(TraceItem(
        agent_name="RouterAgent",
        status="INFO",
        explanation="Received incoming multimodal input payload.",
        timestamp=ts,
        details={"filename": filename, "preview": input_text[:60] if input_text else "Media upload"}
    ))

    text_lower = (input_text or "").lower()
    fname_lower = (filename or "").lower()

    # Heuristic & fast pattern detection
    if any(k in text_lower or k in fname_lower for k in ["bill", "bescom", "kwh", "electricity", "meter", "power"]):
        decision = RouterDecision(
            input_type="electricity",
            specialist="EnergyAuditorAgent",
            confidence=0.96,
            reasoning="Detected utility electricity billing terminology and kWh consumption indicators."
        )
    elif any(k in text_lower or k in fname_lower for k in ["fridge", "recipe", "spinach", "tofu", "milk", "vegetable", "grocery", "food", "expiry"]):
        decision = RouterDecision(
            input_type="food",
            specialist="FoodWasteGuardAgent",
            confidence=0.94,
            reasoning="Identified perishables/grocery receipt inventory for shelf-life & recipe planning."
        )
    elif any(k in text_lower or k in fname_lower for k in ["commute", "travel", "km", "metro", "bus", "car", "drive", "traffic", "route"]):
        decision = RouterDecision(
            input_type="mobility",
            specialist="MobilityNegotiatorAgent",
            confidence=0.95,
            reasoning="Transit commute query mapped to multimodal carbon route optimizer."
        )
    elif any(k in text_lower or k in fname_lower for k in ["product", "shampoo", "bottle", "packaging", "detergent", "brand"]):
        decision = RouterDecision(
            input_type="product",
            specialist="ProductSustainabilityAgent",
            confidence=0.91,
            reasoning="Retail product packaging assessed for greenwashing & circularity."
        )
    elif any(k in text_lower or k in fname_lower for k in ["donate", "repair", "furniture", "clothes", "swap", "old electronic", "circular"]):
        decision = RouterDecision(
            input_type="circular",
            specialist="CircularExchangeAgent",
            confidence=0.92,
            reasoning="Reusable durable good routed to Bengaluru local circular partner network."
        )
    else:
        # Default to waste / packaging analysis
        decision = RouterDecision(
            input_type="waste",
            specialist="WasteRecyclingAgent",
            confidence=0.95,
            reasoning="Physical object packaging routed to waste classifier & segregation pipeline."
        )

    trace.append(TraceItem(
        agent_name="RouterAgent",
        status="SUCCESS",
        explanation=f"Routed input to specialist: {decision.specialist} ({decision.confidence*100:.0f}% confidence)",
        timestamp=time.strftime("%H:%M:%S"),
        details={"specialist": decision.specialist, "reasoning": decision.reasoning}
    ))

    return decision, trace
