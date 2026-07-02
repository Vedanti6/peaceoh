// src/api.ts — All communication with the PeaceOh Python backend

const BASE = "";
// ── Token helpers ─────────────────────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem("peaceoh_token");
}
export function setToken(t: string) {
  localStorage.setItem("peaceoh_token", t);
}
export function clearToken() {
  localStorage.removeItem("peaceoh_token");
}
export function isLoggedIn(): boolean {
  return !!getToken();
}

function authHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || "Request failed");
  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function register(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse<{ token: string; user: { id: string; email: string } }>(res);
  setToken(data.token);
  return data;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse<{ token: string; user: { id: string; email: string } }>(res);
  setToken(data.token);
  return data;
}

export function logout() {
  clearToken();
}

// ── Letters ───────────────────────────────────────────────────────────────────
export async function getLetter(type: "future" | "self"): Promise<{ text: string } | null> {
  try {
    const res = await fetch(`${BASE}/api/letters/${type}`, { headers: authHeaders() });
    if (res.status === 404) return null;
    return handleResponse(res);
  } catch {
    return null;
  }
}

export async function saveLetter(type: "future" | "self", text: string) {
  const res = await fetch(`${BASE}/api/letters/${type}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ text }),
  });
  return handleResponse(res);
}

// ── Mandalas ──────────────────────────────────────────────────────────────────
export async function getMandala(id: string): Promise<{ id: string; filled_segments: Record<string, string> } | null> {
  try {
    const res = await fetch(`${BASE}/api/mandalas/${id}`, { headers: authHeaders() });
    if (res.status === 404) return null;
    return handleResponse(res);
  } catch {
    return null;
  }
}

export async function createMandala(filledSegments: Record<string, string>) {
  const res = await fetch(`${BASE}/api/mandalas`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ filled_segments: filledSegments }),
  });
  return handleResponse<{ id: string }>(res);
}

export async function updateMandala(id: string, filledSegments: Record<string, string>) {
  const res = await fetch(`${BASE}/api/mandalas/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ filled_segments: filledSegments }),
  });
  return handleResponse(res);
}

// ── Moods ─────────────────────────────────────────────────────────────────────
export async function logMood(mood: string, activity?: string) {
  if (!isLoggedIn()) return;
  const res = await fetch(`${BASE}/api/moods`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ mood, activity: activity || null }),
  });
  return handleResponse(res);
}

// ── Bubble scores ─────────────────────────────────────────────────────────────
export async function submitBubbleScore(score: number) {
  if (!isLoggedIn()) return;
  const res = await fetch(`${BASE}/api/bubbles/scores`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ score }),
  });
  return handleResponse(res);
}

export async function getLeaderboard(): Promise<{ rank: number; email: string; best_score: number }[]> {
  try {
    const res = await fetch(`${BASE}/api/bubbles/leaderboard`, { headers: authHeaders() });
    return handleResponse(res);
  } catch {
    return [];
  }
}
