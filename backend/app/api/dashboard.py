from fastapi import APIRouter, Query
from ..schemas.api import DashboardResponse, DashboardMetrics, ActionItemModel, EventModel
from ..database.repositories import calculate_dashboard_metrics, get_actions, get_all_events
from ..services.context import get_city_context

router = APIRouter()

@router.get("", response_model=DashboardResponse)
@router.get("/", response_model=DashboardResponse)
def get_dashboard(city: str = Query("Bengaluru")):
    metrics_raw = calculate_dashboard_metrics()
    metrics = DashboardMetrics(**metrics_raw)

    actions_raw = get_actions(limit=10)
    actions = [ActionItemModel(**a) for a in actions_raw]

    events_raw = get_all_events(limit=10)
    events = [EventModel(**e) for e in events_raw]

    city_context = get_city_context(city)

    return DashboardResponse(
        metrics=metrics,
        recent_actions=actions,
        recent_events=events,
        city_context=city_context,
        trace=[]
    )
