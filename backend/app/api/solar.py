from fastapi import APIRouter
from ..schemas.api import SolarSimulateRequest, SolarSimulateResponse
from ..services.solar import calculate_solar_simulation

router = APIRouter()

@router.post("/simulate", response_model=SolarSimulateResponse)
def simulate_solar(req: SolarSimulateRequest):
    data = calculate_solar_simulation(roof_area_kw=req.roof_area_kw, city=req.city)
    return SolarSimulateResponse(**data)
