import { Check, Sparkles } from "lucide-react";
import { api } from "../api/client";
import { FaqSection } from "../components/FaqSection";

export const PricingPage = ({ onNavigateHome }: { onNavigateHome: () => void }) => {
  const plans = [
    {
      name: "Guest Visitor",
      price: "$0",
      period: "no account",
      description: "Quick single email checks without signing up or generating an API key.",
      badge: "INSTANT ACCESS",
      badgeColor: "rgba(100, 116, 139, 0.15)",
      badgeTextColor: "var(--text-muted)",
      features: [
        "5 Free Instant Verifications",
        "Full RFC 5322 Syntax Inspection",
        "Live MX & DNS Resolution",
        "SPF & DMARC Detection",
        "Disposable Domain Checks",
        "Real-time Deliverability Score",
      ],
      ctaText: "Start Verifying",
      ctaAction: onNavigateHome,
      ctaStyle: "btn btn-outline",
    },
    {
      name: "Developer Free Tier",
      price: "$0",
      period: "forever free",
      description: "Dedicated API keys and generous monthly quota for developers and startups.",
      badge: "200 API CALLS / MO",
      badgeColor: "rgba(37, 99, 235, 0.15)",
      badgeTextColor: "var(--accent-blue)",
      highlight: true,
      features: [
        "200 API Calls Every Month",
        "Instant Private API Key Generation",
        "X-API-Key & Bearer Authorization",
        "Bulk CSV / JSON Uploads",
        "5-Day Rolling Audit Log History",
        "Export Results to CSV & JSON",
        "1-Click Account & Key Revocation",
      ],
      ctaText: "Sign in with Google",
      ctaLink: api.getGoogleLoginUrl(),
      ctaStyle: "btn btn-black",
    },
    {
      name: "Enterprise Volume",
      price: "Custom",
      period: "custom limits",
      description: "High-throughput email verification pipelines for high-volume enterprise senders.",
      badge: "CUSTOM SLA",
      badgeColor: "rgba(16, 185, 129, 0.15)",
      badgeTextColor: "var(--success)",
      features: [
        "100,000+ API Calls / Month",
        "Sub-20ms Global Response Times",
        "Multiple Team API Keys",
        "Dedicated Rate Limiting Pools",
        "Direct DoH Multi-Resolver Pipeline",
        "Priority Technical Support",
        "Custom Compliance Agreements",
      ],
      ctaText: "Contact Sales",
      ctaLink: "mailto:sales@mailverify.internal",
      ctaStyle: "btn btn-outline",
    },
  ];

  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          <Sparkles size={14} /> FLEXIBLE QUOTAS & API KEYS
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
          Simple, Transparent API Plans
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "680px", margin: "0 auto", lineHeight: 1.6 }}>
          Get 200 free API calls every month with private API keys, high-speed DNS-over-HTTPS resolution, and zero credit card requirements.
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
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.75rem" }}>PLAN INCLUDES</div>
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

      {/* Dynamic Accordion FAQ Section */}
      <FaqSection pageCategory="pricing" title="Pricing & Quotas FAQ" eyebrow="QUOTA & PRICING FAQ" />
    </div>
  );
};
