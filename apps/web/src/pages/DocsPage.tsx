import { useState } from "react";
import { CodeSnippet } from "../components/CodeSnippet";
import { BookOpen, Terminal, CheckCircle2, Shield, AlertTriangle, Key, Layers } from "lucide-react";

export const DocsPage = () => {
  const [activeSection, setActiveSection] = useState<"quickstart" | "verify" | "bulk" | "auth" | "verdicts" | "errors">("quickstart");

  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", width: "100%" }}>
      {/* Docs Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          <BookOpen size={14} /> REST API SPECIFICATION
        </div>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}>MailVerify Developer Documentation</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: "700px" }}>
          Integrate high-precision email validation, MX resolution, SPF/DMARC checks, and disposable detection into your applications.
        </p>
      </div>

      {/* Docs Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2.5rem" }}>
        {/* Sidebar Nav */}
        <div style={{ borderRight: "1px solid var(--border-subtle)", paddingRight: "1.5rem" }}>
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
            Google OAuth & Sessions
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
                All endpoints operate over HTTPS with JSON request/response formats. Anonymous visitors receive 5 free checks per IP; authenticated developers receive unlimited checks with 30 requests/min burst capacity.
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
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>Single Verification Endpoint</h2>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(37,99,235,0.1)", color: "var(--accent-blue)", padding: "0.25rem 0.6rem", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                POST /api/verify
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Request Payload</h3>
              <pre style={{ background: "#0f172a", color: "#f8fafc", padding: "1rem", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontFamily: "var(--font-mono)", marginBottom: "1.5rem" }}>
{`{
  "email": "user@domain.com"
}`}
              </pre>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Response Payload</h3>
              <pre style={{ background: "#0f172a", color: "#f8fafc", padding: "1rem", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
{`{
  "success": true,
  "data": {
    "id": "ver_9a8b7c6d5e",
    "email": "user@domain.com",
    "normalized_email": "user@domain.com",
    "verdict": "LIKELY_DELIVERABLE",
    "score": 10,
    "checks": {
      "syntax": "PASS",
      "domain": "DOMAIN_EXISTS",
      "mx": "MX_FOUND",
      "spf": "SPF_PRESENT",
      "dmarc": "DMARC_PRESENT",
      "disposable": "NOT_DISPOSABLE",
      "role": "PERSONAL_ACCOUNT_LIKELY"
    },
    "created_at": "2026-08-21T12:00:00.000Z"
  }
}`}
              </pre>
            </div>
          )}

          {activeSection === "bulk" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>Bulk Batch Verification</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Authenticated users can upload CSV, TXT, or JSON files of up to 500 emails per batch.
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(37,99,235,0.1)", color: "var(--accent-blue)", padding: "0.25rem 0.6rem", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                POST /api/bulk
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                Accepts <code>Content-Type: text/csv</code> or <code>Content-Type: application/json</code> with <code>{`{ "emails": ["a@test.com", "b@test.com"] }`}</code>.
              </p>
            </div>
          )}

          {activeSection === "verdicts" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>Deliverability Verdicts</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", marginTop: "1rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                    <th style={{ padding: "0.75rem" }}>VERDICT</th>
                    <th style={{ padding: "0.75rem" }}>RISK SCORE</th>
                    <th style={{ padding: "0.75rem" }}>MEANING</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--success)" }}>LIKELY_DELIVERABLE</td>
                    <td style={{ padding: "0.75rem" }}>0 - 20</td>
                    <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>Valid syntax, active domain, valid MX exchanger, clean provider.</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--warning)" }}>RISKY</td>
                    <td style={{ padding: "0.75rem" }}>25 - 60</td>
                    <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>Missing SPF/DMARC or unconfirmed mailbox routing.</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--danger)" }}>DISPOSABLE</td>
                    <td style={{ padding: "0.75rem" }}>90 - 100</td>
                    <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>Temporary burner email address (Mailinator, GuerrillaMail, etc.).</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--danger)" }}>NO_MX</td>
                    <td style={{ padding: "0.75rem" }}>100</td>
                    <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>Domain has no configured mail exchange server.</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--danger)" }}>INVALID_SYNTAX</td>
                    <td style={{ padding: "0.75rem" }}>100</td>
                    <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>Failed RFC 5322 structural email requirements.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeSection === "errors" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>Status Codes & Quotas</h2>
              <ul style={{ listStyle: "none", fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 2.2 }}>
                <li><code style={{ color: "var(--text-main)", fontWeight: 700 }}>200 OK</code> — Successful verification or query result.</li>
                <li><code style={{ color: "var(--text-main)", fontWeight: 700 }}>400 Bad Request</code> — Invalid JSON, malformed syntax, or file size limit exceeded.</li>
                <li><code style={{ color: "var(--text-main)", fontWeight: 700 }}>401 Unauthorized</code> — Session cookie or Bearer token expired/missing.</li>
                <li><code style={{ color: "var(--text-main)", fontWeight: 700 }}>403 Forbidden</code> — Anonymous 5-check free limit reached (login required) or non-admin on admin route.</li>
                <li><code style={{ color: "var(--text-main)", fontWeight: 700 }}>429 Too Many Requests</code> — Burst rate limit exceeded.</li>
              </ul>
            </div>
          )}

          {activeSection === "auth" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>Authentication & Sessions</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Authentication uses Google OpenID Connect. The server issues an HttpOnly SameSite=None secure session cookie and returns a session token for cross-origin Bearer authorization.
              </p>
              <div style={{ background: "var(--bg-subtle)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <h4 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Passing Session Tokens in API headers:</h4>
                <code style={{ fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
                  Authorization: Bearer &lt;session_token&gt;
                </code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
