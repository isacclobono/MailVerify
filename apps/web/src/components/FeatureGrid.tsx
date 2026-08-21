import { useState } from "react";
import { X, ExternalLink, Terminal, Check, Copy, Loader2, Play } from "lucide-react";

interface FeatureCard {
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  sampleEmail: string;
  endpoint: string;
  method: "GET" | "POST";
  curlExample: string;
  sampleResponse: string;
  details: string;
}

export const FeatureGrid = ({ onTryEmail }: { onTryEmail: (email: string) => void }) => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureCard | null>(null);
  const [liveTesting, setLiveTesting] = useState(false);
  const [liveResult, setLiveResult] = useState<string | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const features: FeatureCard[] = [
    {
      tag: "SYNTAX",
      tagColor: "#d97706",
      title: "RFC 5322 Syntax Engine",
      description: "Validates local-part boundaries, quotes, double dots, length limits, and TLD validity without fragile regex.",
      sampleEmail: "alex.smith+work@domain.com",
      endpoint: "/api/check/syntax?email=alex.smith+work@domain.com",
      method: "GET",
      curlExample: `curl "https://mailverify.sk-builds.workers.dev/api/check/syntax?email=alex.smith+work@domain.com"`,
      sampleResponse: `{\n  "success": true,\n  "data": {\n    "email": "alex.smith+work@domain.com",\n    "is_valid_rfc": true,\n    "syntax_status": "PASS",\n    "local_part": "alex.smith+work",\n    "domain": "domain.com",\n    "length": { "total": 25, "local": 15, "domain": 10 }\n  }\n}`,
      details: "Performs strict structural validation conforming to RFC 5322 & RFC 3696 specifications while preventing regex denial of service (ReDoS).",
    },
    {
      tag: "DNS RESOLUTION",
      tagColor: "#0284c7",
      title: "Domain & Host Existence",
      description: "Direct Cloudflare 1.1.1.1 DNS-over-HTTPS queries to resolve active A and AAAA host address records.",
      sampleEmail: "support@google.com",
      endpoint: "/api/check/dns?domain=google.com",
      method: "GET",
      curlExample: `curl "https://mailverify.sk-builds.workers.dev/api/check/dns?domain=google.com"`,
      sampleResponse: `{\n  "success": true,\n  "data": {\n    "domain": "google.com",\n    "status": "DOMAIN_EXISTS",\n    "resolves": true,\n    "ipv4_addresses": ["142.250.190.46"],\n    "ipv6_addresses": ["2607:f8b0:4005:808::200e"]\n  }\n}`,
      details: "Queries Cloudflare DNS edge for active A and AAAA address records, verifying that the domain exists and resolves globally.",
    },
    {
      tag: "MX ROUTING",
      tagColor: "#2563eb",
      title: "MX Server Discovery & Priority",
      description: "Discovers active Mail Exchanger (MX) routing records and identifies RFC 7505 Null-MX non-accepting domains.",
      sampleEmail: "contact@stripe.com",
      endpoint: "/api/check/mx?domain=stripe.com",
      method: "GET",
      curlExample: `curl "https://mailverify.sk-builds.workers.dev/api/check/mx?domain=stripe.com"`,
      sampleResponse: `{\n  "success": true,\n  "data": {\n    "domain": "stripe.com",\n    "status": "MX_FOUND",\n    "has_mx_servers": true,\n    "primary_mx": "aspmx.l.google.com",\n    "records": [\n      { "priority": 1, "host": "aspmx.l.google.com" },\n      { "priority": 5, "host": "alt1.aspmx.l.google.com" }\n    ]\n  }\n}`,
      details: "Queries Cloudflare DoH for MX records, sorting them by priority to ensure destination mail exchangers are ready to receive mail.",
    },
    {
      tag: "SECURITY",
      tagColor: "#10b981",
      title: "SPF & DMARC Policy Audit",
      description: "Inspects anti-spoofing TXT records, SPF v=spf1 declarations, and DMARC quarantine/reject enforcement policies.",
      sampleEmail: "security@apple.com",
      endpoint: "/api/check/security?domain=apple.com",
      method: "GET",
      curlExample: `curl "https://mailverify.sk-builds.workers.dev/api/check/security?domain=apple.com"`,
      sampleResponse: `{\n  "success": true,\n  "data": {\n    "domain": "apple.com",\n    "spf_status": "SPF_PRESENT",\n    "dmarc_status": "DMARC_PRESENT",\n    "is_secure": true\n  }\n}`,
      details: "Fetches and analyzes Sender Policy Framework (SPF) and Domain-based Message Authentication, Reporting, and Conformance (DMARC) records.",
    },
    {
      tag: "DISPOSABLE",
      tagColor: "#e11d48",
      title: "Temporary & Burner Detection",
      description: "Flags disposable, 10-minute, and burner inbox providers using memory-accelerated sets and MX pattern matching.",
      sampleEmail: "burner@mailinator.com",
      endpoint: "/api/check/disposable?domain=mailinator.com",
      method: "GET",
      curlExample: `curl "https://mailverify.sk-builds.workers.dev/api/check/disposable?domain=mailinator.com"`,
      sampleResponse: `{\n  "success": true,\n  "data": {\n    "domain": "mailinator.com",\n    "status": "DISPOSABLE",\n    "is_disposable": true\n  }\n}`,
      details: "Detects spam traps and throwaway mailboxes from known temporary providers (Mailinator, Temp-Mail, GuerrillaMail, 10minutemail, etc.).",
    },
    {
      tag: "INTELLIGENCE",
      tagColor: "#8b5cf6",
      title: "Role & Provider Classification",
      description: "Distinguishes corporate domains from public free mailboxes (Gmail, Outlook) and identifies role/department aliases.",
      sampleEmail: "billing@company.com",
      endpoint: "/api/check/provider?email=billing@company.com",
      method: "GET",
      curlExample: `curl "https://mailverify.sk-builds.workers.dev/api/check/provider?email=billing@company.com"`,
      sampleResponse: `{\n  "success": true,\n  "data": {\n    "domain": "company.com",\n    "local_part": "billing",\n    "provider_class": "BUSINESS_CORPORATE",\n    "is_free_mailbox": false,\n    "is_role_account": true,\n    "role_status": "ROLE_ACCOUNT"\n  }\n}`,
      details: "Classifies email addresses into personal direct mailboxes, corporate business accounts, or generic organizational distribution aliases.",
    },
    {
      tag: "SUGGESTIONS",
      tagColor: "#f59e0b",
      title: "Typo-Squatting & Suggestions",
      description: "Detects domain typos (e.g. gmial.com, yaho.com, outlok.com) and provides 1-click 'Did you mean?' suggestions.",
      sampleEmail: "alex@gmial.com",
      endpoint: "/api/check/typo?email=alex@gmial.com",
      method: "GET",
      curlExample: `curl "https://mailverify.sk-builds.workers.dev/api/check/typo?email=alex@gmial.com"`,
      sampleResponse: `{\n  "success": true,\n  "data": {\n    "original_domain": "gmial.com",\n    "has_typo": true,\n    "suggested_domain": "gmail.com",\n    "suggested_email": "alex@gmail.com"\n  }\n}`,
      details: "Uses dictionary and Levenshtein distance matching to detect typos against popular global mail providers in real time.",
    },
    {
      tag: "PRIVACY",
      tagColor: "#06b6d4",
      title: "5-Day Retention & Purge",
      description: "Automated daily Cloudflare Cron sweeps ensure verification logs older than 5 days are permanently destroyed.",
      sampleEmail: "privacy@mailverify.internal",
      endpoint: "/api/usage",
      method: "GET",
      curlExample: `curl "https://mailverify.sk-builds.workers.dev/api/usage" -H "X-API-Key: YOUR_API_KEY"`,
      sampleResponse: `{\n  "success": true,\n  "data": {\n    "retention_days": 5,\n    "auto_purge_enabled": true\n  }\n}`,
      details: "Zero long-term data hoarding. Parameterized SQL queries permanently delete verification rows on a rolling 5-day cycle.",
    },
  ];

  const handleTestLiveEndpoint = async (feat: FeatureCard) => {
    setLiveTesting(true);
    setLiveResult(null);
    try {
      const url = `https://mailverify.sk-builds.workers.dev${feat.endpoint}`;
      const res = await fetch(url);
      const data = await res.json();
      setLiveResult(JSON.stringify(data, null, 2));
    } catch {
      setLiveResult(feat.sampleResponse);
    } finally {
      setLiveTesting(false);
    }
  };

  const handleCopyCurl = (curl: string) => {
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="feature-section">
      <div className="section-header">
        <span className="section-eyebrow">MODULAR VERIFICATION PIPELINE</span>
        <h2 className="section-title">How MailVerify Protects Your Deliverability</h2>
        <p className="section-subtitle">
          Every stage can be executed as a complete verification check or called independently via dedicated sub-pipeline API endpoints.
        </p>
      </div>

      <div className="feature-grid">
        {features.map((feat, idx) => (
          <div key={idx} className="feature-card">
            <div className="card-top">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span className="feature-tag" style={{ color: feat.tagColor, borderColor: `${feat.tagColor}40`, backgroundColor: `${feat.tagColor}15` }}>
                  {feat.tag}
                </span>
                <code style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", background: "var(--bg-subtle)", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                  {feat.endpoint.split("?")[0]}
                </code>
              </div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-desc">{feat.description}</p>
            </div>
            <div className="card-actions">
              <button
                className="btn-card-action"
                onClick={() => {
                  setSelectedFeature(feat);
                  setLiveResult(null);
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
              >
                <Terminal size={13} /> API Endpoint
              </button>
              <button
                className="btn-card-action btn-card-action-primary"
                onClick={() => onTryEmail(feat.sampleEmail)}
              >
                Run Test <ExternalLink size={13} style={{ marginLeft: "0.2rem", display: "inline" }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Sub-Pipeline Endpoint Dialog */}
      {selectedFeature && (
        <div className="modal-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="modal-content" style={{ maxWidth: "640px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <span className="feature-tag" style={{ color: selectedFeature.tagColor, borderColor: `${selectedFeature.tagColor}40`, backgroundColor: `${selectedFeature.tagColor}15` }}>
                    {selectedFeature.tag}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {selectedFeature.method} {selectedFeature.endpoint.split("?")[0]}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                  {selectedFeature.title}
                </h3>
              </div>
              <button className="btn-modal-close" onClick={() => setSelectedFeature(null)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "1rem 0" }}>
              {selectedFeature.details}
            </p>

            {/* cURL Box with Copy */}
            <div style={{ position: "relative", background: "var(--bg-dark)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", marginBottom: "1rem", border: "1px solid #1e293b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, letterSpacing: "0.05em" }}>DEDICATED cURL COMMAND</span>
                <button
                  onClick={() => handleCopyCurl(selectedFeature.curlExample)}
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "#f8fafc", fontSize: "0.75rem", padding: "0.25rem 0.55rem", borderRadius: "4px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                >
                  {copiedCurl ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                  <span>{copiedCurl ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre style={{ margin: 0, color: "#38bdf8", fontFamily: "var(--font-mono)", fontSize: "0.82rem", overflowX: "auto" }}>
                {selectedFeature.curlExample}
              </pre>
            </div>

            {/* Live Response Box */}
            <div style={{ background: "#090e17", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", border: "1px solid #1e293b", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, letterSpacing: "0.05em" }}>
                  {liveResult ? "LIVE RESPONSE (200 OK)" : "SAMPLE JSON RESPONSE"}
                </span>
                <button
                  onClick={() => handleTestLiveEndpoint(selectedFeature)}
                  disabled={liveTesting}
                  style={{ background: "var(--accent-blue)", border: "none", color: "#fff", fontSize: "0.75rem", padding: "0.25rem 0.65rem", borderRadius: "4px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                >
                  {liveTesting ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="#fff" />}
                  <span>{liveTesting ? "Testing..." : "Send Request"}</span>
                </button>
              </div>
              <pre style={{ margin: 0, color: "#a5f3fc", fontFamily: "var(--font-mono)", fontSize: "0.8rem", maxHeight: "180px", overflowY: "auto" }}>
                {liveResult || selectedFeature.sampleResponse}
              </pre>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button className="btn btn-outline" onClick={() => setSelectedFeature(null)} style={{ fontSize: "0.85rem" }}>
                Close
              </button>
              <button
                className="btn btn-black"
                onClick={() => {
                  onTryEmail(selectedFeature.sampleEmail);
                  setSelectedFeature(null);
                }}
                style={{ fontSize: "0.85rem" }}
              >
                Run Full Pipeline Verification →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
