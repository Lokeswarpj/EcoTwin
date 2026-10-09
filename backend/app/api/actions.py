from fastapi import APIRouter, HTTPException, Query
from ..schemas.api import ActionToggleResponse
from ..database.repositories import update_action_step, calculate_dashboard_metrics, get_actions

router = APIRouter()

@router.get("", response_model=list)
@router.get("/", response_model=list)
def list_actions(limit: int = Query(20)):
    return get_actions(limit=limit)

@router.post("/{action_id}/step/{step_idx}", response_model=ActionToggleResponse)
def toggle_step(action_id: str, step_idx: int, done: bool = True):
    success = update_action_step(action_id, step_idx, done)
    if not success:
        raise HTTPException(status_code=404, detail="Action or step index not found")

    metrics = calculate_dashboard_metrics()
    return ActionToggleResponse(
        success=True,
        action_id=action_id,
        new_status="completed" if done else "pending",
        points_awarded=25 if done else 0,
        updated_planet_score=metrics["planet_score"]
    )
