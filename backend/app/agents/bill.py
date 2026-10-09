import time
import json
from typing import Tuple, List, Optional, Dict, Any
from ..schemas.agent import TraceItem
from ..services.gemini import gemini_service
from ..services.impact import calculate_electricity_impact

def analyze_bill_or_receipt(
    input_text: Optional[str] = None, 
    image_bytes: Optional[bytes] = None, 
    city: str = "Bengaluru"
) -> Tuple[Dict[str, Any], List[TraceItem]]:
    trace: List[TraceItem] = []
    ts = time.strftime("%H:%M:%S")

    trace.append(TraceItem(
        agent_name="BillReceiptAuditorAgent",
        status="INFO",
        explanation=f"Scanning document structure, utility tariffs, and itemized carbon intensities for {city}.",
        timestamp=ts
    ))

    # Try live Gemini call if configured
    is_live = False
    if gemini_service.client:
        prompt = f"""You are EcoTwin's Household Utility & Receipt OCR Auditor for {city}, India.
Analyze this receipt, grocery bill, or utility electricity bill (e.g., BESCOM, Tata Power, Zepto, Blinkit, Supermarket).
Return JSON adhering strictly to this schema:
{{
  "vendor": "Vendor Name (e.g. BESCOM / Blinkit / Nature's Basket)",
  "bill_type": "electricity" or "grocery" or "fuel" or "general",
  "total_amount_inr": float,
  "units_consumed": float (e.g. kWh for electricity, or total items count),
  "carbon_footprint_kg": float (estimated total lifecycle carbon),
  "high_emission_items": [
    {{"name": "Item/Tier name", "reason": "High refrigeration / peak tariff / single-use plastic", "carbon_kg": float, "green_alternative": "Greener alternative suggestion"}}
  ],
  "instant_savings_inr": float (monthly saving potential with eco swaps),
  "co2_savings_potential_kg": float,
  "action_recommendation": "Concise summary recommendation",
  "action_steps": ["Step 1", "Step 2", "Step 3"]
}}
"""
        raw = gemini_service.analyze_image_or_text(prompt, image_bytes)
        if raw and "vendor" in raw:
            is_live = True
            trace.append(TraceItem(
                agent_name="BillReceiptAuditorAgent",
                status="SUCCESS",
                explanation=f"Gemini OCR successfully extracted {raw.get('vendor')} bill with total footprint {raw.get('carbon_footprint_kg', 0)} kg CO2e.",
                timestamp=time.strftime("%H:%M:%S"),
                details={"vendor": raw.get("vendor"), "type": raw.get("bill_type")}
            ))
            raw["is_live_ai"] = True
            return raw, trace

    # Realistic Fallback for Demo
    t = (input_text or "").lower()
    if "bescom" in t or "electric" in t or "power" in t or "kwh" in t:
        data = {
            "vendor": "BESCOM (Bangalore Electricity Supply Company)",
            "bill_type": "electricity",
            "total_amount_inr": 2850.0,
            "units_consumed": 340.0,
            "carbon_footprint_kg": 278.8,
            "high_emission_items": [
                {
                    "name": "Peak Slab Consumption (>200 kWh)",
                    "reason": "Thermal coal grid peak tier emission factor (0.82 kg CO2/kWh)",
                    "carbon_kg": 114.8,
                    "green_alternative": "Shift heavy loads (washing machine, water heater) to off-peak daytime solar hours"
                },
                {
                    "name": "Continuous Geyser Standby Power",
                    "reason": "Unregulated water heating element standby losses (~1.5 kWh/day)",
                    "carbon_kg": 36.9,
                    "green_alternative": "Install a smart timer plug or rooftop solar thermal collector"
                }
            ],
            "instant_savings_inr": 1850.0,
            "co2_savings_potential_kg": 180.0,
            "action_recommendation": "Install 2kW Rooftop Solar and smart timer plug to wipe out 65% of grid tariff.",
            "action_steps": [
                "Apply for PM Surya Ghar Rooftop Solar subsidy (save up to ₹78,000)",
                "Set AC thermostat to 24°C instead of 18°C (saves 18% energy)",
                "Shift laundry cycles to 11 AM - 3 PM solar window"
            ],
            "is_live_ai": False
        }
    else:
        # Grocery / Quick commerce receipt
        data = {
            "vendor": "Quick-Commerce Grocery Order",
            "bill_type": "grocery",
            "total_amount_inr": 1420.0,
            "units_consumed": 8.0,
            "carbon_footprint_kg": 18.4,
            "high_emission_items": [
                {
                    "name": "Air-freighted Exotic Berries (Plastic Clamshell)",
                    "reason": "High aviation transport emission + multi-layer virgin PET packaging",
                    "carbon_kg": 6.8,
                    "green_alternative": "Choose seasonal regional fruits (Papaya/Guava/Pomegranate from Karnataka farms)"
                },
                {
                    "name": "Individually wrapped single-serve snack sachets",
                    "reason": "Non-recyclable multi-layer laminate (MLP) destined for landfill",
                    "carbon_kg": 3.2,
                    "green_alternative": "Buy bulk refill pack in recyclable cardboard cartons"
                }
            ],
            "instant_savings_inr": 340.0,
            "co2_savings_potential_kg": 10.0,
            "action_recommendation": "Switching 2 packaged imported items with local farm alternatives reduces order footprint by 54%.",
            "action_steps": [
                "Opt out of plastic cutlery and extra polybags on delivery apps",
                "Buy regional seasonal staples from local Mandi/kiosks",
                "Rinse and batch clean dry packaging for BBMP dry waste pickup"
            ],
            "is_live_ai": False
        }

    trace.append(TraceItem(
        agent_name="BillReceiptAuditorAgent",
        status="SUCCESS",
        explanation=f"Itemized carbon breakdown generated for {data['vendor']}.",
        timestamp=time.strftime("%H:%M:%S")
    ))
    return data, trace
