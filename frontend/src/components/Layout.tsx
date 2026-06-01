import { NavLink, Outlet } from "react-router-dom";
import { BookOpen, Upload, Layers, Brain, BarChart3, LogOut, FileText, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close menu on navigation
  const handleNavClick = () => {
    if (isMobile) setMenuOpen(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#131313", color: "#e5e2e1" }}>
      {/* Mobile header bar */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 56, zIndex: 40,
          background: "#0e0e0e", borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px",
        }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#e5e2e1",
          }}>
            StudyMate
          </h1>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            background: "none", border: "none", cursor: "pointer", color: "#8a8280", padding: 4,
          }}>
            {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      )}

      {/* Overlay */}
      {isMobile && menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 45,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: isMobile ? 280 : 280,
        background: "#0e0e0e",
        display: "flex",
        flexDirection: "column" as const,
        borderRight: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
        ...(isMobile ? {
          position: "fixed" as const,
          top: 0,
          left: menuOpen ? 0 : -280,
          bottom: 0,
          zIndex: 50,
          transition: "left 0.25s ease",
        } : {}),
      }}>
        <div style={{ padding: isMobile ? "24px 24px 20px" : "40px 32px 32px" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#e5e2e1",
          }}>
            StudyMate
          </h1>
          <p style={{
            fontFamily: "'Geist', sans-serif", fontSize: 11, color: "#8a8280",
            marginTop: 6, letterSpacing: "0.1em", textTransform: "uppercase" as const, fontWeight: 600,
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
              onClick={handleNavClick}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 20px", borderRadius: 8, fontSize: 14,
                fontFamily: "'Geist', sans-serif", fontWeight: 500,
                letterSpacing: "0.02em", textDecoration: "none",
                transition: "all 0.2s", marginBottom: 2,
                color: isActive ? "#c9a96e" : "#8a8280",
                background: isActive ? "rgba(201,169,110,0.08)" : "transparent",
              })}
            >
              <Icon size={18} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{
          padding: "20px 24px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: 12, color: "#8a8280", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: 180,
          }}>
            {user?.email ?? "Not signed in"}
          </span>
          {user && (
            <button onClick={signOut} style={{
              background: "none", border: "none", cursor: "pointer", color: "#8a8280", padding: 4,
            }}>
              <LogOut size={15} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{
        flex: 1, overflowY: "auto" as const, background: "#131313",
        ...(isMobile ? { paddingTop: 56 } : {}),
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: isMobile ? "24px 16px" : "56px 48px",
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}