from fastapi import APIRouter, Query
from ..schemas.api import WeeklyPlanResponse
from ..agents.planner import generate_weekly_plan

router = APIRouter()

@router.get("/weekly", response_model=WeeklyPlanResponse)
def get_weekly_plan(city: str = Query("Bengaluru")):
    plan_resp, trace = generate_weekly_plan(city=city)
    plan_resp.trace = trace
    return plan_resp

@router.post("/generate", response_model=WeeklyPlanResponse)
def post_generate_plan(city: str = Query("Bengaluru")):
    plan_resp, trace = generate_weekly_plan(city=city)
    plan_resp.trace = trace
    return plan_resp
