from fastapi import APIRouter, Query
from ..database.repositories import get_all_events

router = APIRouter()

@router.get("", response_model=list)
@router.get("/", response_model=list)
def get_history(limit: int = Query(50)):
    return get_all_events(limit=limit)
