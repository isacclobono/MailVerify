import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Terminal, 
  Layers, 
  Upload, 
  Key, 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  Check, 
  Play, 
  Loader2, 
  Code,
  Sparkles
} from "lucide-react";
import { api } from "../api/client";

type DocsSection = 
  | "quickstart" 
  | "verify" 
  | "pipeline" 
  | "bulk" 
  | "auth" 
  | "verdicts" 
  | "errors";

export const DocsPage = () => {
  const getInitialSection = (): DocsSection => {
    try {
      const params = new URLSearchParams(window.location.search);
      const s = (params.get("section") || params.get("tab")) as DocsSection;
      const valid: DocsSection[] = [
        "quickstart", 
        "verify", 
        "pipeline", 
        "bulk", 
        "auth", 
        "verdicts", 
        "errors"
      ];
      return valid.includes(s) ? s : "quickstart";
    } catch {
      return "quickstart";
    }
  };

  const [activeSection, setActiveSectionState] = useState<DocsSection>(getInitialSection);
  const [copiedBaseUrl, setCopiedBaseUrl] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Interactive tester inside docs
  const [testEmail, setTestEmail] = useState("contact@stripe.com");
  const [testLoading, setTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);

  const BASE_URL = "https://mailverify.pulsechat.workers.dev";

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
      // Ignore
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveSectionState(getInitialSection());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCopyBaseUrl = () => {
    navigator.clipboard.writeText(BASE_URL);
    setCopiedBaseUrl(true);
    setTimeout(() => setCopiedBaseUrl(false), 2000);
  };

  const handleRunDocsTest = async () => {
    if (!testEmail.trim()) return;
    setTestLoading(true);
    setTestResponse(null);
    try {
      const data = await api.verifyEmail(testEmail.trim());
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setTestResponse(JSON.stringify({ success: false, error: msg }, null, 2));
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", width: "100%" }}>
      {/* Docs Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.2rem 0.65rem", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          <BookOpen size={13} /> REST API SPECIFICATION v1.0
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.35rem" }}>
          MailVerify API Reference
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "720px", lineHeight: 1.55 }}>
          Integrate serverless email verification, live DNS-over-HTTPS routing, MX resolution, SPF/DMARC anti-spoofing audits, and disposable detection into your applications.
        </p>

        {/* Quick Reference Metadata Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.78rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>BASE URL:</span>
            <code style={{ fontFamily: "var(--font-mono)", color: "var(--text-main)", fontWeight: 700 }}>
              {BASE_URL}
            </code>
            <button
              type="button"
              onClick={handleCopyBaseUrl}
              style={{
                background: "#ffffff",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "0.15rem 0.45rem",
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              {copiedBaseUrl ? <Check size={11} color="var(--success)" /> : <Copy size={11} />}
              <span>{copiedBaseUrl ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <div style={{ height: "14px", width: "1px", background: "var(--border-strong)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ color: "var(--text-muted)" }}>AUTH:</span>
            <strong style={{ color: "var(--text-main)" }}>X-API-Key | Bearer</strong>
          </div>

          <div style={{ height: "14px", width: "1px", background: "var(--border-strong)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ color: "var(--text-muted)" }}>RATE LIMIT:</span>
            <strong style={{ color: "var(--accent-blue)" }}>200 Free Calls / Mo</strong>
          </div>
        </div>
      </div>

      {/* Docs 2-Column Layout */}
      <div className="docs-container-grid" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Sticky Sidebar Navigation */}
        <aside
          className="docs-sidebar"
          style={{
            position: "sticky",
            top: "1.5rem",
            background: "#ffffff",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "0.85rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            GETTING STARTED
          </div>
          <button
            type="button"
            className={`tab-nav-btn ${activeSection === "quickstart" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "0.45rem", width: "100%", textAlign: "left", padding: "0.45rem 0.6rem", borderRadius: "var(--radius-sm)", borderBottom: "none", background: activeSection === "quickstart" ? "var(--bg-subtle)" : "transparent", marginBottom: "0.2rem" }}
            onClick={() => setActiveSection("quickstart")}
          >
            <Terminal size={13} /> Quick Start
          </button>
          <button
            type="button"
            className={`tab-nav-btn ${activeSection === "verify" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "0.45rem", width: "100%", textAlign: "left", padding: "0.45rem 0.6rem", borderRadius: "var(--radius-sm)", borderBottom: "none", background: activeSection === "verify" ? "var(--bg-subtle)" : "transparent", marginBottom: "0.2rem" }}
            onClick={() => setActiveSection("verify")}
          >
            <Code size={13} /> Full Verify API
          </button>
          <button
            type="button"
            className={`tab-nav-btn ${activeSection === "pipeline" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "0.45rem", width: "100%", textAlign: "left", padding: "0.45rem 0.6rem", borderRadius: "var(--radius-sm)", borderBottom: "none", background: activeSection === "pipeline" ? "var(--bg-subtle)" : "transparent", marginBottom: "0.2rem" }}
            onClick={() => setActiveSection("pipeline")}
          >
            <Layers size={13} /> Sub-Pipeline Checks
          </button>
          <button
            type="button"
            className={`tab-nav-btn ${activeSection === "bulk" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "0.45rem", width: "100%", textAlign: "left", padding: "0.45rem 0.6rem", borderRadius: "var(--radius-sm)", borderBottom: "none", background: activeSection === "bulk" ? "var(--bg-subtle)" : "transparent", marginBottom: "0.2rem" }}
            onClick={() => setActiveSection("bulk")}
          >
            <Upload size={13} /> Bulk Batch Engine
          </button>

          <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "1.25rem 0 0.5rem" }}>
            SECURITY & REPUTATION
          </div>
          <button
            type="button"
            className={`tab-nav-btn ${activeSection === "auth" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "0.45rem", width: "100%", textAlign: "left", padding: "0.45rem 0.6rem", borderRadius: "var(--radius-sm)", borderBottom: "none", background: activeSection === "auth" ? "var(--bg-subtle)" : "transparent", marginBottom: "0.2rem" }}
            onClick={() => setActiveSection("auth")}
          >
            <Key size={13} /> API Keys & Limits
          </button>
          <button
            type="button"
            className={`tab-nav-btn ${activeSection === "verdicts" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "0.45rem", width: "100%", textAlign: "left", padding: "0.45rem 0.6rem", borderRadius: "var(--radius-sm)", borderBottom: "none", background: activeSection === "verdicts" ? "var(--bg-subtle)" : "transparent", marginBottom: "0.2rem" }}
            onClick={() => setActiveSection("verdicts")}
          >
            <ShieldCheck size={13} /> Verdicts & Scores
          </button>
          <button
            type="button"
            className={`tab-nav-btn ${activeSection === "errors" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "0.45rem", width: "100%", textAlign: "left", padding: "0.45rem 0.6rem", borderRadius: "var(--radius-sm)", borderBottom: "none", background: activeSection === "errors" ? "var(--bg-subtle)" : "transparent", marginBottom: "0.2rem" }}
            onClick={() => setActiveSection("errors")}
          >
            <AlertTriangle size={13} /> Error Codes & Quotas
          </button>
        </aside>

        {/* Content Panel */}
        <main className="card" style={{ padding: "1.75rem", minHeight: "600px" }}>
          {/* SECTION 1: QUICK START */}
          {activeSection === "quickstart" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Terminal size={18} color="var(--accent-blue)" />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Quick Start Guide</h2>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.55, marginBottom: "1.5rem" }}>
                Verify any email address by sending a POST JSON body or GET query request to our Cloudflare Edge Worker.
              </p>

              {/* cURL Example Box */}
              <div style={{ marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>1. SEND VERIFICATION REQUEST</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`curl -X POST "https://mailverify.pulsechat.workers.dev/api/verify" \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -d '{"email":"contact@stripe.com"}'`, "curl-quickstart")}
                    style={{ background: "none", border: "none", fontSize: "0.72rem", color: "var(--accent-blue)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                  >
                    {copiedCodeId === "curl-quickstart" ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                    <span>{copiedCodeId === "curl-quickstart" ? "Copied" : "Copy cURL"}</span>
                  </button>
                </div>

                <pre style={{ background: "var(--bg-dark)", color: "#38bdf8", padding: "1rem", borderRadius: "var(--radius-md)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", overflowX: "auto", lineHeight: 1.5 }}>
{`curl -X POST "https://mailverify.pulsechat.workers.dev/api/verify" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{"email":"contact@stripe.com"}'`}
                </pre>
              </div>

              {/* Live Interactive Playground within Docs */}
              <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
                  <Sparkles size={14} color="var(--accent-blue)" />
                  <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>Interactive Playground (Try Live)</strong>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email to test API response..."
                    className="clean-input"
                    style={{ fontSize: "0.82rem", padding: "0.45rem 0.75rem" }}
                  />
                  <button
                    type="button"
                    className="btn btn-black"
                    onClick={handleRunDocsTest}
                    disabled={testLoading || !testEmail.trim()}
                    style={{ fontSize: "0.78rem", padding: "0.45rem 0.85rem", whiteSpace: "nowrap" }}
                  >
                    {testLoading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                    <span>Send Request</span>
                  </button>
                </div>

                {testResponse && (
                  <pre style={{ background: "var(--bg-dark)", color: "#a7f3d0", padding: "0.85rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", maxHeight: "250px", overflowY: "auto", lineHeight: 1.45 }}>
                    {testResponse}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* SECTION 2: FULL VERIFY API */}
          {activeSection === "verify" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(37, 99, 235, 0.15)", color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}>
                  POST / GET
                </span>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>/api/verify</h2>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.55, marginBottom: "1.25rem" }}>
                Runs the entire 8-stage verification pipeline and returns confidence score, verdict, provider type, typo suggestions, and granular reason flags.
              </p>

              {/* Query / Body Parameters */}
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>Request Parameters</h3>
              <div className="data-table-wrapper" style={{ marginBottom: "1.5rem" }}>
                <div className="data-table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Type</th>
                        <th>In</th>
                        <th>Required</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>email</td>
                        <td style={{ color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}>string</td>
                        <td>
                          <span className="table-pill table-pill-muted">Body / Query</span>
                        </td>
                        <td>
                          <span className="table-pill table-pill-danger">Required</span>
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>Target email address to inspect (e.g. <code>alex@example.com</code>).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Complete JSON Response */}
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>200 OK Response Schema</h3>
              <pre style={{ background: "var(--bg-dark)", color: "#38bdf8", padding: "1rem", borderRadius: "var(--radius-md)", fontSize: "0.78rem", fontFamily: "var(--font-mono)", overflowX: "auto", lineHeight: 1.5 }}>
{`{
  "success": true,
  "data": {
    "email": "contact@stripe.com",
    "normalized_email": "contact@stripe.com",
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

          {/* SECTION 3: SUB-PIPELINE MICRO-CHECKS */}
          {activeSection === "pipeline" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <Layers size={18} color="var(--accent-blue)" />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Dedicated Sub-Pipeline Endpoints</h2>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.55, marginBottom: "1.5rem" }}>
                Call individual verification stages independently for ultra-fast, targeted diagnostics.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* 1. Syntax */}
                <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem", flexWrap: "wrap", gap: "0.4rem" }}>
                    <strong style={{ fontSize: "0.88rem" }}>1. RFC Syntax Check</strong>
                    <code style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.15rem 0.45rem", borderRadius: "4px", fontSize: "0.75rem" }}>GET|POST /api/check/syntax?email=...</code>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0 0 0.5rem" }}>Validates RFC 5322 structural formatting, double dots, length boundaries, and label rules.</p>
                  <pre style={{ background: "var(--bg-dark)", color: "#38bdf8", padding: "0.6rem 0.85rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", margin: 0 }}>
{`curl "https://mailverify.pulsechat.workers.dev/api/check/syntax?email=alex@gmail.com"`}
                  </pre>
                </div>

                {/* 2. DNS */}
                <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem", flexWrap: "wrap", gap: "0.4rem" }}>
                    <strong style={{ fontSize: "0.88rem" }}>2. DNS Host Resolution (DoH)</strong>
                    <code style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.15rem 0.45rem", borderRadius: "4px", fontSize: "0.75rem" }}>GET|POST /api/check/dns?domain=...</code>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0 0 0.5rem" }}>Queries Cloudflare DNS-over-HTTPS for active A and AAAA host address records.</p>
                  <pre style={{ background: "var(--bg-dark)", color: "#38bdf8", padding: "0.6rem 0.85rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", margin: 0 }}>
{`curl "https://mailverify.pulsechat.workers.dev/api/check/dns?domain=stripe.com"`}
                  </pre>
                </div>

                {/* 3. MX */}
                <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem", flexWrap: "wrap", gap: "0.4rem" }}>
                    <strong style={{ fontSize: "0.88rem" }}>3. MX Routing Discovery</strong>
                    <code style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.15rem 0.45rem", borderRadius: "4px", fontSize: "0.75rem" }}>GET|POST /api/check/mx?domain=...</code>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0 0 0.5rem" }}>Discovers mail exchangers, checks RFC 7505 Null-MX, and sorts servers by priority.</p>
                  <pre style={{ background: "var(--bg-dark)", color: "#38bdf8", padding: "0.6rem 0.85rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", margin: 0 }}>
{`curl "https://mailverify.pulsechat.workers.dev/api/check/mx?domain=apple.com"`}
                  </pre>
                </div>

                {/* 4. Security */}
                <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem", flexWrap: "wrap", gap: "0.4rem" }}>
                    <strong style={{ fontSize: "0.88rem" }}>4. SPF & DMARC Security Inspection</strong>
                    <code style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.15rem 0.45rem", borderRadius: "4px", fontSize: "0.75rem" }}>GET|POST /api/check/security?domain=...</code>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0 0 0.5rem" }}>Fetches raw TXT SPF declarations and checks `_dmarc` policy enforcement (reject/quarantine).</p>
                  <pre style={{ background: "var(--bg-dark)", color: "#38bdf8", padding: "0.6rem 0.85rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", margin: 0 }}>
{`curl "https://mailverify.pulsechat.workers.dev/api/check/security?domain=github.com"`}
                  </pre>
                </div>

                {/* 5. Disposable */}
                <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem", flexWrap: "wrap", gap: "0.4rem" }}>
                    <strong style={{ fontSize: "0.88rem" }}>5. Disposable Domain Blocklist</strong>
                    <code style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.15rem 0.45rem", borderRadius: "4px", fontSize: "0.75rem" }}>GET|POST /api/check/disposable?domain=...</code>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0 0 0.5rem" }}>Flags temporary 10-minute inboxes and burner email services.</p>
                  <pre style={{ background: "var(--bg-dark)", color: "#38bdf8", padding: "0.6rem 0.85rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", margin: 0 }}>
{`curl "https://mailverify.pulsechat.workers.dev/api/check/disposable?domain=mailinator.com"`}
                  </pre>
                </div>

                {/* 6. Typo */}
                <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem", flexWrap: "wrap", gap: "0.4rem" }}>
                    <strong style={{ fontSize: "0.88rem" }}>6. Typo Detection & Suggestions</strong>
                    <code style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.15rem 0.45rem", borderRadius: "4px", fontSize: "0.75rem" }}>GET|POST /api/check/typo?email=...</code>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0 0 0.5rem" }}>Detects domain misspellings (e.g. <code>gmial.com</code>) and returns suggested corrections.</p>
                  <pre style={{ background: "var(--bg-dark)", color: "#38bdf8", padding: "0.6rem 0.85rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", margin: 0 }}>
{`curl "https://mailverify.pulsechat.workers.dev/api/check/typo?email=alex@gmial.com"`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: BULK BATCH API */}
          {activeSection === "bulk" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <Upload size={18} color="var(--accent-blue)" />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>POST /api/bulk</h2>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.55, marginBottom: "1.25rem" }}>
                Submit up to 200 emails in a single batch. Requests are processed in parallel chunks of 5 with automatic rate limiting protection.
              </p>

              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>Request Payload (JSON)</h3>
              <pre style={{ background: "var(--bg-dark)", color: "#f8fafc", padding: "1rem", borderRadius: "var(--radius-md)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
{`{
  "emails": [
    "user1@gmail.com",
    "contact@stripe.com",
    "burner@mailinator.com",
    "billing@apple.com"
  ]
}`}
              </pre>

              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>200 OK Batch Response</h3>
              <pre style={{ background: "var(--bg-dark)", color: "#38bdf8", padding: "1rem", borderRadius: "var(--radius-md)", fontSize: "0.78rem", fontFamily: "var(--font-mono)", overflowX: "auto", lineHeight: 1.5 }}>
{`{
  "success": true,
  "summary": {
    "total": 4,
    "processed": 4,
    "successful": 3,
    "failed": 1,
    "results": [ ... ]
  }
}`}
              </pre>
            </div>
          )}

          {/* SECTION 5: AUTH & KEYS */}
          {activeSection === "auth" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <Key size={18} color="var(--accent-blue)" />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Authentication & API Keys</h2>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.55, marginBottom: "1.25rem" }}>
                Authenticate API requests using private API keys generated in your Dashboard. Each free account receives <strong>200 calls every month</strong>.
              </p>

              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>Header Methods Supported</h3>
              <pre style={{ background: "var(--bg-dark)", color: "#38bdf8", padding: "1rem", borderRadius: "var(--radius-md)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
{`# 1. Custom Header (Recommended)
X-API-Key: mv_live_8994cf5f2b0645589f2fe0d786140cf8

# 2. Standard Authorization Bearer
Authorization: Bearer mv_live_8994cf5f2b0645589f2fe0d786140cf8`}
              </pre>

              <div style={{ background: "rgba(37, 99, 235, 0.08)", border: "1px solid rgba(37, 99, 235, 0.2)", borderRadius: "var(--radius-md)", padding: "1rem", fontSize: "0.82rem", color: "#1e3a8a", marginBottom: "1.5rem" }}>
                <strong>Quota Mechanics:</strong> Usage is counted per verified email address. Batch submissions decrement the monthly counter by the number of processed emails. Monthly quotas reset automatically at midnight UTC on the 1st of every month.
              </div>

              {/* Admin Portal Authentication */}
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>Administrator Direct Login</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.55, marginBottom: "0.75rem" }}>
                The Administrator Portal at <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>/admin</code> uses direct email & password authentication.
              </p>
              <pre style={{ background: "var(--bg-dark)", color: "#f8fafc", padding: "1rem", borderRadius: "var(--radius-md)", fontSize: "0.78rem", fontFamily: "var(--font-mono)", overflowX: "auto", lineHeight: 1.5 }}>
{`POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@mailverify.com",
  "password": "AdminMailVerify2026!"
}`}
              </pre>
            </div>
          )}

          {/* SECTION 6: VERDICTS & SCORING */}
          {activeSection === "verdicts" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <ShieldCheck size={18} color="var(--accent-blue)" />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Verdicts & Deliverability Scoring</h2>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.55, marginBottom: "1.25rem" }}>
                MailVerify provides a normalized 0–100 risk score and categorical verdicts for straightforward filtering.
              </p>

              <div className="data-table-wrapper">
                <div className="data-table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Verdict</th>
                        <th>Risk Score</th>
                        <th>Meaning & Recommended Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span className="table-pill table-pill-success">LIKELY_DELIVERABLE</span>
                        </td>
                        <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>0 – 29</td>
                        <td style={{ color: "var(--text-muted)" }}>Safe to send. Active MX routing, resolved host, valid SPF/DMARC policies.</td>
                      </tr>
                      <tr>
                        <td>
                          <span className="table-pill table-pill-warning">RISKY</span>
                        </td>
                        <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>30 – 69</td>
                        <td style={{ color: "var(--text-muted)" }}>Send with caution. Missing anti-spoofing policies or degraded DNS host configuration.</td>
                      </tr>
                      <tr>
                        <td>
                          <span className="table-pill table-pill-danger">LIKELY_INVALID</span>
                        </td>
                        <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>70 – 100</td>
                        <td style={{ color: "var(--text-muted)" }}>Do not send. Non-existent domain or severe deliverability failure.</td>
                      </tr>
                      <tr>
                        <td>
                          <span className="table-pill table-pill-danger">DISPOSABLE</span>
                        </td>
                        <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>95</td>
                        <td style={{ color: "var(--text-muted)" }}>Temporary burner inbox provider (e.g. Mailinator, GuerrillaMail). High bounce risk.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: ERRORS & LIMITS */}
          {activeSection === "errors" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <AlertTriangle size={18} color="var(--accent-blue)" />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>HTTP Status Codes & Errors</h2>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.55, marginBottom: "1.25rem" }}>
                All API responses use standard HTTP status codes and structured JSON errors.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, padding: "0.15rem 0.45rem", borderRadius: "4px", background: "rgba(239, 68, 68, 0.15)", color: "var(--danger)", fontFamily: "var(--font-mono)" }}>
                      429
                    </span>
                    <strong style={{ fontSize: "0.88rem" }}>MONTHLY_QUOTA_EXCEEDED</strong>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0 }}>
                    Returned when an authenticated account exceeds the 200 monthly free API calls limit. Quotas reset automatically on the 1st of every month.
                  </p>
                </div>

                <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, padding: "0.15rem 0.45rem", borderRadius: "4px", background: "rgba(245, 158, 11, 0.15)", color: "var(--warning)", fontFamily: "var(--font-mono)" }}>
                      403
                    </span>
                    <strong style={{ fontSize: "0.88rem" }}>LOGIN_REQUIRED</strong>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0 }}>
                    Returned when an anonymous visitor exceeds 5 instant guest checks. Sign in with Google to receive your private developer API key and 200 monthly calls.
                  </p>
                </div>

                <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, padding: "0.15rem 0.45rem", borderRadius: "4px", background: "rgba(239, 68, 68, 0.15)", color: "var(--danger)", fontFamily: "var(--font-mono)" }}>
                      401
                    </span>
                    <strong style={{ fontSize: "0.88rem" }}>UNAUTHORIZED</strong>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0 }}>
                    The provided API key is invalid, missing, or has been revoked. Verify your key in the Dashboard API Keys manager.
                  </p>
                </div>

                <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, padding: "0.15rem 0.45rem", borderRadius: "4px", background: "rgba(245, 158, 11, 0.15)", color: "var(--warning)", fontFamily: "var(--font-mono)" }}>
                      400
                    </span>
                    <strong style={{ fontSize: "0.88rem" }}>BAD_REQUEST</strong>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0 }}>
                    The request is malformed or missing the required <code>email</code> parameter.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
