from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime, timezone
import store
from auth import get_current_user

router = APIRouter(prefix="/api/bubbles", tags=["bubbles"])


class ScoreBody(BaseModel):
    score: int


@router.post("/scores", status_code=201)
def submit_score(body: ScoreBody, user=Depends(get_current_user)):
    if body.score < 0 or body.score > 100_000:
        raise HTTPException(400, "score must be between 0 and 100 000.")
    entry = {
        "id":        str(uuid4()),
        "score":     body.score,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    store.save_bubble_score(user["id"], entry)
    return entry


@router.get("/scores")
def get_scores(user=Depends(get_current_user)):
    return store.get_bubble_scores(user["id"])


@router.get("/leaderboard")
def leaderboard(user=Depends(get_current_user)):
    return store.get_leaderboard()
