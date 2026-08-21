import { useState } from "react";
import { api } from "../api/client";
import { Shield, Search, CheckCircle2, AlertTriangle, Lock, Loader2 } from "lucide-react";
import { VerificationResult } from "../types";
import { FaqSection } from "../components/FaqSection";

export const SpfDmarcAuditPage = ({ onNavigateHome }: { onNavigateHome: () => void }) => {
  const [domainInput, setDomainInput] = useState("apple.com");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async (e?: React.FormEvent, customDomain?: string) => {
    if (e) e.preventDefault();
    const raw = (customDomain || domainInput).trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!raw) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const probeEmail = `security-audit@${raw}`;
      const data = await api.verifyEmail(probeEmail);
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to audit SPF and DMARC records.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const sampleDomains = ["apple.com", "amazon.com", "cloudflare.com", "gmail.com"];

  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          <Shield size={14} /> DOMAIN AUTHENTICATION & SPOOFING AUDIT
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
          SPF & DMARC Security Inspector
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "650px", margin: "0 auto" }}>
          Analyze email anti-spoofing policies, domain reputation alignment, and TXT security records across any domain.
        </p>
      </div>

      {/* Input Form */}
      <div className="card" style={{ padding: "2rem", maxWidth: "750px", margin: "0 auto 3rem" }}>
        <form onSubmit={handleAudit} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="Enter domain to inspect (e.g. apple.com)..."
              style={{ width: "100%", padding: "0.8rem 1rem 0.8rem 2.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", fontSize: "0.95rem" }}
            />
          </div>
          <button type="submit" className="btn btn-black" disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1.5rem" }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span>Run Security Audit</span>
          </button>
        </form>

        {/* Sample chips */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Try samples:</span>
          {sampleDomains.map((dom) => (
            <button
              key={dom}
              onClick={() => { setDomainInput(dom); handleAudit(undefined, dom); }}
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

      {/* Audit Results */}
      {result && (
        <div className="card" style={{ padding: "2.5rem", maxWidth: "850px", margin: "0 auto 3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1.25rem", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>DOMAIN AUDITED</span>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{domainInput}</h2>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ padding: "0.3rem 0.75rem", borderRadius: "9999px", background: result.checks.spf === "SPF_PRESENT" && result.checks.dmarc === "DMARC_PRESENT" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)", color: result.checks.spf === "SPF_PRESENT" && result.checks.dmarc === "DMARC_PRESENT" ? "var(--success)" : "var(--warning)", fontWeight: 700, fontSize: "0.85rem" }}>
                {result.checks.spf === "SPF_PRESENT" && result.checks.dmarc === "DMARC_PRESENT" ? "🛡️ ENFORCED ANTI-SPOOFING" : "⚠️ PARTIAL PROTECTION"}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
            {/* SPF Card */}
            <div style={{ background: "var(--bg-subtle)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontWeight: 700 }}>SPF (Sender Policy Framework)</span>
                {result.checks.spf === "SPF_PRESENT" ? (
                  <span style={{ color: "var(--success)", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem" }}><CheckCircle2 size={15} /> PASS</span>
                ) : (
                  <span style={{ color: "var(--warning)", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem" }}><AlertTriangle size={15} /> MISSING</span>
                )}
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                {result.checks.spf === "SPF_PRESENT"
                  ? "Valid SPF TXT record detected. Authorized IP ranges and mail servers are explicitly defined."
                  : "No SPF record found. Unauthorized servers may forge emails from this domain."}
              </p>
            </div>

            {/* DMARC Card */}
            <div style={{ background: "var(--bg-subtle)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontWeight: 700 }}>DMARC Policy Enforcement</span>
                {result.checks.dmarc === "DMARC_PRESENT" ? (
                  <span style={{ color: "var(--success)", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem" }}><CheckCircle2 size={15} /> ENFORCED</span>
                ) : (
                  <span style={{ color: "var(--warning)", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem" }}><AlertTriangle size={15} /> MISSING</span>
                )}
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                {result.checks.dmarc === "DMARC_PRESENT"
                  ? "DMARC policy found at _dmarc." + domainInput + ". Receiving servers are instructed on how to handle failed messages."
                  : "DMARC record missing. Mail providers cannot enforce strict reject policies on fraudulent emails."}
              </p>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <button className="btn btn-outline" onClick={onNavigateHome}>
              Verify Complete Email Deliverability →
            </button>
          </div>
        </div>
      )}

      {/* Guide Section */}
      <div className="card" style={{ padding: "2.5rem", background: "var(--bg-subtle)" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1rem" }}>Understanding SPF & DMARC in 2026</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          <div>
            <strong style={{ color: "var(--text-main)" }}>Google & Yahoo 2024+ Mandate</strong>
            <p style={{ marginTop: "0.25rem" }}>Major inbox providers require all bulk senders to have valid SPF and DMARC records configured. Unauthenticated emails are sent directly to spam or rejected.</p>
          </div>
          <div>
            <strong style={{ color: "var(--text-main)" }}>Deliverability Score Impact</strong>
            <p style={{ marginTop: "0.25rem" }}>MailVerify factors SPF and DMARC health into every verification score, flagging domains with missing authentication as <span style={{ color: "var(--warning)", fontWeight: 700 }}>RISKY</span>.</p>
          </div>
        </div>
      </div>

      {/* Dynamic Accordion FAQ Section */}
      <FaqSection pageCategory="spf-dmarc" title="SPF & DMARC FAQs" eyebrow="ANTI-SPOOFING FAQ" />
    </div>
  );
};
