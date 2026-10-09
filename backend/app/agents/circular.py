import json
import time
from pathlib import Path
from typing import Tuple, List, Optional
from ..schemas.agent import CircularAnalysis, PartnerMatch, TraceItem
from ..config import DATA_DIR

PARTNERS_FILE = DATA_DIR / "partners.json"

def analyze_circular(
    input_text: Optional[str] = None
) -> Tuple[CircularAnalysis, List[TraceItem]]:
    trace: List[TraceItem] = []
    ts = time.strftime("%H:%M:%S")

    trace.append(TraceItem(
        agent_name="CircularExchangeAgent",
        status="INFO",
        explanation="Querying verified Bengaluru community circular exchange & authorized recovery network.",
        timestamp=ts
    ))

    with open(PARTNERS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    partners_raw = data.get("partners", [])
    matches = [PartnerMatch(**p) for p in partners_raw]

    analysis = CircularAnalysis(
        item_name="Durable Reusable Goods / Textiles / E-Waste",
        material="Wearable textiles, functional small electronics, or sturdy cartons",
        suggested_action="DONATE & RECYCLE",
        matched_partners=matches,
        suggested_outreach_message="Hello, I have clean segregated household items available for collection/drop-off under the Bengaluru Circular Resource Exchange program. Please advise your nearest hub intake timing.",
        is_live_ai=False
    )

    trace.append(TraceItem(
        agent_name="CircularExchangeAgent",
        status="SUCCESS",
        explanation=f"Found {len(matches)} verified local collection points (Hasiru Dala, Saahas, Goonj).",
        timestamp=time.strftime("%H:%M:%S"),
        details={"partners_matched": len(matches)}
    ))

    return analysis, trace
