import { NavLink, Outlet } from "react-router-dom";
import { BookOpen, Upload, Layers, Brain, BarChart3, LogOut, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", icon: BookOpen, label: "Dashboard" },
  { to: "/upload", icon: Upload, label: "Upload" },
  { to: "/guides", icon: FileText, label: "Study Guides" },
  { to: "/flashcards", icon: Layers, label: "Flashcards" },
  { to: "/quiz", icon: Brain, label: "Quiz" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

export default function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div style={{ display: "flex", height: "100vh", background: "#131313", color: "#e5e2e1" }}>
      {/* Sidebar */}
      <aside style={{
        width: 280,
        background: "#0e0e0e",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}>
        <div style={{ padding: "40px 32px 32px" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#e5e2e1",
          }}>
            StudyMate
          </h1>
          <p style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: 11,
            color: "#8a8280",
            marginTop: 6,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}>
            AI Study Companion
          </p>
        </div>

        <nav style={{ flex: 1, padding: "0 16px" }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 20px",
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "'Geist', sans-serif",
                fontWeight: 500,
                letterSpacing: "0.02em",
                textDecoration: "none",
                transition: "all 0.2s",
                color: isActive ? "#c9a96e" : "#8a8280",
                background: isActive ? "rgba(201,169,110,0.08)" : "transparent",
                marginBottom: 2,
              })}
            >
              <Icon size={18} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{
          padding: "20px 32px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 12, color: "#8a8280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
            {user?.email ?? "Not signed in"}
          </span>
          {user && (
            <button onClick={signOut} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a8280", padding: 4 }}>
              <LogOut size={15} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto", background: "#131313" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 48px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
