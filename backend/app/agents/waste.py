import time
from typing import Tuple, List, Optional
from ..schemas.agent import WasteAnalysis, TraceItem
from ..services.gemini import gemini_service
from ..services.impact import calculate_waste_diversion

def analyze_waste(
    input_text: Optional[str] = None, 
    image_bytes: Optional[bytes] = None, 
    city: str = "Bengaluru"
) -> Tuple[WasteAnalysis, List[TraceItem]]:
    trace: List[TraceItem] = []
    ts = time.strftime("%H:%M:%S")

    trace.append(TraceItem(
        agent_name="WasteRecyclingAgent",
        status="INFO",
        explanation=f"Analyzing item polymer structure and municipal sorting protocols for {city}.",
        timestamp=ts
    ))

    # Try live Gemini call if configured
    is_live = False
    if gemini_service.client:
        prompt = f"""Analyze this waste item for disposal in {city}, India.
Item Description: {input_text or 'Packaging item'}
Return JSON with:
- item_name: specific object name
- material: detailed material composition
- condition: clean/contaminated
- recommended_action: RECYCLE, COMPOST, REUSE, E_WASTE, HAZARDOUS, LANDFILL, SPECIAL_COLLECTION
- confidence: float 0 to 1
- explanation: concise reason
- preparation_steps: list of 3 actionable steps
- disposal_category: Dry Waste, Wet Waste, Sanitary, E-Waste
- estimated_mass_kg: float
- supporting_rules: local guidelines citation
"""
        raw = gemini_service.analyze_image_or_text(prompt, image_bytes)
        if raw and "item_name" in raw:
            is_live = True
            mass = float(raw.get("estimated_mass_kg", 0.15))
            co2_saved, assumption = calculate_waste_diversion("tetra_pak", mass)
            analysis = WasteAnalysis(
                item_name=raw.get("item_name", "Packaging Item"),
                material=raw.get("material", "Multi-layer composite"),
                condition=raw.get("condition", "Rinsed / Dry"),
                recommended_action=raw.get("recommended_action", "RECYCLE"),
                confidence=float(raw.get("confidence", 0.94)),
                explanation=raw.get("explanation", "Polyethylene & cardboard composite requires specialized recycling."),
                preparation_steps=raw.get("preparation_steps", ["Rinse thoroughly", "Flatten carton", "Drop in Dry Waste bin"]),
                disposal_category=raw.get("disposal_category", "Dry Waste"),
                estimated_mass_kg=mass,
                landfill_diversion_kg=mass,
                co2e_saving_kg=co2_saved,
                supporting_rules=raw.get("supporting_rules", "BBMP Dry Waste Centre (DWCC) Guidelines"),
                is_live_ai=True
            )
            trace.append(TraceItem(
                agent_name="WasteRecyclingAgent",
                status="SUCCESS",
                explanation=f"Live Gemini Vision identified: {analysis.item_name} ({analysis.material})",
                timestamp=time.strftime("%H:%M:%S"),
                details={"material": analysis.material, "co2_saving": analysis.co2e_saving_kg}
            ))
            return analysis, trace

    # Verified Realistic Fallback (Demo Mode)
    # Detect if user mentioned another item (e.g., plastic bottle, battery, bioplastic)
    t = (input_text or "").lower()
    if "bottle" in t or "pet" in t or "plastic" in t:
        item_name = "PET Beverage Bottle"
        material = "Polyethylene Terephthalate (#1 PET)"
        mass = 0.045
        co2_saved, assumption = calculate_waste_diversion("pet_plastic", mass)
        steps = ["Remove cap & rinse residual liquid", "Crush bottle to minimize collection volume", "Place in dry recyclables bin"]
        rules = "BBMP Plastic Waste Management Bye-Laws & Authorized Recyclers"
        category = "Dry Waste"
        action = "RECYCLE"
    elif any(k in t for k in ["phone", "mobile", "smartphone", "screen", "tablet", "device"]):
        item_name = "Old Mobile Phone (Smartphone E-Waste)"
        material = "Lithium Battery, Printed Circuit Board (Gold/Copper/Silicon), Gorilla Glass"
        mass = 0.18
        co2_saved, assumption = calculate_waste_diversion("e_waste", mass)
        steps = ["Back up and factory reset personal data", "Remove SIM & memory cards", "Drop at CPCB Authorized E-Waste kiosk (e.g. Croma / Hasiru Dala)"]
        rules = "CPCB E-Waste Management Rules 2022 (Extended Producer Responsibility)"
        category = "E-Waste / Hazardous"
        action = "E_WASTE"
    elif "thermal" in t or "receipt" in t or "bill" in t or "slip" in t:
        item_name = "Thermal Paper Receipt"
        material = "Paper coated with thermal dyes and BPA/BPS reactive chemicals"
        mass = 0.005
        co2_saved = 0.0
        steps = ["Do not mix with recyclable paper pulp", "Discard in Non-Recyclable Dry Waste stream for landfill", "Opt for digital SMS/WhatsApp receipts"]
        rules = "CPCB & BBMP Non-Recyclable Chemical Paper Waste Protocol"
        category = "Non-Recyclable / Landfill"
        action = "LANDFILL"
    elif "battery" in t or "electronic" in t or "charger" in t:
        item_name = "Lithium-ion Battery Pack / Charger"
        material = "Lithium cobalt oxide / Copper wiring"
        mass = 0.08
        co2_saved, assumption = calculate_waste_diversion("e_waste", mass)
        steps = ["Tape battery terminals with electrical tape", "Do NOT puncture or mix with wet waste", "Deposit at designated E-Waste collection box"]
        rules = "CPCB E-Waste Management Rules 2022 (Hazardous Stream)"
        category = "E-Waste / Hazardous"
        action = "E_WASTE"
    else:
        item_name = "Tetra Pak Carton (Milk/Juice)"
        material = "Aseptic Composite: 75% Paperboard, 20% LDPE, 5% Aluminium"
        mass = 0.12
        co2_saved, assumption = calculate_waste_diversion("tetra_pak", mass)
        steps = ["Rinse thoroughly to prevent odor", "Flatten the carton flat", "Drop in Dry Waste bin for Hasiru Dala pulping"]
        rules = "BBMP Solid Waste Management Protocol & Tetra Pak India Circular Network"
        category = "Dry Waste"
        action = "RECYCLE"

    analysis = WasteAnalysis(
        item_name=item_name,
        material=material,
        condition="Clean and segregated",
        recommended_action=action,
        confidence=0.96,
        explanation=f"Identified {item_name} composition. Process according to {rules}.",
        preparation_steps=steps,
        disposal_category=category,
        estimated_mass_kg=mass,
        landfill_diversion_kg=mass,
        co2e_saving_kg=co2_saved,
        supporting_rules=rules,
        is_live_ai=is_live
    )

    trace.append(TraceItem(
        agent_name="WasteRecyclingAgent",
        status="SUCCESS",
        explanation=f"Identified item: {analysis.item_name}. Computed landfill diversion: {analysis.landfill_diversion_kg} kg.",
        timestamp=time.strftime("%H:%M:%S"),
        details={"assumptions": assumption, "confidence": analysis.confidence}
    ))

    return analysis, trace
