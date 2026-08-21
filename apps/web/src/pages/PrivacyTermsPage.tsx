import { ShieldCheck, Trash2, Lock } from "lucide-react";
import { FaqSection } from "../components/FaqSection";

export const PrivacyTermsPage = () => {
  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "0.2rem 0.65rem", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          <ShieldCheck size={13} /> PRIVACY & DATA GOVERNANCE
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.35rem" }}>Privacy Policy & Terms of Service</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          Last updated: August 2026 · Committed to zero data hoarding and privacy by design.
        </p>
      </div>

      {/* Core Highlights */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        <div className="card" style={{ padding: "1.25rem" }}>
          <Trash2 size={20} color="var(--accent-coral)" style={{ marginBottom: "0.5rem" }} />
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.25rem" }}>5-Day Auto Retention Purge</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.45 }}>
            All email verification logs and bulk job artifacts are automatically and permanently deleted from Cloudflare D1 after 5 days.
          </p>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <Lock size={20} color="var(--accent-blue)" style={{ marginBottom: "0.5rem" }} />
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.25rem" }}>Zero Data Selling</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.45 }}>
            We do not sell, share, or monetize verified email addresses. Lookups are processed strictly in-memory and in encrypted D1 storage.
          </p>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <ShieldCheck size={20} color="var(--accent-green)" style={{ marginBottom: "0.5rem" }} />
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.25rem" }}>1-Click Full Data Deletion</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.45 }}>
            Logged-in users can delete their entire account, Google identity links, history, and active sessions instantly via <code>DELETE /api/account</code>.
          </p>
        </div>
      </div>

      {/* Detailed Legal Sections */}
      <div className="card" style={{ padding: "2rem", lineHeight: 1.6, fontSize: "0.88rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>1. Information We Collect</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem" }}>
          When you use MailVerify as a guest, we only process the target email address to compute DNS/MX deliverability. When signing in with Google OAuth, we receive your Google ID, name, email address, and avatar picture to establish your user session.
        </p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>2. How We Use Data</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem" }}>
          We use processed email addresses exclusively to perform requested verification algorithms (RFC 5322 syntax validation, DNS-over-HTTPS resolution, MX/SPF/DMARC checks). We do not send probe spam emails or connect unauthorized sockets to remote mail servers.
        </p>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>3. Data Storage & Automated 5-Day Purge</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem" }}>
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

      {/* Dynamic Accordion FAQ Section */}
      <FaqSection pageCategory="privacy" title="Privacy & Data Governance FAQs" eyebrow="DATA PRIVACY FAQ" />
    </div>
  );
};
