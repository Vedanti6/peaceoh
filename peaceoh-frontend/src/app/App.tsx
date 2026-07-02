import { useState, useEffect, useRef, useCallback } from "react";
import * as api from "../api";

// ── injected styles ──────────────────────────────────────────────────────────
const INJECTED_CSS = `
  @keyframes floatTrail {
    0%   { transform: translateY(0) scale(1); opacity: 0.85; }
    100% { transform: translateY(-72px) scale(0.15); opacity: 0; }
  }
  @keyframes heroDrift {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    38%     { transform: translateY(-22px) rotate(5deg); }
    68%     { transform: translateY(-11px) rotate(-3deg); }
  }
  @keyframes floatUp {
    0%   { transform: translateY(0); opacity: 0.9; }
    80%  { opacity: 0.65; }
    100% { transform: translateY(-600px); opacity: 0; }
  }
  @keyframes popBurst {
    0%   { transform: scale(1); opacity: 1; }
    45%  { transform: scale(1.65); opacity: 0.5; }
    100% { transform: scale(0); opacity: 0; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .notebook-lined {
    background-image: repeating-linear-gradient(
      to bottom,
      transparent 0px, transparent 31px,
      rgba(216,201,240,0.45) 31px, rgba(216,201,240,0.45) 32px
    );
    line-height: 32px;
  }
  .scroll-hidden::-webkit-scrollbar { display: none; }
  .scroll-hidden { -ms-overflow-style: none; scrollbar-width: none; }
  .page-enter { animation: fadeIn 0.35s ease-out both; }
`;

// ── types ────────────────────────────────────────────────────────────────────
type Page = "home" | "bubbles" | "sand" | "letter-future" | "letter-self" | "mandala";

// ── palette ──────────────────────────────────────────────────────────────────
const PASTEL = ["#F7C5C5", "#D8C9F0", "#C3E8D8", "#FBF0C2", "#C5DFF7"];
const C = {
  blush: "#F7C5C5",
  lavender: "#D8C9F0",
  mint: "#C3E8D8",
  buttercup: "#FBF0C2",
  sky: "#C5DFF7",
  cream: "#FAF7F2",
  text: "#3D3450",
  muted: "#8A7FA0",
};

// ── mandala segment generator ─────────────────────────────────────────────────
function arcPath(cx: number, cy: number, r1: number, r2: number, sd: number, ed: number) {
  const r = (d: number) => (d * Math.PI) / 180;
  const [s, e] = [r(sd), r(ed)];
  const p = [
    [cx + r1 * Math.cos(s), cy + r1 * Math.sin(s)],
    [cx + r2 * Math.cos(s), cy + r2 * Math.sin(s)],
    [cx + r2 * Math.cos(e), cy + r2 * Math.sin(e)],
    [cx + r1 * Math.cos(e), cy + r1 * Math.sin(e)],
  ];
  const lg = ed - sd > 180 ? 1 : 0;
  return (
    `M ${p[0][0]} ${p[0][1]} ` +
    `L ${p[1][0]} ${p[1][1]} ` +
    `A ${r2} ${r2} 0 ${lg} 1 ${p[2][0]} ${p[2][1]} ` +
    `L ${p[3][0]} ${p[3][1]} ` +
    `A ${r1} ${r1} 0 ${lg} 0 ${p[0][0]} ${p[0][1]} Z`
  );
}

const RINGS = [
  { r1: 20, r2: 54, n: 8 },
  { r1: 54, r2: 92, n: 12 },
  { r1: 92, r2: 132, n: 16 },
  { r1: 132, r2: 172, n: 24 },
  { r1: 172, r2: 208, n: 32 },
];

const MANDALA_SEGS = RINGS.flatMap((ring, ri) =>
  Array.from({ length: ring.n }, (_, i) => {
    const span = 360 / ring.n;
    const start = -90 + i * span;
    return { key: `${ri}-${i}`, path: arcPath(210, 210, ring.r1, ring.r2, start, start + span) };
  })
);

const SWATCH_COLORS = [
  "#F7C5C5", "#F4A0A0",
  "#D8C9F0", "#B8A0E0",
  "#C3E8D8", "#9FD0BA",
  "#FBF0C2", "#F5E090",
  "#C5DFF7", "#9CCCF0",
  "#FAF7F2", "#3D3450",
];

