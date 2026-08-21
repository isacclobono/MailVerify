import { useState } from "react";
import { api } from "../api/client";
import { Server, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { VerificationResult } from "../types";
import { FaqSection } from "../components/FaqSection";

export const DnsMxCheckerPage = ({ onNavigateHome }: { onNavigateHome: () => void }) => {
  const [domainInput, setDomainInput] = useState("google.com");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e?: React.FormEvent, customDomain?: string) => {
    if (e) e.preventDefault();
    const raw = (customDomain || domainInput).trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!raw) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test via email verifier probe for domain
      const probeEmail = `probe@${raw}`;
      const data = await api.verifyEmail(probeEmail);
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resolve DNS records for domain.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const sampleDomains = ["google.com", "dropbox.com", "stripe.com", "mailinator.com", "invalid-domain-xyz.test"];

  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.2rem 0.65rem", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          <Server size={13} /> LIVE DNS & MX DIAGNOSTIC TOOL
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          DNS & MX Record Checker
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "600px", margin: "0 auto" }}>
          Inspect live mail exchange routing, domain resolution, and MX availability in real-time via Cloudflare DNS-over-HTTPS.
        </p>
      </div>

      {/* Input Box */}
      <div className="card" style={{ padding: "2rem", maxWidth: "750px", margin: "0 auto 3rem" }}>
        <form onSubmit={handleLookup} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Server size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="Enter domain name (e.g. stripe.com)..."
              style={{ width: "100%", padding: "0.8rem 1rem 0.8rem 2.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", fontSize: "0.95rem" }}
            />
          </div>
          <button type="submit" className="btn btn-black" disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1.5rem" }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span>Lookup Records</span>
          </button>
        </form>

        {/* Sample chips */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Try samples:</span>
          {sampleDomains.map((dom) => (
            <button
              key={dom}
              onClick={() => { setDomainInput(dom); handleLookup(undefined, dom); }}
              style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "4px", padding: "0.2rem 0.55rem", fontSize: "0.78rem", cursor: "pointer", color: "var(--text-main)" }}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ maxWidth: "750px", margin: "0 auto 2rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", padding: "1rem", borderRadius: "var(--radius-md)" }}>
          {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="card" style={{ padding: "2.5rem", maxWidth: "850px", margin: "0 auto 3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1.25rem", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>DOMAIN INSPECTED</span>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{domainInput}</h2>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ padding: "0.3rem 0.75rem", borderRadius: "9999px", background: result.checks.mx === "MX_FOUND" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: result.checks.mx === "MX_FOUND" ? "var(--success)" : "var(--danger)", fontWeight: 700, fontSize: "0.85rem" }}>
                {result.checks.mx === "MX_FOUND" ? "✓ MX ACTIVE" : "✗ NO MX RECORD"}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            <div style={{ background: "var(--bg-subtle)", padding: "1.25rem", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.3rem" }}>DNS RESOLUTION</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: result.checks.domain === "DOMAIN_EXISTS" ? "var(--success)" : "var(--danger)" }}>
                {result.checks.domain === "DOMAIN_EXISTS" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span>{result.checks.domain === "DOMAIN_EXISTS" ? "Resolving (A/AAAA Found)" : "Domain Non-Existent"}</span>
              </div>
            </div>

            <div style={{ background: "var(--bg-subtle)", padding: "1.25rem", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.3rem" }}>MAIL EXCHANGER (MX)</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: result.checks.mx === "MX_FOUND" ? "var(--success)" : "var(--danger)" }}>
                {result.checks.mx === "MX_FOUND" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span>{result.checks.mx === "MX_FOUND" ? "Configured Mail Server" : "No Mail Exchangers"}</span>
              </div>
            </div>

            <div style={{ background: "var(--bg-subtle)", padding: "1.25rem", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.3rem" }}>DISPOSABLE PROVIDER</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: result.checks.disposable === "NOT_DISPOSABLE" ? "var(--success)" : "var(--danger)" }}>
                {result.checks.disposable === "NOT_DISPOSABLE" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span>{result.checks.disposable === "NOT_DISPOSABLE" ? "Legitimate Provider" : "Temporary Burner Domain"}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <button className="btn btn-outline" onClick={onNavigateHome} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              Verify an Email on this Domain →
            </button>
          </div>
        </div>
      )}

      {/* Educational Guide */}
      <div className="card" style={{ padding: "2.5rem", background: "var(--bg-subtle)" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1rem" }}>Why MX & DNS Checks Matter for Deliverability</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1rem" }}>
          Before sending any email campaign or registration confirmation, inspecting the destination domain's MX (Mail Exchange) records prevents hard bounces that damage your domain sender reputation.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
          <div>
            <strong style={{ color: "var(--text-main)" }}>1. Zero-Socket Safe Probes</strong>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Unlike invasive SMTP socket connections that trigger spam firewall blocks, DoH queries inspect DNS records natively without alerting or blocking.
            </p>
          </div>
          <div>
            <strong style={{ color: "var(--text-main)" }}>2. KV Cache Edge Acceleration</strong>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Domain MX lookups are cached in Cloudflare KV for 24 hours, returning sub-50ms responses for common mail providers (Gmail, Outlook, iCloud).
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Accordion FAQ Section */}
      <FaqSection pageCategory="dns-mx" title="DNS & MX Checker FAQs" eyebrow="DNS & ROUTING FAQ" />
    </div>
  );
};
