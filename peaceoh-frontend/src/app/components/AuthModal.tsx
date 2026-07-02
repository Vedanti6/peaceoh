import { useState } from "react";
import { login, register } from "../api";

const C = {
  text: "#3D3450",
  muted: "#8A7FA0",
  cream: "#FAF7F2",
  blush: "#F7C5C5",
  lavender: "#D8C9F0",
  sky: "#C5DFF7",
};

interface Props {
  onSuccess: (email: string) => void;
  onClose: () => void;
}

export function AuthModal({ onSuccess, onClose }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in both fields."); return; }
    setLoading(true);
    try {
      const fn = mode === "login" ? login : register;
      const data = await fn(email, password);
      onSuccess(data.user.email);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center px-4"
      style={{ background: "rgba(61,52,80,0.35)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-[28px] p-8"
        style={{ background: C.cream, boxShadow: "0 24px 80px rgba(61,52,80,0.22)" }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontStyle: "italic", fontWeight: 700, color: C.text }}>
            {mode === "login" ? "Welcome back" : "Join PeaceOh"}
          </p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: C.muted, marginTop: 4 }}>
            {mode === "login" ? "Sign in to save your progress." : "Create a free account to save everything."}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex rounded-full mb-6 p-1" style={{ background: C.lavender }}>
          {(["login", "register"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className="flex-1 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                fontFamily: "DM Sans, sans-serif",
                background: mode === m ? "white" : "transparent",
                color: C.text,
                boxShadow: mode === m ? "0 2px 8px rgba(61,52,80,0.12)" : "none",
              }}
            >
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3 mb-4">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            className="w-full px-4 py-3 rounded-[14px] outline-none"
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 15,
              border: "1.5px solid rgba(216,201,240,0.7)",
              background: "white",
              color: C.text,
            }}
          />
          <input
            type="password"
            placeholder="password (min 6 chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            className="w-full px-4 py-3 rounded-[14px] outline-none"
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 15,
              border: "1.5px solid rgba(216,201,240,0.7)",
              background: "white",
              color: C.text,
            }}
          />
        </div>

        {error && (
          <p className="text-center mb-3" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#e57373" }}>
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 rounded-[14px] font-medium transition-all duration-200"
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 15,
            background: loading ? C.lavender : C.blush,
            color: C.text,
            boxShadow: "0 4px 16px rgba(247,197,197,0.45)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-sm"
          style={{ fontFamily: "DM Sans, sans-serif", color: C.muted }}
        >
          maybe later
        </button>
      </div>
    </div>
  );
}
