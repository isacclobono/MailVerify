import { User } from "../types";
import { api } from "../api/client";
import { LogOut, LayoutDashboard, ShieldCheck, ShieldAlert, Zap, BookOpen, Tag, Server, Shield } from "lucide-react";

export type AppView =
  | "home"
  | "dashboard"
  | "docs"
  | "pricing"
  | "privacy"
  | "admin"
  | "dns-mx"
  | "spf-dmarc"
  | "infra"
  | "account-quotas";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
  currentView: AppView;
}

export const Header = ({
  user,
  onLogout,
  onNavigate,
  currentView,
}: HeaderProps) => {
  return (
    <header className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <div className="brand" onClick={() => onNavigate("home")} style={{ cursor: "pointer" }}>
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
            cursor: "pointer",
          }}
          onClick={() => onNavigate("infra")}
          title="Click to view Cloudflare Edge Network status"
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
          onClick={() => onNavigate("home")}
        >
          Single
        </button>

        <button
          className={`nav-link ${currentView === "dns-mx" ? "active" : ""}`}
          onClick={() => onNavigate("dns-mx")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
        >
          <Server size={14} /> DNS/MX
        </button>

        <button
          className={`nav-link ${currentView === "spf-dmarc" ? "active" : ""}`}
          onClick={() => onNavigate("spf-dmarc")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
        >
          <Shield size={14} /> SPF/DMARC
        </button>

        <button
          className={`nav-link ${currentView === "docs" ? "active" : ""}`}
          onClick={() => onNavigate("docs")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
        >
          <BookOpen size={14} /> Docs
        </button>

        <button
          className={`nav-link ${currentView === "pricing" ? "active" : ""}`}
          onClick={() => onNavigate("pricing")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
        >
          <Tag size={14} /> Free Tier
        </button>

        <a
          href="https://github.com/isacclobono/MailVerify"
          target="_blank"
          rel="noreferrer"
          className="nav-link"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          GitHub
        </a>

        {user ? (
          <>
            {user.is_admin ? (
              <button
                className={`btn ${currentView === "admin" ? "btn-black" : "btn-outline"}`}
                onClick={() => onNavigate("admin")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  borderColor: "rgba(245, 158, 11, 0.4)",
                  color: currentView === "admin" ? "#fff" : "#d97706",
                }}
              >
                <ShieldAlert size={14} /> Admin Console
              </button>
            ) : (
              <button
                className="nav-link"
                onClick={() => onNavigate("admin")}
                style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                title="Admin Access Portal"
              >
                Admin
              </button>
            )}

            <button
              className={`btn ${currentView === "dashboard" ? "btn-black" : "btn-outline"}`}
              onClick={() => onNavigate("dashboard")}
            >
              <LayoutDashboard size={14} /> Dashboard
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || user.email}
                  style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid var(--border-subtle)" }}
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              className="nav-link"
              onClick={() => onNavigate("admin")}
              style={{ fontSize: "0.85rem" }}
            >
              Admin Portal
            </button>
            <a href={api.getGoogleLoginUrl()} className="btn btn-black" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Zap size={14} /> Sign in with Google
            </a>
          </div>
        )}
      </nav>
    </header>
  );
};
