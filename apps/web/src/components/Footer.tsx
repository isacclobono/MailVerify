import { AppView } from "./Header";
import { api } from "../api/client";
import { Shield, Zap, Sparkles } from "lucide-react";

interface FooterProps {
  onNavigate?: (view: AppView) => void;
}

export const Footer = ({ onNavigate }: FooterProps) => {
  const handleNav = (view: AppView, tab?: string) => {
    if (onNavigate) {
      if (tab) {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set("tab", tab);
          window.history.replaceState({}, "", url.pathname + url.search);
        } catch {
          // ignore
        }
      }
      onNavigate(view);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Col 1: Brand & Overview */}
          <div className="footer-brand-col">
            <div className="brand" onClick={() => handleNav("home")} style={{ cursor: "pointer", marginBottom: "0.75rem" }}>
              <span className="brand-bold">Mail</span>
              <span className="brand-light">Verify</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.55, maxWidth: "280px", marginBottom: "1rem" }}>
              High-precision email deliverability and domain security audit platform built on Cloudflare Workers & D1.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.25rem 0.65rem", borderRadius: "9999px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", color: "#059669", fontSize: "0.72rem", fontWeight: 600 }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              Global Edge Network Online
            </div>
          </div>

          {/* Col 2: Products & Tools */}
          <div className="footer-col">
            <h4>Products & Tools</h4>
            <ul>
              <li>
                <button type="button" onClick={() => handleNav("home")} className="footer-link-btn">
                  Single Email Verifier
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav("dashboard", "bulk")} className="footer-link-btn">
                  Bulk Batch Engine (CSV/TXT)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav("dns-mx")} className="footer-link-btn">
                  DNS & MX Record Checker
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav("spf-dmarc")} className="footer-link-btn">
                  SPF & DMARC Security Audit
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: API & Documentation */}
          <div className="footer-col">
            <h4>API & Developer Docs</h4>
            <ul>
              <li>
                <button type="button" onClick={() => handleNav("docs")} className="footer-link-btn">
                  REST API Specification
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav("dashboard", "keys")} className="footer-link-btn">
                  API Key Manager
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav("pricing")} className="footer-link-btn">
                  Plans & 200 Monthly Quotas
                </button>
              </li>
              <li>
                <a href={api.getGoogleLoginUrl()} className="footer-link-btn">
                  Developer Sign In
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Privacy & Governance */}
          <div className="footer-col">
            <h4>Privacy & Governance</h4>
            <ul>
              <li>
                <button type="button" onClick={() => handleNav("privacy")} className="footer-link-btn">
                  5-Day Automated Log Purge
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav("privacy")} className="footer-link-btn">
                  Zero Data Hoarding Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav("privacy")} className="footer-link-btn">
                  GDPR & Privacy Compliance
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav("account-quotas")} className="footer-link-btn">
                  Account Tiers & Limits
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="footer-bottom">
          <div className="footer-badges">
            <span className="footer-badge">
              <Shield size={11} /> GDPR COMPLIANT
            </span>
            <span className="footer-badge">
              <Sparkles size={11} /> 5-DAY RETENTION PURGE
            </span>
            <span className="footer-badge">
              <Zap size={11} /> 200 CALLS/MO FREE
            </span>
          </div>

          <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
            MailVerify © {new Date().getFullYear()} · High-Precision Email Validation Platform
          </div>
        </div>
      </div>
    </footer>
  );
};
