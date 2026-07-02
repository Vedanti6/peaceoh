"""
Simple JSON file-based data store.
Swap for PostgreSQL / MongoDB in production.
"""

import json
import os
from pathlib import Path

DATA_FILE = Path(__file__).parent / "data" / "db.json"

EMPTY_DB = {
    "users":        {},   # { userId: { id, email, password_hash, created_at } }
    "letters":      {},   # { userId: { future: {...}, self: {...} } }
    "mandalas":     {},   # { userId: [ { id, filled_segments, ... } ] }
    "mood_logs":    {},   # { userId: [ { id, mood, activity, timestamp } ] }
    "bubble_scores":{}    # { userId: [ { id, score, timestamp } ] }
}


def _read() -> dict:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        DATA_FILE.write_text(json.dumps(EMPTY_DB, indent=2))
    return json.loads(DATA_FILE.read_text())


def _write(data: dict):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(data, indent=2))


# ── Users ─────────────────────────────────────────────────────────────────────

def get_user_by_id(user_id: str):
    return _read()["users"].get(user_id)

def get_user_by_email(email: str):
    users = _read()["users"]
    return next((u for u in users.values() if u["email"] == email.lower()), None)

def create_user(user: dict):
    db = _read()
    db["users"][user["id"]] = user
    _write(db)
    return user


# ── Letters ───────────────────────────────────────────────────────────────────

def get_letter(user_id: str, letter_type: str):
    return _read()["letters"].get(user_id, {}).get(letter_type)

def get_all_letters(user_id: str):
    return _read()["letters"].get(user_id, {})

def save_letter(user_id: str, letter_type: str, data: dict):
    db = _read()
    if user_id not in db["letters"]:
        db["letters"][user_id] = {}
    existing = db["letters"][user_id].get(letter_type, {})
    db["letters"][user_id][letter_type] = {**data, "created_at": existing.get("created_at", data["updated_at"])}
    _write(db)
    return db["letters"][user_id][letter_type]

def delete_letter(user_id: str, letter_type: str):
    db = _read()
    if user_id in db["letters"]:
        db["letters"][user_id].pop(letter_type, None)
        _write(db)


# ── Mandalas ──────────────────────────────────────────────────────────────────

def list_mandalas(user_id: str):
    return _read()["mandalas"].get(user_id, [])

def get_mandala(user_id: str, mandala_id: str):
    return next((m for m in list_mandalas(user_id) if m["id"] == mandala_id), None)

def save_mandala(user_id: str, mandala_id: str, filled_segments: dict, now: str):
    db = _read()
    lst = db["mandalas"].get(user_id, [])
    idx = next((i for i, m in enumerate(lst) if m["id"] == mandala_id), -1)
    if idx >= 0:
        lst[idx] = {**lst[idx], "filled_segments": filled_segments, "updated_at": now}
    else:
        lst.append({"id": mandala_id, "filled_segments": filled_segments, "created_at": now, "updated_at": now})
    db["mandalas"][user_id] = lst
    _write(db)
    return next(m for m in db["mandalas"][user_id] if m["id"] == mandala_id)

def delete_mandala(user_id: str, mandala_id: str):
    db = _read()
    db["mandalas"][user_id] = [m for m in db["mandalas"].get(user_id, []) if m["id"] != mandala_id]
    _write(db)


# ── Moods ─────────────────────────────────────────────────────────────────────

def log_mood(user_id: str, entry: dict):
    db = _read()
    lst = db["mood_logs"].get(user_id, [])
    lst.insert(0, entry)
    db["mood_logs"][user_id] = lst[:200]
    _write(db)

def get_mood_logs(user_id: str, limit: int = 30, offset: int = 0):
    all_logs = _read()["mood_logs"].get(user_id, [])
    return {"entries": all_logs[offset:offset + limit], "total": len(all_logs)}

def get_mood_summary(user_id: str):
    all_logs = _read()["mood_logs"].get(user_id, [])
    moods = ["peaceful", "sad", "frustrated", "numb", "tender"]
    summary = {m: 0 for m in moods}
    for e in all_logs:
        if e["mood"] in summary:
            summary[e["mood"]] += 1
    return {"summary": summary, "total": len(all_logs)}


# ── Bubble scores ─────────────────────────────────────────────────────────────

def save_bubble_score(user_id: str, entry: dict):
    db = _read()
    lst = db["bubble_scores"].get(user_id, [])
    lst.insert(0, entry)
    db["bubble_scores"][user_id] = lst[:100]
    _write(db)

def get_bubble_scores(user_id: str):
    scores = _read()["bubble_scores"].get(user_id, [])
    best = max((s["score"] for s in scores), default=0)
    return {"scores": scores[:20], "best": best}

def get_leaderboard():
    db = _read()
    result = []
    for uid, scores in db["bubble_scores"].items():
        best = max((s["score"] for s in scores), default=0)
        email = db["users"].get(uid, {}).get("email", "unknown")
        local, _, domain = email.partition("@")
        obfuscated = f"{local[:2]}***@{domain}" if domain else "***"
        result.append({"user_id": uid, "email": obfuscated, "best_score": best})
    result.sort(key=lambda x: x["best_score"], reverse=True)
    return [{"rank": i + 1, **r} for i, r in enumerate(result[:10])]


# ── Stats ─────────────────────────────────────────────────────────────────────

def get_stats():
    db = _read()
    return {
        "total_users":    len(db["users"]),
        "total_letters":  sum(len(v) for v in db["letters"].values()),
        "total_mandalas": sum(len(v) for v in db["mandalas"].values()),
        "total_mood_logs":sum(len(v) for v in db["mood_logs"].values()),
    }