// ── AuthModal ─────────────────────────────────────────────────────────────────
function AuthModal({ onAuth }: { onAuth: (email: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        await api.login(email, password);
      } else {
        await api.register(email, password);
      }
      onAuth(email);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(61,52,80,0.35)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="rounded-[28px] p-10 w-full max-w-sm"
        style={{ background: C.cream, boxShadow: "0 24px 80px rgba(61,52,80,0.22)" }}
      >
        <h2
          className="text-center mb-1"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontStyle: "italic", color: C.text }}
        >
          PeaceOh 🫧
        </h2>
        <p
          className="text-center mb-8"
          style={{ fontFamily: "Caveat, cursive", fontSize: 16, color: C.muted }}
        >
          {mode === "login" ? "welcome back, gently" : "create your gentle space"}
        </p>

        <div className="flex gap-2 mb-6 rounded-full p-1" style={{ background: "rgba(216,201,240,0.3)" }}>
          {(["login", "register"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className="flex-1 py-2 rounded-full text-sm transition-all"
              style={{
                fontFamily: "DM Sans, sans-serif",
                background: mode === m ? C.lavender : "transparent",
                color: C.text,
                fontWeight: mode === m ? 600 : 400,
              }}
            >
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          className="w-full px-4 py-3 rounded-[14px] outline-none mb-3"
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 15,
            background: "rgba(216,201,240,0.2)",
            border: "1.5px solid rgba(216,201,240,0.5)",
            color: C.text,
          }}
        />
        <input
          type="password"
          placeholder="password (min 6 chars)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          className="w-full px-4 py-3 rounded-[14px] outline-none mb-4"
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 15,
            background: "rgba(216,201,240,0.2)",
            border: "1.5px solid rgba(216,201,240,0.5)",
            color: C.text,
          }}
        />

        {error && (
          <p className="mb-4 text-center text-sm" style={{ color: "#e05555", fontFamily: "DM Sans, sans-serif" }}>
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 rounded-[14px] font-medium transition-all hover:scale-[1.02] active:scale-95"
          style={{
            fontFamily: "DM Sans, sans-serif",
            background: C.blush,
            color: C.text,
            fontSize: 16,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </div>
    </div>
  );
}

// ── BubbleTrail ───────────────────────────────────────────────────────────────
interface TrailBub { id: number; x: number; y: number; size: number; color: string; }

function BubbleTrail({ active }: { active: boolean }) {
  const [bubbles, setBubbles] = useState<TrailBub[]>([]);
  const counter = useRef(0);
  const last = useRef({ x: -99, y: -99 });

  useEffect(() => {
    if (!active) return;
    const move = (e: MouseEvent) => {
      if (Math.hypot(e.clientX - last.current.x, e.clientY - last.current.y) < 16) return;
      last.current = { x: e.clientX, y: e.clientY };
      const id = counter.current++;
      setBubbles(prev => [
        ...prev.slice(-28),
        { id, x: e.clientX, y: e.clientY, size: 6 + Math.random() * 15, color: PASTEL[id % PASTEL.length] },
      ]);
      setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 950);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [active]);

  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden>
      {bubbles.map(b => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            left: b.x - b.size / 2,
            top: b.y - b.size / 2,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: b.color,
            animation: "floatTrail 0.95s ease-out forwards",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        />
      ))}
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({
  page, setPage, userEmail, onLogout,
}: {
  page: Page; setPage: (p: Page) => void; userEmail: string | null; onLogout: () => void;
}) {
  const links: { label: string; target: Page }[] = [
    { label: "Pop Bubbles", target: "bubbles" },
    { label: "Sand Drawing", target: "sand" },
    { label: "Letters", target: "letter-future" },
    { label: "Mandala", target: "mandala" },
  ];
  const isActive = (target: Page) =>
    page === target || (target === "letter-future" && page === "letter-self");

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "rgba(250,247,242,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(216,201,240,0.4)" }}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => setPage("home")}
          className="flex items-center gap-2 select-none"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontStyle: "italic", fontWeight: 700, color: C.text }}
        >
          PeaceOh
          <span className="text-base not-italic" style={{ fontFamily: "Caveat, cursive", fontStyle: "normal", color: C.muted, fontWeight: 400, fontSize: 14 }}>
            🫧
          </span>
        </button>
        <div className="flex gap-1 flex-wrap justify-end items-center">
          {links.map(({ label, target }) => (
            <button
              key={target}
              onClick={() => setPage(target)}
              className="px-4 py-1.5 rounded-full text-sm transition-all duration-200"
              style={{
                fontFamily: "DM Sans, sans-serif",
                background: isActive(target) ? C.sky : "transparent",
                color: isActive(target) ? C.text : C.muted,
                fontWeight: isActive(target) ? 500 : 400,
              }}
              onMouseEnter={e => { if (!isActive(target)) (e.currentTarget as HTMLElement).style.background = "rgba(197,223,247,0.4)"; }}
              onMouseLeave={e => { if (!isActive(target)) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {label}
            </button>
          ))}
          {userEmail && (
            <button
              onClick={onLogout}
              className="ml-2 px-3 py-1.5 rounded-full text-xs transition-all"
              style={{ fontFamily: "DM Sans, sans-serif", color: C.muted, border: "1px solid rgba(138,127,160,0.3)" }}
              title={`Signed in as ${userEmail}`}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── HomePage ──────────────────────────────────────────────────────────────────
const FEATURES = [
  { title: "Pop Bubbles", emoji: "🫧", bg: C.sky, page: "bubbles" as Page, desc: "Click to release a little tension, one bubble at a time." },
  { title: "Sand Drawing", emoji: "🏖️", bg: C.mint, page: "sand" as Page, desc: "Draw slow, meditative patterns on soft digital sand." },
  { title: "Future Letter", emoji: "💌", bg: C.buttercup, page: "letter-future" as Page, desc: "Leave a tender note for the person you are becoming." },
  { title: "Self Letter", emoji: "📝", bg: C.blush, page: "letter-self" as Page, desc: "Speak honestly and kindly to the self you are right now." },
  { title: "Mandala", emoji: "🌸", bg: C.lavender, page: "mandala" as Page, desc: "Color your calm in layers of soft, radial symmetry." },
];

const MOODS = [
  { emoji: "😌", label: "Peaceful", value: "peaceful", page: "mandala" as Page, color: C.lavender },
  { emoji: "😔", label: "Sad", value: "sad", page: "letter-self" as Page, color: C.sky },
  { emoji: "😤", label: "Frustrated", value: "frustrated", page: "bubbles" as Page, color: C.blush },
  { emoji: "😶", label: "Numb", value: "numb", page: "sand" as Page, color: C.mint },
  { emoji: "🥺", label: "Tender", value: "tender", page: "letter-future" as Page, color: C.buttercup },
];

const HERO_DECO = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${(i * 7.3 + 3) % 96}%`,
  top: `${(i * 11.7 + 5) % 88}%`,
  size: 36 + (i * 19) % 80,
  color: PASTEL[i % PASTEL.length],
  delay: ((i * 0.65) % 3.8).toFixed(2),
  dur: (5.2 + (i * 0.9) % 3.6).toFixed(1),
}));

function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  const [selMood, setSelMood] = useState<number | null>(null);

  const pickMood = async (idx: number) => {
    setSelMood(idx);
    const mood = MOODS[idx];
    await api.logMood(mood.value);
    setTimeout(() => setPage(mood.page), 550);
  };

  return (
    <div className="pt-16">
      {/* ─── Hero ─── */}
      <section className="relative min-h-[94vh] flex flex-col items-center justify-center overflow-hidden px-6" style={{ background: C.cream }}>
        {HERO_DECO.map(b => (
          <div
            key={b.id}
            className="absolute rounded-full pointer-events-none select-none"
            style={{ left: b.left, top: b.top, width: b.size, height: b.size, background: b.color, opacity: 0.32, animation: `heroDrift ${b.dur}s ease-in-out ${b.delay}s infinite` }}
          />
        ))}

        <div className="relative z-10 text-center max-w-2xl">
          <span className="block mb-5" style={{ fontFamily: "Caveat, cursive", fontSize: 17, color: C.muted, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            your gentle space
          </span>
          <h1 className="mb-6" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(38px, 6vw, 62px)", fontStyle: "italic", fontWeight: 700, color: C.text, lineHeight: 1.18 }}>
            Find your peace,<br />one breath at a time.
          </h1>
          <p className="mb-10" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 18, color: C.muted, lineHeight: 1.7 }}>
            A soft corner of the internet for mindful play,<br className="hidden sm:block" />
            quiet reflection, and gentle self-expression.
          </p>
          <button
            onClick={() => setPage("bubbles")}
            className="inline-flex items-center gap-2 font-medium transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ fontFamily: "DM Sans, sans-serif", fontSize: 16, background: C.blush, color: C.text, padding: "14px 32px", borderRadius: 28, boxShadow: "0 6px 28px rgba(247,197,197,0.55)", fontWeight: 600 }}
          >
            Begin →
          </button>
        </div>

        <div className="absolute bottom-8 text-[#8A7FA0] animate-bounce" style={{ fontFamily: "Caveat, cursive", fontSize: 16, left: "50%", transform: "translateX(-50%)" }}>
          scroll gently ↓
        </div>
      </section>

      {/* ─── Feature Cards ─── */}
      <section className="py-20 px-6" style={{ background: C.cream }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-center mb-10" style={{ fontFamily: "Caveat, cursive", fontSize: 20, color: C.muted }}>
            five ways to breathe
          </p>
          <div className="flex gap-5 overflow-x-auto scroll-hidden pb-4 md:justify-center">
            {FEATURES.map(f => (
              <button
                key={f.page}
                onClick={() => setPage(f.page)}
                className="flex-shrink-0 rounded-[24px] p-6 flex flex-col items-start text-left transition-all duration-300"
                style={{ width: 220, height: 280, background: f.bg, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-6px)"; el.style.boxShadow = "0 14px 38px rgba(0,0,0,0.13)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 4px 24px rgba(0,0,0,0.07)"; }}
              >
                <div className="text-5xl mb-4">{f.emoji}</div>
                <h3 className="mb-2" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 18, color: C.text }}>{f.title}</h3>
                <p className="flex-1 text-sm" style={{ fontFamily: "DM Sans, sans-serif", color: C.muted, lineHeight: 1.65 }}>{f.desc}</p>
                <span className="mt-4 text-sm font-medium" style={{ fontFamily: "DM Sans, sans-serif", color: C.text }}>Try it →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mood check-in ─── */}
      <section className="py-20 px-6" style={{ background: "linear-gradient(135deg, #D8C9F0 0%, #C5DFF7 100%)" }}>
        <div className="max-w-lg mx-auto text-center">
          <p className="mb-2" style={{ fontFamily: "Caveat, cursive", fontSize: 24, color: C.text }}>how are you feeling right now?</p>
          <p className="mb-10 text-sm" style={{ fontFamily: "DM Sans, sans-serif", color: C.muted }}>Pick a mood — we will guide you somewhere gentle.</p>
          <div className="flex justify-center gap-5 flex-wrap">
            {MOODS.map((m, i) => (
              <button
                key={i}
                onClick={() => pickMood(i)}
                className="flex flex-col items-center justify-center rounded-full transition-all duration-300"
                style={{
                  width: 84, height: 84,
                  background: selMood === i ? m.color : "rgba(255,255,255,0.75)",
                  boxShadow: selMood === i ? `0 6px 24px ${m.color}90` : "0 2px 12px rgba(0,0,0,0.07)",
                  transform: selMood === i ? "scale(1.18)" : "scale(1)",
                }}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="mt-0.5" style={{ fontFamily: "Caveat, cursive", fontSize: 12, color: C.muted }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ── PopBubblesPage ────────────────────────────────────────────────────────────
interface GameBubble { id: number; x: number; size: number; color: string; dur: number; popped: boolean; }

function PopBubblesPage() {
  const [bubbles, setBubbles] = useState<GameBubble[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [leaderboard, setLeaderboard] = useState<{ rank: number; email: string; best_score: number }[]>([]);
  const [showBoard, setShowBoard] = useState(false);
  const counter = useRef(0);
  const comboRef = useRef<ReturnType<typeof setTimeout>>();
  const scoreRef = useRef(0);

  const spawn = useCallback(() => {
    const id = counter.current++;
    const dur = 4.5 + Math.random() * 4;
    setBubbles(prev => [
      ...prev.filter(b => !b.popped).slice(-18),
      { id, x: 5 + Math.random() * 88, size: 44 + Math.random() * 52, color: PASTEL[id % PASTEL.length], dur, popped: false },
    ]);
    setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), dur * 1000);
  }, []);

  useEffect(() => {
    spawn(); spawn(); spawn();
    const iv = setInterval(spawn, 1100);
    return () => clearInterval(iv);
  }, [spawn]);

  // Submit score when user leaves the page or after 30 seconds of play
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    return () => {
      if (scoreRef.current > 0) {
        api.submitBubbleScore(scoreRef.current);
      }
    };
  }, []);

  const pop = (id: number) => {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
    setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 280);
    setScore(s => s + 1);
    setCombo(c => c + 1);
    if (comboRef.current) clearTimeout(comboRef.current);
    comboRef.current = setTimeout(() => setCombo(0), 1400);
  };

  const handleShowLeaderboard = async () => {
    if (scoreRef.current > 0) await api.submitBubbleScore(scoreRef.current);
    const board = await api.getLeaderboard();
    setLeaderboard(board);
    setShowBoard(true);
  };

  return (
    <div className="pt-16 min-h-screen page-enter" style={{ background: C.sky }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontStyle: "italic", color: C.text }}>Pop Bubbles</h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", color: C.muted, marginTop: 6 }}>Each pop releases a little of what you are carrying.</p>
        </div>

        <div className="flex justify-center gap-10 mb-6 items-end">
          <div className="text-center">
            <div style={{ fontFamily: "Caveat, cursive", fontSize: 56, lineHeight: 1, color: C.text }}>{score}</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: C.muted }}>popped</div>
          </div>
          {combo > 1 && (
            <div className="text-center animate-bounce">
              <div style={{ fontFamily: "Caveat, cursive", fontSize: 36, lineHeight: 1, color: C.blush }}>×{combo}</div>
              <div style={{ fontFamily: "Caveat, cursive", fontSize: 13, color: C.muted }}>combo!</div>
            </div>
          )}
        </div>

        <div className="relative rounded-[32px] overflow-hidden" style={{ height: 480, background: "rgba(255,255,255,0.28)", boxShadow: "0 4px 32px rgba(0,0,0,0.07)" }}>
          {bubbles.map(b => (
            <div
              key={b.id}
              onClick={() => !b.popped && pop(b.id)}
              className="absolute select-none"
              style={{
                left: `calc(${b.x}% - ${b.size / 2}px)`,
                bottom: -b.size,
                width: b.size,
                height: b.size,
                borderRadius: "50%",
                cursor: b.popped ? "default" : "pointer",
                background: `radial-gradient(circle at 33% 33%, rgba(255,255,255,0.85) 0%, ${b.color} 55%)`,
                boxShadow: `0 2px 14px ${b.color}70, inset 0 -3px 8px rgba(0,0,0,0.06)`,
                border: "1px solid rgba(255,255,255,0.55)",
                animation: b.popped ? "popBurst 0.28s ease-out forwards" : `floatUp ${b.dur}s ease-in-out forwards`,
              }}
            />
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => { setScore(0); setCombo(0); setBubbles([]); scoreRef.current = 0; }}
            className="px-6 py-2 rounded-full text-sm transition-colors"
            style={{ fontFamily: "DM Sans, sans-serif", border: "2px solid rgba(61,52,80,0.2)", color: C.text }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(61,52,80,0.5)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(61,52,80,0.2)"}
          >
            start over
          </button>
          {api.isLoggedIn() && (
            <button
              onClick={handleShowLeaderboard}
              className="px-6 py-2 rounded-full text-sm transition-colors"
              style={{ fontFamily: "DM Sans, sans-serif", background: C.lavender, color: C.text }}
            >
              🏆 Leaderboard
            </button>
          )}
        </div>

        {/* Leaderboard modal */}
        {showBoard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(61,52,80,0.3)", backdropFilter: "blur(4px)" }} onClick={() => setShowBoard(false)}>
            <div className="rounded-[24px] p-8 w-full max-w-sm" style={{ background: C.cream }} onClick={e => e.stopPropagation()}>
              <h3 className="text-center mb-6" style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontStyle: "italic", color: C.text }}>🏆 Top Poppers</h3>
              {leaderboard.length === 0
                ? <p className="text-center" style={{ fontFamily: "Caveat, cursive", color: C.muted }}>No scores yet — be the first!</p>
                : leaderboard.map(e => (
                  <div key={e.rank} className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid rgba(216,201,240,0.4)" }}>
                    <span style={{ fontFamily: "Caveat, cursive", fontSize: 18, color: C.muted }}>#{e.rank} {e.email}</span>
                    <span style={{ fontFamily: "Caveat, cursive", fontSize: 22, color: C.text }}>{e.best_score}</span>
                  </div>
                ))
              }
              <button onClick={() => setShowBoard(false)} className="mt-6 w-full py-2 rounded-full text-sm" style={{ fontFamily: "DM Sans, sans-serif", background: C.lavender, color: C.text }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SandDrawingPage ───────────────────────────────────────────────────────────
function SandDrawingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<[number, number] | null>(null);
  const [size, setSize] = useState(8);
  const [erasing, setErasing] = useState(false);

  const fill = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#7B6450";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? "255,255,255" : "0,0,0"},${0.018 + Math.random() * 0.032})`;
      ctx.fillRect(Math.random() * cvs.width, Math.random() * cvs.height, 1.5, 1.5);
    }
  }, []);

  useEffect(() => { fill(); }, [fill]);

  const getXY = (e: React.MouseEvent | React.TouchEvent): [number, number] => {
    const cvs = canvasRef.current!;
    const rect = cvs.getBoundingClientRect();
    const sx = cvs.width / rect.width;
    const sy = cvs.height / rect.height;
    if ("touches" in e) {
      return [(e.touches[0].clientX - rect.left) * sx, (e.touches[0].clientY - rect.top) * sy];
    }
    return [((e as React.MouseEvent).clientX - rect.left) * sx, ((e as React.MouseEvent).clientY - rect.top) * sy];
  };

  const stroke = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const [x, y] = getXY(e);
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = erasing ? "#7B6450" : "rgba(250,247,242,0.72)";
    ctx.beginPath();
    if (last.current) ctx.moveTo(...last.current);
    else ctx.moveTo(x - 0.1, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last.current = [x, y];
  };

  const SIZES = [3, 7, 14, 26];

  return (
    <div className="pt-16 min-h-screen page-enter" style={{ background: C.mint }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontStyle: "italic", color: C.text }}>Sand Drawing</h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", color: C.muted, marginTop: 6 }}>Draw slowly. Let the patterns find themselves.</p>
        </div>

        <div className="flex items-center gap-4 mb-5 px-6 py-3 rounded-[20px] flex-wrap justify-center" style={{ background: "rgba(255,255,255,0.45)", boxShadow: "0 2px 14px rgba(0,0,0,0.06)" }}>
          <div className="flex gap-3 items-center">
            {SIZES.map(s => (
              <button key={s} onClick={() => { setSize(s); setErasing(false); }} className="rounded-full transition-all duration-200"
                style={{ width: Math.max(s + 2, 14), height: Math.max(s + 2, 14), background: !erasing && size === s ? C.text : "#8A7FA0", opacity: !erasing && size === s ? 1 : 0.38, transform: !erasing && size === s ? "scale(1.25)" : "scale(1)" }}
              />
            ))}
          </div>
          <div style={{ width: 1, height: 24, background: "rgba(61,52,80,0.12)" }} />
          <button onClick={() => setErasing(v => !v)} className="px-4 py-1.5 rounded-full text-sm transition-all"
            style={{ fontFamily: "DM Sans, sans-serif", background: erasing ? "#7B6450" : "rgba(255,255,255,0.7)", color: erasing ? C.cream : C.muted }}>
            Erase
          </button>
          <button onClick={fill} className="px-4 py-1.5 rounded-full text-sm transition-all"
            style={{ fontFamily: "DM Sans, sans-serif", background: "rgba(255,255,255,0.7)", color: C.muted }}>
            Reset
          </button>
        </div>

        <div className="rounded-[24px] overflow-hidden" style={{ boxShadow: "0 8px 44px rgba(0,0,0,0.16)" }}>
          <canvas
            ref={canvasRef} width={800} height={500}
            className="block w-full cursor-crosshair touch-none"
            onMouseDown={e => { drawing.current = true; last.current = null; stroke(e); }}
            onMouseMove={stroke}
            onMouseUp={() => { drawing.current = false; last.current = null; }}
            onMouseLeave={() => { drawing.current = false; last.current = null; }}
            onTouchStart={e => { e.preventDefault(); drawing.current = true; last.current = null; stroke(e); }}
            onTouchMove={e => { e.preventDefault(); stroke(e); }}
            onTouchEnd={() => { drawing.current = false; last.current = null; }}
          />
        </div>

        <p className="text-center mt-5" style={{ fontFamily: "Caveat, cursive", fontSize: 17, color: C.muted }}>
          you are making something beautiful right now
        </p>
      </div>
    </div>
  );
}

