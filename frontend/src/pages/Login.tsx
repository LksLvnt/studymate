import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [lastMethod, setLastMethod] = useState<string | null>(null);

useEffect(() => {
  setLastMethod(localStorage.getItem("studymate_last_login"));
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) await signUp(email, password);
      else await signIn(email, password);
      localStorage.setItem("studymate_last_login", "email");
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
            {!isSignUp && lastMethod === "email" && !loading && (
              <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 6 }}>• last used</span>
            )}
          </button>

          <p style={{ fontSize: 14, textAlign: "center", color: "#8a8280", marginTop: 24 }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              style={{ background: "none", border: "none", color: "#c9a96e", cursor: "pointer", fontSize: 14, fontFamily: "'Geist', sans-serif" }}>
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: 12, color: "#5c4037", letterSpacing: "0.1em" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>

          <button
            type="button"
            onClick={async () => {
              localStorage.setItem("studymate_last_login", "google");
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: window.location.href.replace(window.location.hash, ""),
                },
              });
            }}
            style={{
              width: "100%", background: "#1c1b1b", color: "#e5e2e1", fontWeight: 500,
              fontSize: 14, padding: "13px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer", fontFamily: "'Geist', sans-serif", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 10, transition: "border 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#c9a96e"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
            {lastMethod === "google" && (
              <span style={{ fontSize: 10, color: "#5c4037", marginLeft: 4 }}>• last used</span>
            )}
          </button>
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
