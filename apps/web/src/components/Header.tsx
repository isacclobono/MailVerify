import { useState, useRef, useEffect } from "react";
import { User } from "../types";
import { api } from "../api/client";
import { 
  LogOut, 
  LayoutDashboard, 
  ShieldAlert, 
  Zap, 
  Key, 
  Search, 
  Upload, 
  Server, 
  Shield, 
  BookOpen, 
  CreditCard,
  ChevronDown
} from "lucide-react";

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
}: HeaderProps) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Compute initials (e.g. "SK" for Sunil Khobragade)
  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "SK";
  };

  const handleMenuClick = (view: AppView, tab?: string) => {
    try {
      const url = new URL(window.location.href);
      if (tab) {
        url.searchParams.set("tab", tab);
      } else {
        url.searchParams.delete("tab");
      }
      window.history.replaceState({}, "", url.pathname + url.search);
    } catch {
      // Ignore
    }
    onNavigate(view);
    setProfileOpen(false);
  };

  return (
    <header className="navbar">
      {/* Brand & Edge Status */}
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
              display: "inline-block",
            }}
          />
          <span>Edge Online</span>
        </div>
      </div>

      {/* Header Right Actions */}
      <nav className="nav-links">
        {user ? (
          <div style={{ position: "relative" }} ref={profileRef}>
            {/* Minimalist Circular Avatar Trigger */}
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: user.avatar_url ? `url(${user.avatar_url}) center/cover` : "#0f172a",
                border: "2px solid #e2e8f0",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.78rem",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                transition: "all 0.15s ease",
              }}
              title={user.name || user.email}
            >
              {!user.avatar_url && getInitials(user.name, user.email)}
            </button>

            {/* Profile Popover Menu */}
            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "240px",
                  background: "#ffffff",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 999,
                  overflow: "hidden",
                }}
              >
                {/* Popover Header */}
                <div
                  style={{
                    padding: "0.85rem 1rem",
                    background: "var(--bg-subtle)",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.name || "Developer Account"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "0.1rem" }}>
                    {user.email}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", marginTop: "0.35rem", padding: "0.12rem 0.45rem", borderRadius: "9999px", background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", fontSize: "0.68rem", fontWeight: 700 }}>
                    <Zap size={10} /> Free Plan · 200/mo
                  </div>
                </div>

                {/* Dropdown Menu Items */}
                <div style={{ padding: "0.35rem 0" }}>
                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("dashboard")}
                  >
                    <LayoutDashboard size={14} /> Dashboard Overview
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("dashboard", "keys")}
                  >
                    <Key size={14} /> API Keys & Quotas
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("home")}
                  >
                    <Search size={14} /> Single Email Verifier
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("dashboard", "bulk")}
                  >
                    <Upload size={14} /> Bulk Batch Engine
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("dns-mx")}
                  >
                    <Server size={14} /> DNS & MX Checker
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("spf-dmarc")}
                  >
                    <Shield size={14} /> SPF & DMARC Audit
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("pricing")}
                  >
                    <CreditCard size={14} /> Plans & Quotas
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("docs")}
                  >
                    <BookOpen size={14} /> Developer Docs & FAQ
                  </button>

                  {user.is_admin && (
                    <button
                      className="dropdown-item"
                      onClick={() => handleMenuClick("admin")}
                      style={{ color: "#d97706", fontWeight: 700 }}
                    >
                      <ShieldAlert size={15} /> Admin Operations
                    </button>
                  )}
                </div>

                {/* Log Out Button */}
                <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "0.4rem 0" }}>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                    style={{ color: "var(--danger)", fontWeight: 600 }}
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
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
