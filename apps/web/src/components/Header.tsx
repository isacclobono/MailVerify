import { User } from "../types";
import { api } from "../api/client";
import { LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
  currentView: "home" | "dashboard";
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onNavigateHome,
  onNavigateDashboard,
  currentView,
}) => {
  return (
    <header className="navbar">
      <div className="brand" onClick={onNavigateHome} style={{ cursor: "pointer" }}>
        <span className="brand-bold">Mail</span>
        <span className="brand-light">Verify</span>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-link ${currentView === "home" ? "active" : ""}`}
          onClick={onNavigateHome}
        >
          API
        </button>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="nav-link"
        >
          Docs
        </a>

        {user ? (
          <>
            <button
              className={`btn ${currentView === "dashboard" ? "btn-black" : "btn-outline"}`}
              onClick={onNavigateDashboard}
            >
              <LayoutDashboard size={14} /> Dashboard
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || user.email}
                  style={{ width: "28px", height: "28px", borderRadius: "50%" }}
                />
              ) : (
                <ShieldCheck size={18} />
              )}
            </div>
            <button className="btn btn-outline" onClick={onLogout} title="Log out">
              <LogOut size={14} />
            </button>
          </>
        ) : (
          <a href={api.getGoogleLoginUrl()} className="btn btn-black">
            Sign in with Google
          </a>
        )}
      </nav>
    </header>
  );
};