// ── LetterPage ────────────────────────────────────────────────────────────────
function LetterPage({ type, setPage }: { type: "future" | "self"; setPage: (p: Page) => void }) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load from backend on mount
  useEffect(() => {
    if (!api.isLoggedIn()) { setLoading(false); return; }
    api.getLetter(type).then(letter => {
      if (letter) setText(letter.text);
      setLoading(false);
    });
  }, [type]);

  const seal = async () => {
    if (!api.isLoggedIn()) return;
    setSaving(true);
    try {
      await api.saveLetter(type, text);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const isFuture = type === "future";
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="pt-16 min-h-screen page-enter" style={{ background: C.buttercup }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontStyle: "italic", color: C.text }}>
            {isFuture ? "Dear Future Me" : "Dear Present Me"}
          </h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", color: C.muted, marginTop: 6 }}>
            {isFuture ? "Write to the person you are growing into." : "Speak kindly to the self you are right now."}
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {(["letter-future", "letter-self"] as Page[]).map(p => {
            const active = (p === "letter-future" && isFuture) || (p === "letter-self" && !isFuture);
            return (
              <button key={p} onClick={() => setPage(p)} className="px-5 py-2 rounded-full text-sm transition-all"
                style={{ fontFamily: "DM Sans, sans-serif", background: active ? C.blush : "rgba(255,255,255,0.5)", color: C.text, fontWeight: active ? 500 : 400, boxShadow: active ? "0 2px 12px rgba(247,197,197,0.45)" : "none" }}>
                {p === "letter-future" ? "Future Self" : "Present Self"}
              </button>
            );
          })}
        </div>

        <div className="rounded-[24px] overflow-hidden" style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: C.blush, fontFamily: "Caveat, cursive", fontSize: 14, color: C.text }}>
            <span>{dateStr}</span>
            <span style={{ opacity: 0.5 }}>{isFuture ? "to my future self" : "to my present self"}</span>
          </div>
          {loading
            ? <div className="w-full flex items-center justify-center" style={{ minHeight: 420, background: "white" }}>
                <span style={{ fontFamily: "Caveat, cursive", fontSize: 18, color: C.muted }}>loading your letter...</span>
              </div>
            : <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={isFuture ? "By the time you read this, I hope you remember..." : "Right now, I want you to know..."}
                className="w-full outline-none resize-none notebook-lined px-7 pt-3 pb-6"
                style={{ fontFamily: "Caveat, cursive", fontSize: 19, color: C.text, background: "white", minHeight: 420, caretColor: C.blush }}
              />
          }
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={seal}
            disabled={saving || loading}
            className="flex items-center gap-3 px-8 py-4 rounded-[20px] font-medium transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ fontFamily: "DM Sans, sans-serif", background: saved ? C.mint : C.blush, color: C.text, boxShadow: saved ? "0 4px 20px rgba(195,232,216,0.5)" : "0 4px 20px rgba(247,197,197,0.5)", opacity: saving ? 0.7 : 1 }}
          >
            <span className="text-xl">{saved ? "✓" : "✉️"}</span>
            {saving ? "Saving..." : saved ? "Letter sealed safely." : "Seal & Save"}
          </button>
        </div>

        <p className="text-center mt-6" style={{ fontFamily: "Caveat, cursive", fontSize: 15, color: C.muted }}>
          {isFuture ? "this letter stays here, quietly waiting for you" : "you are worthy of your own kindness"}
        </p>
      </div>
    </div>
  );
}

