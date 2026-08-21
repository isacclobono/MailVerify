import { UserCheck, Shield, Upload, History, Trash2, Zap, ArrowRight } from "lucide-react";
import { api } from "../api/client";
import { User } from "../types";

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
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          <UserCheck size={14} /> ACCOUNT GOVERNANCE & LIMITS
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
          Account Tiers & Quota Specifications
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "680px", margin: "0 auto", lineHeight: 1.6 }}>
          Understand how anonymous guest verification, Google OAuth authentication, and bulk upload capacities operate.
        </p>
      </div>

      {/* Account Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        {/* 1. 5-Check Guest Quota */}
        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ display: "inline-flex", padding: "0.75rem", background: "rgba(245, 158, 11, 0.1)", borderRadius: "var(--radius-md)", color: "var(--warning)", marginBottom: "1rem" }}>
            <Shield size={24} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>5-Check Guest Quota</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "1rem" }}>
            Visitors can verify up to 5 email addresses without an account. Rate limiting tracks client IP addresses in Cloudflare KV cache with sliding windows.
          </p>
          <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <li>• No registration or cookies required</li>
            <li>• Full syntax, DNS, and MX inspection</li>
            <li>• Resets or unlocks immediately on Google Login</li>
          </ul>
        </div>

        {/* 2. Google Login Unlocks */}
        <div className="card" style={{ padding: "2rem", border: "2px solid var(--accent-blue)" }}>
          <div style={{ display: "inline-flex", padding: "0.75rem", background: "rgba(37, 99, 235, 0.1)", borderRadius: "var(--radius-md)", color: "var(--accent-blue)", marginBottom: "1rem" }}>
            <Zap size={24} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Google Login (Unlocked Tier)</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "1rem" }}>
            Signing in with your Google account removes guest limits completely, unlocking unlimited single checks, batch verification, and export tools.
          </p>
          <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <li>• Unlimited single email validations</li>
            <li>• 30 requests/minute burst API throughput</li>
            <li>• Bearer token authentication for API use</li>
          </ul>
        </div>

        {/* 3. Bulk CSV / JSON */}
        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ display: "inline-flex", padding: "0.75rem", background: "rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-md)", color: "var(--success)", marginBottom: "1rem" }}>
            <Upload size={24} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Bulk CSV & JSON Engine</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "1rem" }}>
            Upload clean lists of up to 500 emails per batch. The Worker processes batches concurrently with real-time status reporting.
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
            Authenticated verifications are retained in D1 for 5 days so you can review deliverability trends and download past results.
          </p>
          <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <li>• Auto-purged daily at midnight by Cron</li>
            <li>• Prevents database bloat and saves storage</li>
            <li>• Instant 1-click manual account deletion</li>
          </ul>
        </div>
      </div>

      {/* CTA Box */}
      <div className="card" style={{ padding: "2.5rem", textAlign: "center", background: "var(--bg-subtle)" }}>
        {user ? (
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>You are authenticated as {user.email}</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>All developer features, unlimited checks, and bulk uploads are active.</p>
            <button className="btn btn-black" onClick={onNavigateDashboard}>
              Open Developer Dashboard →
            </button>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Ready to unlock unlimited email checks?</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Sign in with Google in 5 seconds &mdash; zero passwords, 100% free.</p>
            <a href={api.getGoogleLoginUrl()} className="btn btn-black">
              Sign in with Google →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
