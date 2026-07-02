from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime, timezone
import store
from auth import get_current_user

router = APIRouter(prefix="/api/mandalas", tags=["mandalas"])


class MandalaBody(BaseModel):
    filled_segments: dict


@router.get("")
def list_mandalas(user=Depends(get_current_user)):
    return store.list_mandalas(user["id"])


@router.post("", status_code=201)
def create_mandala(body: MandalaBody, user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    return store.save_mandala(user["id"], str(uuid4()), body.filled_segments, now)


@router.get("/{mandala_id}")
def get_mandala(mandala_id: str, user=Depends(get_current_user)):
    m = store.get_mandala(user["id"], mandala_id)
    if not m:
        raise HTTPException(404, "Mandala not found.")
    return m


@router.put("/{mandala_id}")
def update_mandala(mandala_id: str, body: MandalaBody, user=Depends(get_current_user)):
    if not store.get_mandala(user["id"], mandala_id):
        raise HTTPException(404, "Mandala not found.")
    now = datetime.now(timezone.utc).isoformat()
    return store.save_mandala(user["id"], mandala_id, body.filled_segments, now)


@router.delete("/{mandala_id}")
def delete_mandala(mandala_id: str, user=Depends(get_current_user)):
    if not store.get_mandala(user["id"], mandala_id):
        raise HTTPException(404, "Mandala not found.")
    store.delete_mandala(user["id"], mandala_id)
    return {"message": "Mandala deleted."}
