import { User } from "../types";
import { api } from "../api/client";
import { LogOut, LayoutDashboard, ShieldAlert, Zap } from "lucide-react";

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
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
          title="Edge Network Online (Click for Cloudflare Status)"
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

      <nav className="nav-links" style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        {user ? (
          <>
            {user.is_admin && (
              <button
                className={`btn ${currentView === "admin" ? "btn-black" : "btn-outline"}`}
                onClick={() => onNavigate("admin")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  borderColor: "rgba(245, 158, 11, 0.4)",
                  color: currentView === "admin" ? "#fff" : "#d97706",
                  padding: "0.45rem 0.8rem",
                  fontSize: "0.85rem",
                }}
              >
                <ShieldAlert size={14} /> <span className="hide-mobile">Admin</span>
              </button>
            )}

            <button
              className={`btn ${currentView === "dashboard" ? "btn-black" : "btn-outline"}`}
              onClick={() => onNavigate("dashboard")}
              style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem" }}
            >
              <LayoutDashboard size={14} /> <span className="hide-mobile">Dashboard</span>
            </button>

            {user.avatar_url && (
              <img
                src={user.avatar_url}
                alt={user.name || user.email}
                style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid var(--border-subtle)" }}
              />
            )}

            <button className="btn btn-outline" onClick={onLogout} title="Log out" style={{ padding: "0.45rem" }}>
              <LogOut size={14} />
            </button>
          </>
        ) : (
          <a
            href={api.getGoogleLoginUrl()}
            className="btn btn-black"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.45rem 0.9rem", fontSize: "0.85rem" }}
          >
            <Zap size={14} /> <span>Sign in with Google</span>
          </a>
        )}
      </nav>
    </header>
  );
};
