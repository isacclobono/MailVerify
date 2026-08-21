import { FormEvent } from "react";
import { Search, Loader2 } from "lucide-react";
import { VerificationResult } from "../../types";
import { VerdictBadge } from "../VerdictBadge";
import { ChecksDetail } from "../ChecksDetail";

interface DashboardSingleTabProps {
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  result: VerificationResult | null;
  error: string | null;
  onVerify: (e: FormEvent) => void;
}

export const DashboardSingleTab = ({
  email,
  setEmail,
  loading,
  result,
  error,
  onVerify,
}: DashboardSingleTabProps) => {
  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.35rem" }}>
        Single Address Real-Time Verification
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1.25rem" }}>
        Executes real-time DNS-over-HTTPS, MX validation, SPF/DMARC anti-spoofing analysis, and disposable burner checks.
      </p>

      <form onSubmit={onVerify} style={{ display: "flex", gap: "0.6rem" }}>
        <input
          type="email"
          className="clean-input"
          style={{ flex: 1 }}
          placeholder="e.g. name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="btn btn-black"
          disabled={loading || !email.trim()}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap", padding: "0.6rem 1rem" }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          <span>Verify Now</span>
        </button>
      </form>

      {error && (
        <div style={{ color: "#dc2626", background: "#fef2f2", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)", marginTop: "0.75rem", fontSize: "0.82rem" }}>
          {error}
        </div>
      )}

      {result && (
        <div className="result-card" style={{ marginTop: "1.25rem" }}>
          {result.did_you_mean && (
            <div
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div style={{ fontSize: "0.82rem", color: "#92400e" }}>
                💡 Possible typo detected. Did you mean <strong>{result.did_you_mean}</strong>?
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setEmail(result.did_you_mean || "")}
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.55rem", borderColor: "#f59e0b", color: "#b45309" }}
              >
                Apply {result.did_you_mean} →
              </button>
            </div>
          )}

          <div className="result-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.2rem" }}>
                <span className="section-eyebrow">VERDICT</span>
                {result.confidence !== undefined && (
                  <span style={{ fontSize: "0.68rem", padding: "0.15rem 0.45rem", borderRadius: "9999px", background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", fontWeight: 700 }}>
                    {Math.round(result.confidence * 100)}% Confidence
                  </span>
                )}
                {result.is_free_provider && (
                  <span style={{ fontSize: "0.68rem", padding: "0.15rem 0.45rem", borderRadius: "9999px", background: "rgba(100, 116, 139, 0.1)", color: "var(--text-muted)", fontWeight: 600 }}>
                    Consumer Mailbox
                  </span>
                )}
              </div>
              <div className="result-email">{result.email}</div>
            </div>
            <VerdictBadge verdict={result.verdict} score={result.score} />
          </div>

          <ChecksDetail checks={result.checks} />

          {result.reasons && result.reasons.length > 0 && (
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {result.reasons.map((r, i) => (
                <span key={i} style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)" }}>
                  {r.replace("REASON_", "")}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
