from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import store
from auth import get_current_user

router = APIRouter(prefix="/api/letters", tags=["letters"])
VALID_TYPES = {"future", "self"}


class LetterBody(BaseModel):
    text: str
    deliver_at: Optional[str] = None


def _check_type(letter_type: str):
    if letter_type not in VALID_TYPES:
        raise HTTPException(400, f"Type must be one of: {', '.join(VALID_TYPES)}.")


@router.get("")
def get_all(user=Depends(get_current_user)):
    return store.get_all_letters(user["id"])


@router.get("/{letter_type}")
def get_letter(letter_type: str, user=Depends(get_current_user)):
    _check_type(letter_type)
    letter = store.get_letter(user["id"], letter_type)
    if not letter:
        raise HTTPException(404, "No letter found.")
    return letter


@router.put("/{letter_type}")
def save_letter(letter_type: str, body: LetterBody, user=Depends(get_current_user)):
    _check_type(letter_type)
    if len(body.text) > 50_000:
        raise HTTPException(400, "Letter is too long (max 50 000 characters).")
    data = {
        "text":       body.text,
        "deliver_at": body.deliver_at,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    return store.save_letter(user["id"], letter_type, data)


@router.delete("/{letter_type}")
def delete_letter(letter_type: str, user=Depends(get_current_user)):
    _check_type(letter_type)
    store.delete_letter(user["id"], letter_type)
    return {"message": "Letter deleted."}
