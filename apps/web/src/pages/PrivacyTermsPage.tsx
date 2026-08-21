import { ShieldCheck, Trash2, Lock, FileText, CheckCircle2 } from "lucide-react";

export const PrivacyTermsPage = () => {
  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          <ShieldCheck size={14} /> PRIVACY & DATA GOVERNANCE
        </div>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Privacy Policy & Terms of Service</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
          Last updated: August 2026 · Committed to zero data hoarding and privacy by design.
        </p>
      </div>

      {/* Core Highlights */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "3rem" }}>
        <div className="card" style={{ padding: "1.5rem" }}>
          <Trash2 size={24} color="var(--accent-coral)" style={{ marginBottom: "0.75rem" }} />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.3rem" }}>5-Day Auto Retention Purge</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
            All email verification logs and bulk job artifacts are automatically and permanently deleted from Cloudflare D1 after 5 days.
          </p>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <Lock size={24} color="var(--accent-blue)" style={{ marginBottom: "0.75rem" }} />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.3rem" }}>Zero Data Selling</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
            We do not sell, share, or monetize verified email addresses. Lookups are processed strictly in-memory and in encrypted D1 storage.
          </p>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <ShieldCheck size={24} color="var(--accent-green)" style={{ marginBottom: "0.75rem" }} />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.3rem" }}>1-Click Full Data Deletion</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
            Logged-in users can delete their entire account, Google identity links, history, and active sessions instantly via <code>DELETE /api/account</code>.
          </p>
        </div>
      </div>

      {/* Detailed Legal Sections */}
      <div className="card" style={{ padding: "2.5rem", lineHeight: 1.7, fontSize: "0.95rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.75rem" }}>1. Information We Collect</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          When you use MailVerify as a guest, we only process the target email address to compute DNS/MX deliverability. When signing in with Google OAuth, we receive your Google ID, name, email address, and avatar picture to establish your user session.
        </p>

        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.75rem" }}>2. How We Use Data</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          We use processed email addresses exclusively to perform requested verification algorithms (RFC 5322 syntax validation, DNS-over-HTTPS resolution, MX/SPF/DMARC checks). We do not send probe spam emails or connect unauthorized sockets to remote mail servers.
        </p>

        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.75rem" }}>3. Data Storage & Automated 5-Day Purge</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Application state is stored in Cloudflare D1 SQLite databases within Cloudflare's compliant data centers. A Cloudflare Cron Trigger (<code>0 0 * * *</code>) executes every 24 hours to automatically purge all verification logs and bulk job results exceeding 5 days of age.
        </p>

        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.75rem" }}>4. Terms of Service & Acceptable Use</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          MailVerify is provided as-is without warranties under the MIT Open Source License. Users agree not to abuse or attempt denial-of-service against the API or third-party DNS infrastructure. Rate limits (5 req/min anonymous, 30 req/min authenticated) are strictly enforced.
        </p>

        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.75rem" }}>5. GDPR & California Privacy Compliance</h2>
        <p style={{ color: "var(--text-muted)" }}>
          Under GDPR and CCPA, you have the right to access and erase your personal data at any time. You can execute immediate deletion through your dashboard or by sending a <code>DELETE /api/account</code> request.
        </p>
      </div>
    </div>
  );
};
