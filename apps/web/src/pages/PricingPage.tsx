import { Check, Zap, Sparkles, Shield, Server, ArrowRight } from "lucide-react";
import { api } from "../api/client";

export const PricingPage = ({ onNavigateHome }: { onNavigateHome: () => void }) => {
  const plans = [
    {
      name: "Anonymous Guest",
      price: "$0",
      period: "forever",
      description: "Quick instant checks without signing up or providing any credentials.",
      badge: "NO SIGN-UP REQUIRED",
      badgeColor: "rgba(100, 116, 139, 0.15)",
      badgeTextColor: "var(--text-muted)",
      features: [
        "5 Free Instant Verifications",
        "Full RFC 5322 Syntax Inspection",
        "Live MX & DNS Resolution",
        "SPF & DMARC Detection",
        "Disposable Domain Checks",
        "Real-time Verdict & Score",
      ],
      ctaText: "Start Verifying",
      ctaAction: onNavigateHome,
      ctaStyle: "btn btn-outline",
    },
    {
      name: "Authenticated Developer",
      price: "$0",
      period: "forever free",
      description: "Complete email deliverability platform for developers, marketers, and power users.",
      badge: "MOST POPULAR",
      badgeColor: "rgba(37, 99, 235, 0.15)",
      badgeTextColor: "var(--accent-blue)",
      highlight: true,
      features: [
        "Unlimited Single Verifications",
        "Bulk CSV / JSON Uploads (500/batch)",
        "5-Day Rolling Audit History",
        "Export Results to CSV / JSON",
        "REST API & Bearer Token Access",
        "30 req/min API Capacity",
        "1-Click Account Data Erasure",
      ],
      ctaText: "Sign in with Google",
      ctaLink: api.getGoogleLoginUrl(),
      ctaStyle: "btn btn-black",
    },
    {
      name: "Self-Hosted Cloudflare",
      price: "$0",
      period: "open source",
      description: "Deploy to your own Cloudflare account using Workers, D1, and KV with zero cloud bills.",
      badge: "OPEN SOURCE",
      badgeColor: "rgba(16, 185, 129, 0.15)",
      badgeTextColor: "var(--success)",
      features: [
        "100% Zero Recurring Bills",
        "100,000 requests/day on Cloudflare Free",
        "5 Million D1 reads/day",
        "1 GB KV storage",
        "Automated Daily Retention Cron",
        "Admin Console & User Management",
        "Full Source Code on GitHub",
      ],
      ctaText: "View GitHub Repository",
      ctaLink: "https://github.com/isacclobono/MailVerify",
      ctaStyle: "btn btn-outline",
    },
  ];

  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          <Sparkles size={14} /> 100% ZERO-COST ARCHITECTURE
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
          Zero Bills. Zero Tier Traps. 100% Free.
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "680px", margin: "0 auto", lineHeight: 1.6 }}>
          MailVerify runs entirely on Cloudflare's generous serverless free tiers and public DNS-over-HTTPS infrastructure. No credit card required.
        </p>
      </div>

      {/* Pricing Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "1.5rem", marginBottom: "4rem" }}>
        {plans.map((p, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: "2rem",
              position: "relative",
              border: p.highlight ? "2px solid var(--accent-blue)" : "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "inline-block", padding: "0.2rem 0.55rem", borderRadius: "4px", background: p.badgeColor, color: p.badgeTextColor, fontSize: "0.7rem", fontWeight: 700, marginBottom: "1rem" }}>
                {p.badge}
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.5rem" }}>{p.name}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, minHeight: "45px" }}>{p.description}</p>

              <div style={{ margin: "1.5rem 0" }}>
                <span style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>{p.price}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginLeft: "0.4rem" }}>/ {p.period}</span>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem", marginBottom: "2rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.75rem" }}>INCLUDED CAPABILITIES</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.88rem" }}>
                      <Check size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {p.ctaLink ? (
              <a href={p.ctaLink} className={p.ctaStyle} style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
                {p.ctaText}
              </a>
            ) : (
              <button className={p.ctaStyle} onClick={p.ctaAction} style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
                {p.ctaText}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Free Tier Guarantees Section */}
      <div className="card" style={{ padding: "2.5rem", background: "var(--bg-subtle)" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "1rem" }}>How Can MailVerify Be Completely Free?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          <div>
            <strong style={{ color: "var(--text-main)" }}>1. Cloudflare Workers Isolate Architecture</strong>
            <p style={{ marginTop: "0.25rem" }}>DNS queries resolve asynchronously in milliseconds, using under 10% of Cloudflare's free 100,000 req/day CPU allowance.</p>
          </div>
          <div>
            <strong style={{ color: "var(--text-main)" }}>2. 5-Day Auto Retention Purge</strong>
            <p style={{ marginTop: "0.25rem" }}>An automated midnight Cron Trigger purges records older than 5 days, keeping Cloudflare D1 storage well below the 500MB free quota.</p>
          </div>
          <div>
            <strong style={{ color: "var(--text-main)" }}>3. Edge KV Caching & DoH</strong>
            <p style={{ marginTop: "0.25rem" }}>Repeated domain MX queries are cached in KV with 24-hour TTL, eliminating redundant external DNS lookups entirely.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
