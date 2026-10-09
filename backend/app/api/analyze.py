import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, UploadFile, File, Form
from ..schemas.api import AnalyzeResponse, ActionItemModel, EventModel
from ..schemas.agent import TraceItem
from ..agents.router import route_input
from ..agents.waste import analyze_waste
from ..agents.food import analyze_food
from ..agents.energy import analyze_energy
from ..agents.mobility import analyze_mobility
from ..agents.product import analyze_product
from ..agents.circular import analyze_circular
from ..agents.bill import analyze_bill_or_receipt
from ..agents.verifier import verify_output
from ..database.repositories import add_event, save_action

router = APIRouter()

@router.post("/waste", response_model=AnalyzeResponse)
async def analyze_waste_endpoint(
    file: Optional[UploadFile] = File(None),
    input_text: Optional[str] = Form(None),
    city: str = Form("Bengaluru")
):
    all_trace: List[TraceItem] = []
    fname = file.filename if file else None
    image_bytes = await file.read() if file else None

    # 1. Router
    decision, r_trace = route_input(input_text=input_text, filename=fname)
    all_trace.extend(r_trace)

    # 2. Specialist: Waste
    waste_res, w_trace = analyze_waste(input_text=input_text, image_bytes=image_bytes, city=city)
    all_trace.extend(w_trace)

    # 3. Verifier
    v_res, v_trace = verify_output("WasteRecyclingAgent", waste_res.dict())
    all_trace.extend(v_trace)

    # 4. Action Card & Persistence
    action_id = f"action-{uuid.uuid4().hex[:6]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    steps = [{"text": s, "done": False} for s in waste_res.preparation_steps]

    action_dict = {
        "id": action_id,
        "category": f"Recycle & Reuse ({waste_res.disposal_category})",
        "title": f"Detected: {waste_res.item_name}",
        "description": f"\"{waste_res.explanation}\"",
        "co2_saving_kg": waste_res.co2e_saving_kg,
        "points": 25,
        "color": "green",
        "agent_name": "Gemini Vision v1.5" if waste_res.is_live_ai else "WasteRecyclingAgent",
        "status": "pending",
        "in_plan": False,
        "steps": steps,
        "created_at": now_iso
    }
    save_action(action_dict)

    # 5. Persist Event
    event_id = f"evt-{uuid.uuid4().hex[:6]}"
    event_dict = {
        "id": event_id,
        "timestamp": now_iso,
        "activity_type": "waste",
        "source": "Camera Item Scan" if file else "Manual Input",
        "description": f"Audited {waste_res.item_name} ({waste_res.material})",
        "carbon_impact_kg": -waste_res.co2e_saving_kg,
        "waste_diverted_kg": waste_res.landfill_diversion_kg,
        "water_consumed_l": 0.0,
        "confidence": v_res.confidence_adjusted,
        "assumptions": waste_res.supporting_rules,
        "is_demo": not waste_res.is_live_ai
    }
    add_event(event_dict)

    all_trace.append(TraceItem(
        agent_name="ImpactEngine",
        status="SUCCESS",
        explanation=f"Persisted event: +{waste_res.landfill_diversion_kg}kg diverted, -{waste_res.co2e_saving_kg}kg CO2e.",
        timestamp=datetime.now(timezone.utc).strftime("%H:%M:%S")
    ))

    return AnalyzeResponse(
        input_type="waste",
        specialist="WasteRecyclingAgent",
        data=waste_res.dict(),
        action_card=ActionItemModel(**action_dict),
        event_logged=EventModel(**event_dict),
        trace=all_trace,
        is_live_ai=waste_res.is_live_ai
    )

