import { Globe, CheckCircle2 } from "lucide-react";

export const InfrastructurePage = () => {
  const infraItems = [
    {
      title: "Cloudflare Workers",
      tag: "COMPUTE & RUNTIME",
      tagColor: "#2563eb",
      badge: "100,000 REQ/DAY FREE",
      description: "Serverless V8 isolate runtime executing globally in 280+ cities with 0ms cold starts.",
      details: [
        "Sub-10ms CPU execution time per email verification",
        "Asynchronous non-blocking DNS-over-HTTPS queries",
        "Built-in CORS, Rate Limiting, and Security Headers",
        "Native TypeScript with Hono ultra-fast routing engine",
      ],
      link: "https://workers.cloudflare.com",
    },
    {
      title: "Cloudflare D1 SQL",
      tag: "DATABASE STORAGE",
      tagColor: "#059669",
      badge: "5,000,000 READS/DAY FREE",
      description: "Distributed edge SQLite database for user accounts, session tokens, and verification logs.",
      details: [
        "Zero VPS / zero MySQL server maintenance required",
        "Automatic composite B-Tree indexes on emails & users",
        "Foreign key cascade deletions for 1-click GDPR compliance",
        "Daily automated Cron retention purge to stay within 500MB",
      ],
      link: "https://developers.cloudflare.com/d1/",
    },
    {
      title: "Cloudflare KV",
      tag: "GLOBAL EDGE CACHING",
      tagColor: "#d97706",
      badge: "100,000 READS/DAY FREE",
      description: "Ultra-low latency key-value store distributed across Cloudflare's global edge network.",
      details: [
        "24-hour TTL caching on domain MX and DNS resolutions",
        "Sub-5ms cache hits for common providers (Gmail, Outlook)",
        "Curated disposable domain database cache",
        "Eliminates redundant network roundtrips entirely",
      ],
      link: "https://developers.cloudflare.com/kv/",
    },
    {
      title: "DNS-over-HTTPS (DoH)",
      tag: "UNMETERED DNS ENGINE",
      tagColor: "#7c3aed",
      badge: "UNLIMITED & FREE",
      description: "Direct encrypted DNS resolution via Cloudflare's public 1.1.1.1 recursive resolver.",
      details: [
        "Direct JSON wire format DNS query execution",
        "Inspects MX, A, AAAA, SPF, and DMARC TXT records",
        "Bypasses ISP port 25 / 53 blocking and socket restrictions",
        "Zero paid third-party API dependencies",
      ],
      link: "https://cloudflare-dns.com",
    },
  ];

  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          <Globe size={14} /> CLOUDFLARE SERVERLESS DEEP-DIVE
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
          Zero-Cost Cloud Infrastructure
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "680px", margin: "0 auto", lineHeight: 1.6 }}>
          Explore the serverless architecture that powers MailVerify without VPS instances, third-party subscriptions, or recurring cloud bills.
        </p>
      </div>

      {/* Architecture Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "3.5rem" }}>
        {infraItems.map((item, idx) => (
          <div key={idx} className="card" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: item.tagColor, letterSpacing: "0.05em" }}>{item.tag}</span>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "var(--bg-subtle)", padding: "0.2rem 0.5rem", borderRadius: "4px", color: "var(--text-muted)" }}>{item.badge}</span>
              </div>

              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.5rem" }}>{item.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "1.25rem" }}>{item.description}</p>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem", marginBottom: "1.5rem" }}>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {item.details.map((d, dIdx) => (
                    <li key={dIdx} style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", fontSize: "0.84rem", color: "var(--text-main)" }}>
                      <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem" }}
            >
              Explore {item.title} Docs ↗
            </a>
          </div>
        ))}
      </div>

      {/* Live SLA & Bill Comparison */}
      <div className="card" style={{ padding: "2.5rem", background: "var(--bg-subtle)" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1rem" }}>Why Zero-Cost Architecture Wins</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.75rem" }}>FEATURE</th>
                <th style={{ padding: "0.75rem" }}>TRADITIONAL EMAIL VERIFIER</th>
                <th style={{ padding: "0.75rem", color: "var(--accent-blue)" }}>MAILVERIFY ON CLOUDFLARE</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.75rem", fontWeight: 600 }}>Monthly Hosting Cost</td>
                <td style={{ padding: "0.75rem", color: "var(--danger)" }}>$40 - $200 / month (VPS, Redis, RDS)</td>
                <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--success)" }}>$0.00 / month (100% Free Tier)</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.75rem", fontWeight: 600 }}>Global Edge Locations</td>
                <td style={{ padding: "0.75rem" }}>1 - 2 data center regions</td>
                <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--success)" }}>280+ cities worldwide</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.75rem", fontWeight: 600 }}>Cold Start Latency</td>
                <td style={{ padding: "0.75rem" }}>500ms - 2,000ms (Container cold start)</td>
                <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--success)" }}>&lt; 5ms (V8 Isolates)</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.75rem", fontWeight: 600 }}>Privacy & Retention</td>
                <td style={{ padding: "0.75rem" }}>Data hoarded indefinitely</td>
                <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--success)" }}>Automated 5-day purge cron</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
