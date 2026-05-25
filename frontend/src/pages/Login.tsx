import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) await signUp(email, password);
      else await signIn(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const label: React.CSSProperties = {
    display: "block", fontSize: 12, color: "#8a8280", marginBottom: 8,
    letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600,
    fontFamily: "'Geist', sans-serif",
  };

  const input: React.CSSProperties = {
    width: "100%", background: "#1c1b1b", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, padding: "12px 16px", color: "#e5e2e1", fontSize: 14,
    fontFamily: "'Geist', sans-serif", outline: "none", transition: "border 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e0e", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, color: "#e5e2e1", fontWeight: 700 }}>
            Study<span style={{ fontStyle: "italic", color: "#c9a96e" }}>Mate</span>
          </h1>
          <p style={{ color: "#8a8280", marginTop: 8, fontSize: 14, letterSpacing: "0.05em" }}>
            AI-powered study companion
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, textAlign: "center", color: "#e5e2e1", marginBottom: 32 }}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>

          {error && (
            <p style={{ fontSize: 13, color: "#ffb4ab", background: "rgba(255,180,171,0.1)", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
              {error}
            </p>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={label}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={input} placeholder="you@email.com"
              onFocus={(e) => e.currentTarget.style.borderColor = "#c9a96e"}
              onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={label}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={input} placeholder="Min. 6 characters"
              onFocus={(e) => e.currentTarget.style.borderColor = "#c9a96e"}
              onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", background: "#c9a96e", color: "#131313", fontWeight: 600,
            fontSize: 13, padding: "13px 0", borderRadius: 8, border: "none", cursor: "pointer",
            letterSpacing: "0.05em", fontFamily: "'Geist', sans-serif",
            opacity: loading ? 0.5 : 1, transition: "opacity 0.2s",
          }}>
            {loading ? "Please wait..." : isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
          </button>

          <p style={{ fontSize: 14, textAlign: "center", color: "#8a8280", marginTop: 24 }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              style={{ background: "none", border: "none", color: "#c9a96e", cursor: "pointer", fontSize: 14, fontFamily: "'Geist', sans-serif" }}>
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </form>

        <div style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#5c4037", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
            A project by{" "}
            <a href="https://lokoslevente.com" target="_blank" rel="noopener noreferrer" style={{ color: "#c9a96e", textDecoration: "none" }}>
              Levente Lokos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