@router.post("/food", response_model=AnalyzeResponse)
async def analyze_food_endpoint(
    file: Optional[UploadFile] = File(None),
    input_text: Optional[str] = Form(None)
):
    all_trace: List[TraceItem] = []
    fname = file.filename if file else None
    image_bytes = await file.read() if file else None

    decision, r_trace = route_input(input_text=input_text, filename=fname)
    all_trace.extend(r_trace)

    food_res, f_trace = analyze_food(input_text=input_text, image_bytes=image_bytes)
    all_trace.extend(f_trace)

    v_res, v_trace = verify_output("FoodWasteGuardAgent", food_res.dict())
    all_trace.extend(v_trace)

    action_id = f"action-{uuid.uuid4().hex[:6]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    steps = [
        {"text": f"Cook {food_res.recipes[0].name} ({food_res.recipes[0].cook_time})", "done": False},
        {"text": food_res.storage_recommendations[0], "done": False}
    ]

    action_dict = {
        "id": action_id,
        "category": "Food Waste Guard",
        "title": f"Fridge Audit: {len(food_res.detected_items)} Perishables Tracked",
        "description": f"\"{food_res.suggested_action}\"",
        "co2_saving_kg": food_res.carbon_impact_kg,
        "points": 35,
        "color": "green",
        "agent_name": "FoodWasteGuardAgent",
        "status": "pending",
        "in_plan": False,
        "steps": steps,
        "created_at": now_iso
    }
    save_action(action_dict)

    event_id = f"evt-{uuid.uuid4().hex[:6]}"
    event_dict = {
        "id": event_id,
        "timestamp": now_iso,
        "activity_type": "food",
        "source": "Fridge / Receipt Scan",
        "description": f"Recipe optimization saved {food_res.waste_avoided_kg}kg food waste",
        "carbon_impact_kg": -food_res.carbon_impact_kg,
        "waste_diverted_kg": food_res.waste_avoided_kg,
        "water_consumed_l": 0.0,
        "confidence": v_res.confidence_adjusted,
        "assumptions": "Avoided anaerobic landfill methane emission factor 1.5 kg CO2e/kg",
        "is_demo": not food_res.is_live_ai
    }
    add_event(event_dict)

    return AnalyzeResponse(
        input_type="food",
        specialist="FoodWasteGuardAgent",
        data=food_res.dict(),
        action_card=ActionItemModel(**action_dict),
        event_logged=EventModel(**event_dict),
        trace=all_trace,
        is_live_ai=food_res.is_live_ai
    )

@router.post("/energy", response_model=AnalyzeResponse)
async def analyze_energy_endpoint(
    file: Optional[UploadFile] = File(None),
    input_text: Optional[str] = Form(None)
):
    all_trace: List[TraceItem] = []
    fname = file.filename if file else None
    image_bytes = await file.read() if file else None

    decision, r_trace = route_input(input_text=input_text, filename=fname)
    all_trace.extend(r_trace)

    energy_res, e_trace = analyze_energy(input_text=input_text, image_bytes=image_bytes)
    all_trace.extend(e_trace)

    v_res, v_trace = verify_output("EnergyAuditorAgent", energy_res.dict())
    all_trace.extend(v_trace)

    action_id = f"action-{uuid.uuid4().hex[:6]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    steps = [{"text": a.title, "done": False} for a in energy_res.saving_actions[:2]]

    action_dict = {
        "id": action_id,
        "category": "Peak Load Shift",
        "title": f"Analyzed: BESCOM Bill ({energy_res.electricity_kwh:.0f} kWh)",
        "description": f"\"{energy_res.historical_benchmark_comparison}\"",
        "co2_saving_kg": 3.8,
        "points": 40,
        "color": "blue",
        "agent_name": "EnergyAuditorAgent",
        "status": "pending",
        "in_plan": False,
        "steps": steps,
        "created_at": now_iso
    }
    save_action(action_dict)

    event_id = f"evt-{uuid.uuid4().hex[:6]}"
    event_dict = {
        "id": event_id,
        "timestamp": now_iso,
        "activity_type": "electricity",
        "source": "Electricity Bill Statement",
        "description": f"Monthly electricity consumption ({energy_res.electricity_kwh:.0f} kWh)",
        "carbon_impact_kg": energy_res.carbon_emissions_kg,
        "waste_diverted_kg": 0.0,
        "water_consumed_l": energy_res.water_litres,
        "confidence": v_res.confidence_adjusted,
        "assumptions": "BESCOM grid tariff ₹7.5/kWh; grid emission factor 0.76 kg CO2e/kWh",
        "is_demo": not energy_res.is_live_ai
    }
    add_event(event_dict)

    return AnalyzeResponse(
        input_type="electricity",
        specialist="EnergyAuditorAgent",
        data=energy_res.dict(),
        action_card=ActionItemModel(**action_dict),
        event_logged=EventModel(**event_dict),
        trace=all_trace,
        is_live_ai=energy_res.is_live_ai
    )

@router.post("/mobility", response_model=AnalyzeResponse)
async def analyze_mobility_endpoint(
    input_text: Optional[str] = Form(None)
):
    all_trace: List[TraceItem] = []
    decision, r_trace = route_input(input_text=input_text)
    all_trace.extend(r_trace)

    mob_res, m_trace = analyze_mobility(input_text=input_text)
    all_trace.extend(m_trace)

    action_id = f"action-{uuid.uuid4().hex[:6]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    steps = [
        {"text": f"Take {mob_res.options[0].mode} for morning commute", "done": False},
        {"text": "Log Smartcard / UPI ticket confirmation", "done": False}
    ]

    action_dict = {
        "id": action_id,
        "category": "Negotiator AI",
        "title": f"Route Optimization ({mob_res.distance_km:.0f} km)",
        "description": f"\"{mob_res.trade_off_explanation}\"",
        "co2_saving_kg": 1.45,
        "points": 30,
        "color": "amber",
        "agent_name": "MobilityNegotiatorAgent",
        "status": "pending",
        "in_plan": False,
        "trade_off": {
            "option_a": mob_res.options[0].mode,
            "fare_a": f"₹{int(mob_res.options[0].cost_inr)}",
            "option_b": mob_res.options[1].mode,
            "fare_b": f"₹{int(mob_res.options[1].cost_inr)}",
            "recommendation": mob_res.recommendation
        },
        "steps": steps,
        "created_at": now_iso
    }
    save_action(action_dict)

    return AnalyzeResponse(
        input_type="mobility",
        specialist="MobilityNegotiatorAgent",
        data=mob_res.dict(),
        action_card=ActionItemModel(**action_dict),
        event_logged=None,
        trace=all_trace,
        is_live_ai=mob_res.is_live_ai
    )

