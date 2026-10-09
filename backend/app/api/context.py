from fastapi import APIRouter, Query
from ..schemas.api import ContextResponse
from ..services.context import get_city_context
from ..services.forecast import generate_forecast

router = APIRouter()

@router.get("", response_model=ContextResponse)
@router.get("/", response_model=ContextResponse)
def get_context(city: str = Query("Bengaluru")):
    data = get_city_context(city)
    return ContextResponse(**data)

@router.get("/forecast")
def get_forecast():
    return generate_forecast()
