import { User } from "../types";
import { api } from "../api/client";
import { LogOut, LayoutDashboard, ShieldCheck, Github, ShieldAlert, Zap } from "lucide-react";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
  currentView: "home" | "dashboard";
}

export const Header = ({
  user,
  onLogout,
  onNavigateHome,
  onNavigateDashboard,
  currentView,
}: HeaderProps) => {
  return (
    <header className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <div className="brand" onClick={onNavigateHome} style={{ cursor: "pointer" }}>
          <span className="brand-bold">Mail</span>
          <span className="brand-light">Verify</span>
        </div>

        {/* Cloudflare Edge Status Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.72rem",
            padding: "0.2rem 0.55rem",
            borderRadius: "9999px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            color: "#34d399",
            fontWeight: 500,
          }}
          title="Connected to Cloudflare Global Edge Network"
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              boxShadow: "0 0 6px #10b981",
            }}
          />
          Edge Online
        </div>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-link ${currentView === "home" ? "active" : ""}`}
          onClick={onNavigateHome}
        >
          API
        </button>

        <a
          href="https://github.com/isacclobono/MailVerify"
          target="_blank"
          rel="noreferrer"
          className="nav-link"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
        >
          <Github size={15} /> GitHub
        </a>

        {user ? (
          <>
            {user.is_admin && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontSize: "0.72rem",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(245, 158, 11, 0.15)",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  color: "#fbbf24",
                  fontWeight: 600,
                }}
              >
                <ShieldAlert size={13} /> ADMIN
              </span>
            )}

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
                  style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid var(--border-color)" }}
                />
              ) : (
                <ShieldCheck size={18} color="var(--primary)" />
              )}
            </div>

            <button className="btn btn-outline" onClick={onLogout} title="Log out">
              <LogOut size={14} />
            </button>
          </>
        ) : (
          <a href={api.getGoogleLoginUrl()} className="btn btn-black" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <Zap size={14} /> Sign in with Google
          </a>
        )}
      </nav>
    </header>
  );
};
