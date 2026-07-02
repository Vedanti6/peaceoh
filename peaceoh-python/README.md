# PeaceOh — Python Backend

## Setup (run these once)

```bash
pip install -r requirements.txt
```

## Start the server

```bash
python -m uvicorn main:app --reload --port 3001
```

The server runs on **http://localhost:3001**

## Interactive API docs

Open in your browser: **http://localhost:3001/docs**
(FastAPI generates this automatically — you can test every endpoint there.)

---

## API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register` | `{ "email": "...", "password": "..." }` |
| POST | `/api/auth/login` | `{ "email": "...", "password": "..." }` |
| GET | `/api/auth/me` | Get current user (requires token) |

### Letters
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/letters` | Get both letters |
| GET | `/api/letters/future` | Get future self letter |
| GET | `/api/letters/self` | Get present self letter |
| PUT | `/api/letters/future` | Save letter `{ "text": "..." }` |
| DELETE | `/api/letters/future` | Delete letter |

### Mandalas
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/mandalas` | List all saved mandalas |
| POST | `/api/mandalas` | `{ "filled_segments": { "0-0": "#F7C5C5" } }` |
| PUT | `/api/mandalas/:id` | Update segment fills |
| DELETE | `/api/mandalas/:id` | Delete mandala |

### Moods
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/moods` | `{ "mood": "peaceful", "activity": "mandala" }` |
| GET | `/api/moods` | Mood history |
| GET | `/api/moods/summary` | Counts per mood |

### Bubbles
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/bubbles/scores` | `{ "score": 42 }` |
| GET | `/api/bubbles/scores` | Personal scores + best |
| GET | `/api/bubbles/leaderboard` | Top 10 global |

---

All protected endpoints need this header:
```
Authorization: Bearer <token>
```
