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
  currentView,
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
    return "US";
  };

  const handleMenuClick = (view: AppView) => {
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
            }}
          />
          Edge Online
        </div>
      </div>

      {/* Center/Right Nav Links & Profile Dropdown */}
      <nav className="nav-links" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        {/* Main top links */}
        <button
          className={`nav-link ${currentView === "dashboard" ? "active" : ""}`}
          onClick={() => onNavigate("dashboard")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
        >
          <LayoutDashboard size={14} /> Dashboard
        </button>

        <button
          className={`nav-link ${currentView === "home" ? "active" : ""}`}
          onClick={() => onNavigate("home")}
        >
          Single Verifier
        </button>

        <button
          className={`nav-link ${currentView === "dns-mx" ? "active" : ""}`}
          onClick={() => onNavigate("dns-mx")}
        >
          DNS/MX
        </button>

        <button
          className={`nav-link ${currentView === "spf-dmarc" ? "active" : ""}`}
          onClick={() => onNavigate("spf-dmarc")}
        >
          SPF/DMARC
        </button>

        <button
          className={`nav-link ${currentView === "docs" ? "active" : ""}`}
          onClick={() => onNavigate("docs")}
        >
          Docs
        </button>

        {user ? (
          <div style={{ position: "relative" }} ref={dropdownRef}>
            {/* Circular Profile Avatar Button */}
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.2rem",
                borderRadius: "9999px",
              }}
              title="Account & Menu"
              aria-expanded={profileOpen}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || user.email}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "2px solid #0f172a",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#0f172a",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    letterSpacing: "0.02em",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {getInitials(user.name, user.email)}
                </div>
              )}
              <ChevronDown
                size={14}
                style={{
                  color: "var(--text-muted)",
                  transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>

            {/* Profile Dropdown Popup (matching reference design) */}
            {profileOpen && (
              <div
                className="profile-dropdown-menu"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "260px",
                  background: "#ffffff",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 12px 30px -4px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.05)",
                  zIndex: 1000,
                  overflow: "hidden",
                  animation: "fadeIn 0.15s ease",
                }}
              >
                {/* User Info Header */}
                <div
                  style={{
                    padding: "1rem 1.25rem",
                    background: "var(--bg-subtle)",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.name || "Developer Account"}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "0.1rem" }}>
                    {user.email}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", marginTop: "0.5rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", fontSize: "0.7rem", fontWeight: 700 }}>
                    <Zap size={11} /> Free Tier · 200 Calls/Mo
                  </div>
                </div>

                {/* Dropdown Menu Items */}
                <div style={{ padding: "0.5rem 0" }}>
                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("dashboard")}
                  >
                    <LayoutDashboard size={15} /> Dashboard & History
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("dashboard")}
                  >
                    <Key size={15} /> API Keys Manager
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("home")}
                  >
                    <Search size={15} /> Single Email Verifier
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("dashboard")}
                  >
                    <Upload size={15} /> Bulk Batch Engine
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("dns-mx")}
                  >
                    <Server size={15} /> DNS & MX Checker
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("spf-dmarc")}
                  >
                    <Shield size={15} /> SPF & DMARC Audit
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("pricing")}
                  >
                    <CreditCard size={15} /> Plans & Quotas
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleMenuClick("docs")}
                  >
                    <BookOpen size={15} /> Developer Docs & FAQ
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
                <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "0.5rem 0" }}>
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
