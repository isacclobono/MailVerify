import { UserCheck, Shield, Upload, History, Key } from "lucide-react";
import { api } from "../api/client";
import { User } from "../types";
import { FaqSection } from "../components/FaqSection";

export const AccountQuotasPage = ({
  user,
  onNavigateDashboard,
}: {
  user: User | null;
  onNavigateDashboard: () => void;
}) => {
  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.2rem 0.65rem", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          <UserCheck size={13} /> ACCOUNT GOVERNANCE & LIMITS
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          Account Tiers & Quota Specifications
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "620px", margin: "0 auto", lineHeight: 1.55 }}>
          Understand how anonymous guest verification, Google OAuth authentication, API keys, and monthly quotas operate.
        </p>
      </div>

      {/* Account Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
        {/* 1. 5-Check Guest Quota */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "inline-flex", padding: "0.6rem", background: "rgba(245, 158, 11, 0.1)", borderRadius: "var(--radius-md)", color: "var(--warning)", marginBottom: "0.75rem" }}>
            <Shield size={20} />
          </div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.35rem" }}>5-Check Guest Quota</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.45, marginBottom: "0.75rem" }}>
            Visitors can verify up to 5 email addresses without creating an account. Rate limiting is tracked per client IP address.
          </p>
          <ul style={{ listStyle: "none", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <li>• No registration or credit card required</li>
            <li>• Full syntax, DNS, and MX inspection</li>
            <li>• Unlocks 200 monthly calls immediately on Google Login</li>
          </ul>
        </div>

        {/* 2. Google Login & API Keys */}
        <div className="card" style={{ padding: "1.5rem", border: "2px solid var(--accent-blue)" }}>
          <div style={{ display: "inline-flex", padding: "0.6rem", background: "rgba(37, 99, 235, 0.1)", borderRadius: "var(--radius-md)", color: "var(--accent-blue)", marginBottom: "0.75rem" }}>
            <Key size={20} />
          </div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.35rem" }}>200 Calls/Month Free Plan</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.45, marginBottom: "0.75rem" }}>
            Signing in with Google unlocks your private developer API keys and grants you 200 free verification calls each month.
          </p>
          <ul style={{ listStyle: "none", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <li>• 200 API calls per calendar month (resets on 1st)</li>
            <li>• Generate up to 5 active API keys (<code>mv_live_...</code>)</li>
            <li>• Pass keys via <code>X-API-Key</code> or Bearer authorization</li>
          </ul>
        </div>

        {/* 3. Bulk CSV / JSON */}
        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ display: "inline-flex", padding: "0.75rem", background: "rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-md)", color: "var(--success)", marginBottom: "1rem" }}>
            <Upload size={24} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Bulk CSV & JSON Batches</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "1rem" }}>
            Upload clean lists of emails in CSV, TXT, or JSON format. Batches deduct from your 200 monthly quota seamlessly.
          </p>
          <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <li>• Supports CSV (.csv), JSON (.json), and TSV</li>
            <li>• Download results as structured CSV / JSON</li>
            <li>• High-speed concurrency with KV deduplication</li>
          </ul>
        </div>

        {/* 4. 5-Day Rolling History */}
        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ display: "inline-flex", padding: "0.75rem", background: "rgba(124, 58, 237, 0.1)", borderRadius: "var(--radius-md)", color: "var(--accent-purple)", marginBottom: "1rem" }}>
            <History size={24} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>5-Day Rolling History</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "1rem" }}>
            Authenticated verifications are retained in encrypted D1 storage for 5 days so you can review deliverability trends.
          </p>
          <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <li>• Auto-purged daily at midnight by Cron</li>
            <li>• Prevents database bloat and saves storage</li>
            <li>• Instant 1-click manual account and key revocation</li>
          </ul>
        </div>
      </div>

      {/* CTA Box */}
      <div className="card" style={{ padding: "2.5rem", textAlign: "center", background: "var(--bg-subtle)" }}>
        {user ? (
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>You are authenticated as {user.email}</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Manage your API keys and check your monthly remaining quota.</p>
            <button className="btn btn-black" onClick={onNavigateDashboard}>
              Open Developer Dashboard & Keys →
            </button>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Ready to get your API Key?</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Sign in with Google to get 200 free API calls every month.</p>
            <a href={api.getGoogleLoginUrl()} className="btn btn-black">
              Sign in with Google →
            </a>
          </div>
        )}
      </div>

      {/* Dynamic Accordion FAQ Section */}
      <FaqSection pageCategory="quotas" title="Account & Quota FAQs" eyebrow="QUOTA & LIMITS FAQ" />
    </div>
  );
};
