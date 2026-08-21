import { useState, useEffect, FormEvent } from "react";
import { Search, Loader2, RotateCcw, ShieldCheck, AlertTriangle, XCircle } from "lucide-react";
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
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      setLoadingStep(1);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 260);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const getVerdictTakeaway = (result: VerificationResult) => {
    if (result.verdict === "LIKELY_DELIVERABLE") {
      return {
        title: "Safe to Send",
        description: "This mailbox is fully active, reachable, and published valid DNS/MX mail exchanger records.",
        bg: "rgba(16, 185, 129, 0.06)",
        border: "1px solid rgba(16, 185, 129, 0.25)",
        color: "#047857",
        icon: <ShieldCheck size={24} color="#059669" />,
      };
    }
    if (result.verdict.includes("RISKY") || result.verdict.includes("ROLE")) {
      return {
        title: "Accept with Caution",
        description: "This address has elevated risk factors (generic team mailbox, catch-all routing, or missing anti-spoofing policy).",
        bg: "rgba(245, 158, 11, 0.06)",
        border: "1px solid rgba(245, 158, 11, 0.25)",
        color: "#b45309",
        icon: <AlertTriangle size={24} color="#d97706" />,
      };
    }
    return {
      title: "Do Not Send",
      description: "Emails sent to this address will likely bounce, trigger delivery failure, or hit a temporary burner mailbox.",
      bg: "rgba(239, 68, 68, 0.06)",
      border: "1px solid rgba(239, 68, 68, 0.25)",
      color: "#b91c1c",
      icon: <XCircle size={24} color="#dc2626" />,
    };
  };

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
        Single Address Real-Time Verification
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1.25rem" }}>
        Execute multi-stage verification across Cloudflare DNS-over-HTTPS, SPF/DMARC anti-spoofing policies, and burner databases.
      </p>

      {/* Input Form */}
      <form onSubmit={onVerify} style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem" }}>
        <input
          type="email"
          className="clean-input"
          style={{ flex: 1 }}
          placeholder="e.g. name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <button
          type="submit"
          className="btn btn-black"
          disabled={loading || !email.trim()}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap", padding: "0.6rem 1rem" }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          <span>{loading ? "Verifying..." : "Verify Now"}</span>
        </button>
      </form>

      {/* Step-by-Step Progress Indicator */}
      {loading && (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.65rem" }}>
            <Loader2 size={15} className="animate-spin" color="var(--accent-blue)" />
            <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#0f172a" }}>
              Verifying address across edge infrastructure...
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.4rem", fontSize: "0.75rem" }}>
            <div style={{ color: loadingStep >= 1 ? "#059669" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span>{loadingStep >= 1 ? "✓" : "○"}</span>
              <span>1. Validating syntax</span>
            </div>
            <div style={{ color: loadingStep >= 2 ? "#059669" : loadingStep === 1 ? "var(--accent-blue)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span>{loadingStep >= 2 ? "✓" : loadingStep === 1 ? "●" : "○"}</span>
              <span>2. Resolving MX records</span>
            </div>
            <div style={{ color: loadingStep >= 3 ? "#059669" : loadingStep === 2 ? "var(--accent-blue)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span>{loadingStep >= 3 ? "✓" : loadingStep === 2 ? "●" : "○"}</span>
              <span>3. SPF/DMARC policy</span>
            </div>
            <div style={{ color: loadingStep >= 4 ? "#059669" : loadingStep === 3 ? "var(--accent-blue)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span>{loadingStep >= 4 ? "✓" : loadingStep === 3 ? "●" : "○"}</span>
              <span>4. Burner domain risk</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: "#dc2626", background: "#fef2f2", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "0.82rem" }}>
          {error}
        </div>
      )}

      {result && (
        <div className="result-card" style={{ marginTop: "1rem" }}>
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

          {/* Outcome Takeaway Banner */}
          {(() => {
            const takeaway = getVerdictTakeaway(result);
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.85rem",
                  padding: "1rem 1.15rem",
                  background: takeaway.bg,
                  border: takeaway.border,
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ marginTop: "2px" }}>{takeaway.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: takeaway.color }}>
                      {takeaway.title}
                    </div>
                    <VerdictBadge verdict={result.verdict} score={result.score} size="lg" />
                  </div>
                  <p style={{ color: "#334155", fontSize: "0.85rem", margin: "0.25rem 0 0 0", lineHeight: 1.45 }}>
                    {takeaway.description}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Target Address Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.04em" }}>
                INSPECTED TARGET
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "#0f172a" }}>
                {result.email}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.4rem" }}>
              {result.confidence !== undefined && (
                <span style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem", borderRadius: "9999px", background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", fontWeight: 700 }}>
                  {Math.round(result.confidence * 100)}% Confidence
                </span>
              )}
              {result.is_free_provider && (
                <span style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem", borderRadius: "9999px", background: "rgba(100, 116, 139, 0.1)", color: "var(--text-muted)", fontWeight: 600 }}>
                  Consumer Mailbox
                </span>
              )}
            </div>
          </div>

          <ChecksDetail checks={result.checks} rawPayload={result as unknown as Record<string, unknown>} />

          {result.reasons && result.reasons.length > 0 && (
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {result.reasons.map((r, i) => (
                <span key={i} style={{ fontSize: "0.68rem", padding: "0.15rem 0.45rem", borderRadius: "4px", background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)" }}>
                  {r.replace("REASON_", "")}
                </span>
              ))}
            </div>
          )}

          {/* Action Bar */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.25rem", paddingTop: "0.85rem", borderTop: "1px solid var(--border-subtle)" }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setEmail("");
                const inputEl = document.querySelector('input[type="email"]') as HTMLInputElement;
                inputEl?.focus();
              }}
              style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
            >
              <RotateCcw size={13} />
              <span>Verify Another Email</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
