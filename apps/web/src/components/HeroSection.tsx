import { ArrowRight, Sparkles, LogIn, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { User } from "../types";
import { api } from "../api/client";

interface HeroSectionProps {
  user: User | null;
  remainingChecks: number | null;
  onNavigateDashboard: () => void;
  onQuickSampleSelect: (email: string) => void;
}

export const HeroSection = ({
  user,
  remainingChecks,
  onNavigateDashboard,
  onQuickSampleSelect,
}: HeroSectionProps) => {
  const samples = [
    { email: "alex@gmail.com", label: "Consumer Inbox" },
    { email: "contact@stripe.com", label: "Corporate MX" },
    { email: "temp@tempmail.com", label: "Disposable Burner" },
    { email: "billing@gmial.com", label: "Typo Domain" },
  ];

  return (
    <section className="hero" style={{ maxWidth: "880px", margin: "0 auto", textAlign: "center", padding: "2.5rem 0 1.5rem" }}>
      {/* Top pill badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.25rem 0.75rem", borderRadius: "9999px", background: "rgba(37, 99, 235, 0.08)", border: "1px solid rgba(37, 99, 235, 0.2)", color: "var(--accent-blue)", fontSize: "0.75rem", fontWeight: 700, marginBottom: "1.25rem" }}>
        <Sparkles size={13} />
        <span>EDGE-POWERED SERVERLESS VERIFICATION · 9+ DIAGNOSTIC CHECKS</span>
      </div>

      {/* Main Headline */}
      <h1 className="hero-title" style={{ fontSize: "2.35rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#0f172a", marginBottom: "0.85rem", lineHeight: 1.15 }}>
        Verify Any Email in Real-Time. <br />
        <span style={{ color: "var(--accent-blue)" }}>Zero Bounce.</span> High Precision.
      </h1>

      {/* Subtitle */}
      <p className="hero-subtitle" style={{ fontSize: "0.92rem", color: "#475569", lineHeight: 1.6, maxWidth: "680px", margin: "0 auto 1.75rem" }}>
        Inspect RFC 5322 syntax, live DNS-over-HTTPS routing, MX availability, SPF/DMARC anti-spoofing policies, disposable burner databases, and typo suggestions with sub-100ms latency.
      </p>

      {/* Action Buttons & Quota Indicator */}
      <div className="hero-actions" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
        {user ? (
          <button className="btn btn-black" onClick={onNavigateDashboard} style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
            <span>Go to Dashboard</span> <ArrowRight size={15} />
          </button>
        ) : (
          <a href={api.getGoogleLoginUrl()} className="btn btn-black" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
            <LogIn size={15} /> <span>Sign in with Google</span>
          </a>
        )}

        <a href="#tester" className="btn btn-outline" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
          Test an Email Free
        </a>

        {!user && remainingChecks !== null && (
          <span className="quota-pill">
            <Zap size={13} />
            {remainingChecks > 0
              ? `${remainingChecks} of 5 Guest Checks Available`
              : "Guest Limit Reached · Sign in for 200 Free Calls"}
          </span>
        )}
      </div>

      {/* Quick Try Pills */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.45rem", flexWrap: "wrap", fontSize: "0.78rem", color: "var(--text-muted)" }}>
        <span style={{ fontWeight: 600 }}>Try sample:</span>
        {samples.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onQuickSampleSelect(s.email)}
            style={{
              background: "#ffffff",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-pill)",
              padding: "0.2rem 0.65rem",
              fontSize: "0.75rem",
              color: "var(--text-main)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-strong)";
              e.currentTarget.style.background = "var(--bg-subtle)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.background = "#ffffff";
            }}
            title={s.label}
          >
            <code>{s.email}</code>
          </button>
        ))}
      </div>

      {/* Trust Highlights */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <CheckCircle2 size={14} color="var(--success)" />
          <span>No Credit Card Required</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <CheckCircle2 size={14} color="var(--success)" />
          <span>200 Free API Calls / Month</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <ShieldCheck size={14} color="var(--accent-blue)" />
          <span>5-Day Automated Log Purge</span>
        </div>
      </div>
    </section>
  );
};
