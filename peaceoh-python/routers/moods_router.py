from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4
from datetime import datetime, timezone
import store
from auth import get_current_user

router = APIRouter(prefix="/api/moods", tags=["moods"])
VALID_MOODS = {"peaceful", "sad", "frustrated", "numb", "tender"}


class MoodBody(BaseModel):
    mood: str
    activity: Optional[str] = None


@router.post("", status_code=201)
def log_mood(body: MoodBody, user=Depends(get_current_user)):
    if body.mood.lower() not in VALID_MOODS:
        raise HTTPException(400, f"mood must be one of: {', '.join(VALID_MOODS)}.")
    entry = {
        "id":        str(uuid4()),
        "mood":      body.mood.lower(),
        "activity":  body.activity,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    store.log_mood(user["id"], entry)
    return entry


@router.get("/summary")
def mood_summary(user=Depends(get_current_user)):
    return store.get_mood_summary(user["id"])


@router.get("")
def get_moods(limit: int = 30, offset: int = 0, user=Depends(get_current_user)):
    limit = min(limit, 100)
    return store.get_mood_logs(user["id"], limit=limit, offset=offset)
