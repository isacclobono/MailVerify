import { FormEvent } from "react";
import { VerificationResult } from "../types";
import { api } from "../api/client";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { VerdictBadge } from "./VerdictBadge";
import { ChecksDetail } from "./ChecksDetail";
import { CodeSnippet } from "./CodeSnippet";

interface LiveTesterProps {
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  result: VerificationResult | null;
  error: string | null;
  loginRequired: boolean;
  onVerify: (e?: FormEvent, customEmail?: string) => void;
  onTryEmail: (sampleEmail: string) => void;
}

export const LiveTester = ({
  email,
  setEmail,
  loading,
  result,
  error,
  loginRequired,
  onVerify,
  onTryEmail,
}: LiveTesterProps) => {
  return (
    <section id="tester" className="live-tester-card">
      <div style={{ marginBottom: "1rem" }}>
        <span className="section-eyebrow">LIVE INTERACTIVE TESTER</span>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>
          Test Any Email Address in Real-Time
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.2rem" }}>
          Execute multi-stage verification across Cloudflare DNS-over-HTTPS, SPF/DMARC policies, and burner databases.
        </p>
      </div>

      <form onSubmit={onVerify} className="search-input-group">
        <input
          type="text"
          className="clean-input"
          placeholder="Enter an email to inspect (e.g. name@domain.com)..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn btn-black" disabled={loading || !email.trim()}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          <span>Run Test</span>
        </button>
      </form>

      {error && (
        <div
          style={{
            padding: "0.65rem 0.85rem",
            background: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
            borderRadius: "var(--radius-md)",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
            fontSize: "0.82rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
          {loginRequired && (
            <a
              href={api.getGoogleLoginUrl()}
              className="btn btn-black"
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem" }}
            >
              Sign in with Google
            </a>
          )}
        </div>
      )}

      {/* Live Verification Result Box */}
      {result && (
        <div className="result-card">
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
                onClick={() => {
                  setEmail(result.did_you_mean || "");
                  onTryEmail(result.did_you_mean || "");
                }}
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.55rem", borderColor: "#f59e0b", color: "#b45309" }}
              >
                Verify {result.did_you_mean} →
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

      {/* Code Snippet Preview */}
      <div style={{ marginTop: "1.75rem" }}>
        <span className="section-eyebrow">INTEGRATION CODE</span>
        <CodeSnippet emailSample={email || "alex@example.com"} />
      </div>
    </section>
  );
};