@router.post("/bill", response_model=AnalyzeResponse)
async def analyze_bill_endpoint(
    file: Optional[UploadFile] = File(None),
    input_text: Optional[str] = Form(None),
    city: str = Form("Bengaluru")
):
    all_trace: List[TraceItem] = []
    fname = file.filename if file else None
    image_bytes = await file.read() if file else None

    # 1. Specialist: Bill/Receipt
    bill_data, b_trace = analyze_bill_or_receipt(input_text=input_text, image_bytes=image_bytes, city=city)
    all_trace.extend(b_trace)

    # 2. Verifier
    v_res, v_trace = verify_output("BillReceiptAuditorAgent", bill_data)
    all_trace.extend(v_trace)

    action_id = f"action-{uuid.uuid4().hex[:6]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    steps = [{"text": s, "done": False} for s in bill_data.get("action_steps", ["Audit line items", "Implement greener alternative"])]

    action_dict = {
        "id": action_id,
        "category": f"Bill Audit ({bill_data.get('vendor', 'Utility')})",
        "title": f"Audit: {bill_data.get('vendor', 'Bill')} (₹{bill_data.get('total_amount_inr', 0):.0f})",
        "description": f"\"{bill_data.get('action_recommendation', 'Optimized household utility footprint.')}\"",
        "co2_saving_kg": float(bill_data.get("co2_savings_potential_kg", 25.0)),
        "points": 40,
        "color": "amber" if bill_data.get("bill_type") == "electricity" else "green",
        "agent_name": "BillReceiptAuditorAgent",
        "status": "pending",
        "in_plan": False,
        "steps": steps,
        "created_at": now_iso
    }
    save_action(action_dict)

    event_id = f"evt-{uuid.uuid4().hex[:6]}"
    event_dict = {
        "id": event_id,
        "timestamp": now_iso,
        "activity_type": "electricity" if bill_data.get("bill_type") == "electricity" else "general",
        "source": "Bill / Receipt Scan",
        "description": f"{bill_data.get('vendor')} bill audit (Footprint: {bill_data.get('carbon_footprint_kg', 0):.1f} kg CO2e)",
        "carbon_impact_kg": float(bill_data.get("carbon_footprint_kg", 15.0)),
        "waste_diverted_kg": 0.0,
        "water_consumed_l": 0.0,
        "confidence": v_res.confidence_adjusted,
        "assumptions": f"Identified potential monthly savings: ₹{bill_data.get('instant_savings_inr', 0):.0f}",
        "is_demo": not bill_data.get("is_live_ai", False)
    }
    add_event(event_dict)

    return AnalyzeResponse(
        input_type="bill",
        specialist="BillReceiptAuditorAgent",
        data=bill_data,
        action_card=ActionItemModel(**action_dict),
        event_logged=EventModel(**event_dict),
        trace=all_trace,
        is_live_ai=bill_data.get("is_live_ai", False)
    )

@router.post("/voice", response_model=AnalyzeResponse)
async def analyze_voice_endpoint(
    voice_transcript: str = Form(...),
    city: str = Form("Bengaluru")
):
    all_trace: List[TraceItem] = []
    ts = datetime.now(timezone.utc).strftime("%H:%M:%S")

    all_trace.append(TraceItem(
        agent_name="VoiceCopilotAgent",
        status="INFO",
        explanation=f"Parsed natural speech intent: \"{voice_transcript}\"",
        timestamp=ts
    ))

    # Determine intent
    t = voice_transcript.lower()
    if any(w in t for w in ["metro", "bus", "travel", "km", "kms", "cab", "ride", "auto", "walk", "bike", "cycle", "drive", "rapido", "uber", "ola", "taxi", "rickshaw", "scooter", "commute", "transit"]):
        res = await analyze_mobility_endpoint(input_text=voice_transcript)
        return res
    elif any(w in t for w in ["bill", "bescom", "kwh", "electricity", "receipt", "bought"]):
        res = await analyze_bill_endpoint(file=None, input_text=voice_transcript, city=city)
        return res
    else:
        res = await analyze_waste_endpoint(file=None, input_text=voice_transcript, city=city)
        return res

