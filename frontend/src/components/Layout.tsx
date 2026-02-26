import { NavLink, Outlet } from "react-router-dom";
import {
  BookOpen,
  Upload,
  Layers,
  Brain,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", icon: BookOpen, label: "Dashboard" },
  { to: "/upload", icon: Upload, label: "Upload" },
  { to: "/flashcards", icon: Layers, label: "Flashcards" },
  { to: "/quiz", icon: Brain, label: "Quiz" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

export default function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-screen bg-surface text-text">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-light flex flex-col border-r border-surface-lighter">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-accent">📚 StudyMate</h1>
          <p className="text-sm text-text-muted mt-1">AI Study Companion</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-text-muted hover:bg-surface-lighter hover:text-text"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-surface-lighter">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted truncate">
              {user?.email ?? "Not signed in"}
            </span>
            {user && (
              <button
                onClick={signOut}
                className="text-text-muted hover:text-danger transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
