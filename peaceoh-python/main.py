from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import store

from routers.auth_router     import router as auth_router
from routers.letters_router  import router as letters_router
from routers.mandalas_router import router as mandalas_router
from routers.moods_router    import router as moods_router
from routers.bubbles_router  import router as bubbles_router

app = FastAPI(title="PeaceOh API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(letters_router)
app.include_router(mandalas_router)
app.include_router(moods_router)
app.include_router(bubbles_router)

# ── Health & stats ────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    from datetime import datetime, timezone
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.get("/api/stats")
def stats():
    return store.get_stats()
