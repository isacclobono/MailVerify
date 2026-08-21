import { useState, useEffect } from "react";
import { CodeSnippet } from "../components/CodeSnippet";
import { BookOpen, Layers } from "lucide-react";

type DocsSection = "quickstart" | "verify" | "pipeline" | "bulk" | "auth" | "verdicts" | "errors";

export const DocsPage = () => {
  const getInitialSection = (): DocsSection => {
    try {
      const params = new URLSearchParams(window.location.search);
      const s = (params.get("section") || params.get("tab")) as DocsSection;
      const valid: DocsSection[] = ["quickstart", "verify", "pipeline", "bulk", "auth", "verdicts", "errors"];
      return valid.includes(s) ? s : "quickstart";
    } catch {
      return "quickstart";
    }
  };

  const [activeSection, setActiveSectionState] = useState<DocsSection>(getInitialSection);

  const setActiveSection = (section: DocsSection) => {
    setActiveSectionState(section);
    try {
      const url = new URL(window.location.href);
      if (section === "quickstart") {
        url.searchParams.delete("section");
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("section", section);
      }
      window.history.replaceState({}, "", url.pathname + url.search);
    } catch {
      // Ignore error
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveSectionState(getInitialSection());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", width: "100%" }}>
      {/* Docs Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          <BookOpen size={14} /> REST API SPECIFICATION
        </div>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}>MailVerify Developer Documentation</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: "700px" }}>
          Integrate high-precision email validation, sub-pipeline checks, MX resolution, SPF/DMARC audits, and disposable detection into your applications.
        </p>
      </div>

      {/* Docs Layout */}
      <div className="docs-container-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2.5rem" }}>
        {/* Sidebar Nav */}
        <div className="docs-sidebar" style={{ borderRight: "1px solid var(--border-subtle)", paddingRight: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            GETTING STARTED
          </div>
          <button
            style={{ display: "block", width: "100%", textAlign: "left", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", border: "none", background: activeSection === "quickstart" ? "var(--bg-subtle)" : "transparent", color: activeSection === "quickstart" ? "var(--accent-blue)" : "var(--text-main)", fontWeight: activeSection === "quickstart" ? 700 : 500, cursor: "pointer", fontSize: "0.9rem", marginBottom: "0.25rem" }}
            onClick={() => setActiveSection("quickstart")}
          >
            Quick Start & cURL
          </button>
          <button
            style={{ display: "block", width: "100%", textAlign: "left", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", border: "none", background: activeSection === "verify" ? "var(--bg-subtle)" : "transparent", color: activeSection === "verify" ? "var(--accent-blue)" : "var(--text-main)", fontWeight: activeSection === "verify" ? 700 : 500, cursor: "pointer", fontSize: "0.9rem", marginBottom: "0.25rem" }}
            onClick={() => setActiveSection("verify")}
          >
            POST /api/verify
          </button>
          <button
            style={{ display: "block", width: "100%", textAlign: "left", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", border: "none", background: activeSection === "pipeline" ? "var(--bg-subtle)" : "transparent", color: activeSection === "pipeline" ? "var(--accent-blue)" : "var(--text-main)", fontWeight: activeSection === "pipeline" ? 700 : 500, cursor: "pointer", fontSize: "0.9rem", marginBottom: "0.25rem" }}
            onClick={() => setActiveSection("pipeline")}
          >
            <Layers size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.35rem" }} />
            Sub-Pipeline Checks
          </button>
          <button
            style={{ display: "block", width: "100%", textAlign: "left", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", border: "none", background: activeSection === "bulk" ? "var(--bg-subtle)" : "transparent", color: activeSection === "bulk" ? "var(--accent-blue)" : "var(--text-main)", fontWeight: activeSection === "bulk" ? 700 : 500, cursor: "pointer", fontSize: "0.9rem", marginBottom: "0.25rem" }}
            onClick={() => setActiveSection("bulk")}
          >
            POST /api/bulk
          </button>

          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", margin: "1.5rem 0 0.75rem" }}>
            AUTHENTICATION & CODES
          </div>
          <button
            style={{ display: "block", width: "100%", textAlign: "left", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", border: "none", background: activeSection === "auth" ? "var(--bg-subtle)" : "transparent", color: activeSection === "auth" ? "var(--accent-blue)" : "var(--text-main)", fontWeight: activeSection === "auth" ? 700 : 500, cursor: "pointer", fontSize: "0.9rem", marginBottom: "0.25rem" }}
            onClick={() => setActiveSection("auth")}
          >
            API Keys & Quotas
          </button>
          <button
            style={{ display: "block", width: "100%", textAlign: "left", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", border: "none", background: activeSection === "verdicts" ? "var(--bg-subtle)" : "transparent", color: activeSection === "verdicts" ? "var(--accent-blue)" : "var(--text-main)", fontWeight: activeSection === "verdicts" ? 700 : 500, cursor: "pointer", fontSize: "0.9rem", marginBottom: "0.25rem" }}
            onClick={() => setActiveSection("verdicts")}
          >
            Verdicts & Scoring
          </button>
          <button
            style={{ display: "block", width: "100%", textAlign: "left", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", border: "none", background: activeSection === "errors" ? "var(--bg-subtle)" : "transparent", color: activeSection === "errors" ? "var(--accent-blue)" : "var(--text-main)", fontWeight: activeSection === "errors" ? 700 : 500, cursor: "pointer", fontSize: "0.9rem", marginBottom: "0.25rem" }}
            onClick={() => setActiveSection("errors")}
          >
            Status Codes & Limits
          </button>
        </div>

        {/* Content Area */}
        <div>
          {activeSection === "quickstart" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>Quick Start Guide</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                All endpoints operate over HTTPS with JSON request/response formats. Anonymous visitors receive 5 free checks per IP; registered developers receive 200 free checks per month with full API keys.
              </p>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Live API Base URL</h3>
              <div style={{ background: "var(--bg-subtle)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", fontFamily: "var(--font-mono)", fontSize: "0.9rem", marginBottom: "1.5rem", border: "1px solid var(--border-subtle)" }}>
                https://mailverify.pulsechat.workers.dev
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Interactive Code Examples</h3>
              <CodeSnippet emailSample="contact@yourcompany.com" />
            </div>
          )}

          {activeSection === "verify" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>Full Verification Endpoint</h2>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(37,99,235,0.1)", color: "var(--accent-blue)", padding: "0.25rem 0.6rem", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                POST /api/verify or GET /api/verify?email=...
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Request Payload</h3>
              <pre style={{ background: "#0f172a", color: "#f8fafc", padding: "1rem", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontFamily: "var(--font-mono)", marginBottom: "1.5rem" }}>
{`{
  "email": "user@domain.com"
}`}
              </pre>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Complete Intelligence Response</h3>
              <pre style={{ background: "#0f172a", color: "#38bdf8", padding: "1rem", borderRadius: "var(--radius-md)", fontSize: "0.82rem", fontFamily: "var(--font-mono)", overflowX: "auto" }}>
{`{
  "success": true,
  "data": {
    "email": "user@domain.com",
    "normalized_email": "user@domain.com",
    "verdict": "LIKELY_DELIVERABLE",
    "score": 10,
    "confidence": 0.98,
    "is_free_provider": false,
    "did_you_mean": null,
    "reasons": [
      "REASON_BUSINESS_CORPORATE_DOMAIN",
      "REASON_DOMAIN_ACTIVE",
      "REASON_MX_SERVERS_CONFIGURED",
      "REASON_SPF_POLICY_VALID",
      "REASON_DMARC_POLICY_ENFORCED"
    ],
    "checks": {
      "syntax": "PASS",
      "domain": "DOMAIN_EXISTS",
      "mx": "MX_FOUND",
      "spf": "SPF_PRESENT",
      "dmarc": "DMARC_PRESENT",
      "disposable": "NOT_DISPOSABLE",
      "role": "PERSONAL_ACCOUNT_LIKELY",
      "catch_all": "UNKNOWN",
      "smtp": "UNKNOWN",
      "free_provider": "BUSINESS_CORPORATE"
    },
    "created_at": "2026-08-21T13:25:00.000Z"
  }
}`}
              </pre>
            </div>
          )}

          {activeSection === "pipeline" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Dedicated Sub-Pipeline Endpoints</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Execute specific verification stages independently without running the full pipeline.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <strong>1. Syntax & RFC Boundary Check</strong>
                    <code style={{ background: "var(--bg-subtle)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}>GET /api/check/syntax?email=...</code>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>Checks local/domain lengths, double dots, unquoted spaces, and valid TLD format.</p>
                  <pre style={{ background: "#0f172a", color: "#38bdf8", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.78rem", margin: 0 }}>
{`curl "https://mailverify.pulsechat.workers.dev/api/check/syntax?email=alex@gmail.com"`}
                  </pre>
                </div>

                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <strong>2. DNS & Host Resolution</strong>
                    <code style={{ background: "var(--bg-subtle)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}>GET /api/check/dns?domain=...</code>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>Queries Cloudflare DoH for active A and AAAA address records.</p>
                  <pre style={{ background: "#0f172a", color: "#38bdf8", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.78rem", margin: 0 }}>
{`curl "https://mailverify.pulsechat.workers.dev/api/check/dns?domain=stripe.com"`}
                  </pre>
                </div>

                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <strong>3. MX Routing & Server Priority</strong>
                    <code style={{ background: "var(--bg-subtle)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}>GET /api/check/mx?domain=...</code>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>Returns sorted Mail Exchangers by priority and checks RFC 7505 Null-MX.</p>
                  <pre style={{ background: "#0f172a", color: "#38bdf8", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.78rem", margin: 0 }}>
{`curl "https://mailverify.pulsechat.workers.dev/api/check/mx?domain=apple.com"`}
                  </pre>
                </div>

                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <strong>4. SPF & DMARC Policy Inspection</strong>
                    <code style={{ background: "var(--bg-subtle)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}>GET /api/check/security?domain=...</code>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>Inspects anti-spoofing declarations and DMARC enforcement policies.</p>
                  <pre style={{ background: "#0f172a", color: "#38bdf8", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.78rem", margin: 0 }}>
{`curl "https://mailverify.pulsechat.workers.dev/api/check/security?domain=github.com"`}
                  </pre>
                </div>

                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <strong>5. Disposable & Burner Detection</strong>
                    <code style={{ background: "var(--bg-subtle)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}>GET /api/check/disposable?domain=...</code>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>Identifies temporary 10-minute mailboxes via memory sets and MX matching.</p>
                  <pre style={{ background: "#0f172a", color: "#38bdf8", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.78rem", margin: 0 }}>
{`curl "https://mailverify.pulsechat.workers.dev/api/check/disposable?domain=mailinator.com"`}
                  </pre>
                </div>

                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <strong>6. Role & Provider Classification</strong>
                    <code style={{ background: "var(--bg-subtle)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}>GET /api/check/provider?email=...</code>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>Detects corporate vs free consumer mailbox and role aliases (support@, admin@).</p>
                  <pre style={{ background: "#0f172a", color: "#38bdf8", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.78rem", margin: 0 }}>
{`curl "https://mailverify.pulsechat.workers.dev/api/check/provider?email=sales@stripe.com"`}
                  </pre>
                </div>

                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <strong>7. Typo Detection & Suggestions</strong>
                    <code style={{ background: "var(--bg-subtle)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}>GET /api/check/typo?email=...</code>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>Detects domain misspellings and suggests corrections (e.g. gmial.com &rarr; gmail.com).</p>
                  <pre style={{ background: "#0f172a", color: "#38bdf8", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.78rem", margin: 0 }}>
{`curl "https://mailverify.pulsechat.workers.dev/api/check/typo?email=alex@gmial.com"`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeSection === "bulk" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>Bulk Batch Verification</h2>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(37,99,235,0.1)", color: "var(--accent-blue)", padding: "0.25rem 0.6rem", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                POST /api/bulk
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Submit up to 200 emails per batch. The engine executes concurrent subrequests in chunks of 5 and tracks monthly quota usage.
              </p>
              <pre style={{ background: "#0f172a", color: "#f8fafc", padding: "1rem", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontFamily: "var(--font-mono)", marginBottom: "1.5rem" }}>
{`{
  "emails": [
    "user1@gmail.com",
    "contact@stripe.com",
    "burner@mailinator.com"
  ]
}`}
              </pre>
            </div>
          )}

          {activeSection === "auth" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>API Keys & Monthly Quotas</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Registered developers on the Free Plan receive <strong>200 API calls per month</strong>. You can generate up to 5 active API keys in your Dashboard.
              </p>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Authentication Header</h3>
              <pre style={{ background: "#0f172a", color: "#38bdf8", padding: "1rem", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
{`X-API-Key: mv_live_8994cf5f2b0645589f2fe0d786140cf8
# Or via standard Bearer token:
Authorization: Bearer mv_live_8994cf5f2b0645589f2fe0d786140cf8`}
              </pre>
            </div>
          )}

          {activeSection === "verdicts" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>Verdicts & Classification Codes</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem", marginTop: "1rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-subtle)", textAlign: "left" }}>
                    <th style={{ padding: "0.75rem" }}>Verdict</th>
                    <th style={{ padding: "0.75rem" }}>Score Range</th>
                    <th style={{ padding: "0.75rem" }}>Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--success)" }}>LIKELY_DELIVERABLE</td>
                    <td style={{ padding: "0.75rem" }}>0 – 29</td>
                    <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>Valid RFC format, active MX records, resolving domain, and safe provider.</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--warning)" }}>RISKY</td>
                    <td style={{ padding: "0.75rem" }}>30 – 69</td>
                    <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>Missing SPF/DMARC policies or DNS resolution degradation.</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--danger)" }}>LIKELY_INVALID</td>
                    <td style={{ padding: "0.75rem" }}>70 – 100</td>
                    <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>Non-existent domain or severe deliverability failure.</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--danger)" }}>DISPOSABLE</td>
                    <td style={{ padding: "0.75rem" }}>95</td>
                    <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>Temporary burner inbox provider. High bounce risk.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeSection === "errors" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>Status Codes & Quota Limits</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="card" style={{ padding: "1rem" }}>
                  <strong>429 MONTHLY_QUOTA_EXCEEDED</strong>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                    Returned when an authenticated account exceeds the 200 monthly free API calls limit. Quota resets on the 1st of every month.
                  </p>
                </div>
                <div className="card" style={{ padding: "1rem" }}>
                  <strong>403 LOGIN_REQUIRED</strong>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                    Returned when an anonymous IP exceeds 5 free tester checks. Sign in with Google to get 200 free API calls and an API key.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