// ── MandalaPage ───────────────────────────────────────────────────────────────
function MandalaPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [filled, setFilled] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState(SWATCH_COLORS[0]);
  const [mandalaId, setMandalaId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const localKey = "peaceoh-mandala-id";

  // Load saved mandala on mount
  useEffect(() => {
    if (!api.isLoggedIn()) return;
    const savedId = localStorage.getItem(localKey);
    if (savedId) {
      api.getMandala(savedId).then(m => {
        if (m) { setMandalaId(m.id); setFilled(m.filled_segments); }
      });
    }
  }, []);

  const saveToBackend = async (newFilled: Record<string, string>) => {
    if (!api.isLoggedIn()) return;
    setSaveStatus("saving");
    try {
      if (mandalaId) {
        await api.updateMandala(mandalaId, newFilled);
      } else {
        const created = await api.createMandala(newFilled);
        setMandalaId(created.id);
        localStorage.setItem(localKey, created.id);
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    } catch {
      setSaveStatus("idle");
    }
  };

  const paint = (key: string) => {
    const newFilled = { ...filled, [key]: selected };
    setFilled(newFilled);
    saveToBackend(newFilled);
  };

  const download = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const str = new XMLSerializer().serializeToString(svg);
    const url = URL.createObjectURL(new Blob([str], { type: "image/svg+xml" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "my-mandala.svg" });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = async () => {
    setFilled({});
    if (mandalaId && api.isLoggedIn()) await api.updateMandala(mandalaId, {});
  };

  return (
    <div className="pt-16 min-h-screen page-enter" style={{ background: C.lavender }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontStyle: "italic", color: C.text }}>Mandala Coloring</h1>
          <p style={{ fontFamily: "DM Sans, sans-serif", color: C.muted, marginTop: 6 }}>
            Select a color below, then click any segment to fill it.
            {saveStatus === "saving" && <span style={{ color: C.muted, fontSize: 13, marginLeft: 8 }}>saving...</span>}
            {saveStatus === "saved" && <span style={{ color: "#5a9e7a", fontSize: 13, marginLeft: 8 }}>✓ saved</span>}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="rounded-full" style={{ padding: 20, boxShadow: "0 0 80px rgba(216,201,240,0.9), 0 0 160px rgba(197,223,247,0.35)" }}>
            <svg ref={svgRef} viewBox="0 0 420 420" width={380} height={380} style={{ background: C.cream, borderRadius: "50%", display: "block" }}>
              <circle cx={210} cy={210} r={19} fill={filled["center"] || C.cream} stroke={C.text} strokeWidth={0.7} strokeOpacity={0.22} className="cursor-pointer" onClick={() => paint("center")} style={{ transition: "fill 0.15s" }} />
              {MANDALA_SEGS.map(seg => (
                <path key={seg.key} d={seg.path} fill={filled[seg.key] || C.cream} stroke={C.text} strokeWidth={0.65} strokeOpacity={0.18}
                  className="cursor-pointer" onClick={() => paint(seg.key)} style={{ transition: "fill 0.15s", opacity: 1 }}
                  onMouseEnter={e => { (e.currentTarget as SVGPathElement).style.opacity = "0.75"; }}
                  onMouseLeave={e => { (e.currentTarget as SVGPathElement).style.opacity = "1"; }}
                />
              ))}
            </svg>
          </div>
        </div>

        <div className="rounded-[24px] p-6 mb-6" style={{ background: "rgba(255,255,255,0.45)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <p className="text-center mb-4" style={{ fontFamily: "Caveat, cursive", fontSize: 17, color: C.muted }}>pick a color</p>
          <div className="flex gap-3 flex-wrap justify-center">
            {SWATCH_COLORS.map(c => (
              <button key={c} onClick={() => setSelected(c)} className="rounded-full transition-all duration-200"
                style={{ width: 36, height: 36, background: c, transform: selected === c ? "scale(1.22)" : "scale(1)", boxShadow: selected === c ? `0 0 0 2px white, 0 0 0 4px ${C.text}` : "0 2px 8px rgba(0,0,0,0.14)" }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button onClick={download} className="px-6 py-3 rounded-[16px] text-sm font-medium transition-colors"
            style={{ fontFamily: "DM Sans, sans-serif", border: `2px solid rgba(61,52,80,0.3)`, color: C.text }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(61,52,80,0.6)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(61,52,80,0.3)"}>
            ↓ Download
          </button>
          <button onClick={reset} className="px-6 py-3 rounded-[16px] text-sm transition-colors"
            style={{ fontFamily: "DM Sans, sans-serif", color: C.muted }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.text}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.muted}>
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <footer style={{ background: C.lavender }}>
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontStyle: "italic", fontWeight: 700, color: C.text }}>PeaceOh</p>
          <p style={{ fontFamily: "Caveat, cursive", fontSize: 14, color: C.muted, marginTop: 2 }}>a gentle space, always here for you</p>
        </div>
        <div className="flex gap-6 flex-wrap justify-center">
          {[{ label: "Pop Bubbles", p: "bubbles" as Page }, { label: "Sand Drawing", p: "sand" as Page }, { label: "Letters", p: "letter-future" as Page }, { label: "Mandala", p: "mandala" as Page }].map(({ label, p }) => (
            <button key={p} onClick={() => setPage(p)} className="text-sm transition-colors"
              style={{ fontFamily: "DM Sans, sans-serif", color: C.muted }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.text}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.muted}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(!api.isLoggedIn());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const handleAuth = (email: string) => {
    setUserEmail(email);
    setShowAuth(false);
  };

  const handleLogout = () => {
    api.logout();
    setUserEmail(null);
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen" style={{ background: C.cream, fontFamily: "DM Sans, sans-serif" }}>
      <style>{INJECTED_CSS}</style>
      {showAuth && <AuthModal onAuth={handleAuth} />}
      <BubbleTrail active={page === "home"} />
      <Navbar page={page} setPage={setPage} userEmail={userEmail} onLogout={handleLogout} />
      <main>
        {page === "home" && <HomePage setPage={setPage} />}
        {page === "bubbles" && <PopBubblesPage />}
        {page === "sand" && <SandDrawingPage />}
        {page === "letter-future" && <LetterPage key="future" type="future" setPage={setPage} />}
        {page === "letter-self" && <LetterPage key="self" type="self" setPage={setPage} />}
        {page === "mandala" && <MandalaPage />}
      </main>
      <Footer setPage={setPage} />
    </div>
  );
}
