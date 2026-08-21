import { useState } from "react";
import { VerificationChecks } from "../types";
import { 
  Check, 
  AlertTriangle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  CheckCheck, 
  ShieldCheck, 
  Server, 
  Lock, 
  FileCheck2, 
  UserCheck,
  Flame
} from "lucide-react";
import { toast } from "sonner";

interface ChecksDetailProps {
  checks: VerificationChecks;
  rawPayload?: Record<string, unknown> | null;
}

export const ChecksDetail = ({ checks, rawPayload }: ChecksDetailProps) => {
  const [showTechnical, setShowTechnical] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const getSignalStatus = (status: string) => {
    switch (status) {
      case "PASS":
        return { label: "Valid RFC 5322", passed: true, icon: <Check size={14} color="#059669" /> };
      case "FAIL":
        return { label: "Malformed Syntax", passed: false, icon: <X size={14} color="#dc2626" /> };
      case "DOMAIN_EXISTS":
        return { label: "Active Domain", passed: true, icon: <Check size={14} color="#059669" /> };
      case "DOMAIN_NOT_FOUND":
        return { label: "Domain Unresolved", passed: false, icon: <X size={14} color="#dc2626" /> };
      case "MX_FOUND":
        return { label: "Mail Exchanger Active", passed: true, icon: <Check size={14} color="#059669" /> };
      case "NO_MX":
        return { label: "No Mail Server", passed: false, icon: <X size={14} color="#dc2626" /> };
      case "SPF_PRESENT":
        return { label: "SPF Configured", passed: true, icon: <Check size={14} color="#059669" /> };
      case "SPF_MISSING":
        return { label: "SPF Missing", warning: true, icon: <AlertTriangle size={14} color="#d97706" /> };
      case "SPF_INVALID":
        return { label: "SPF Misconfigured", passed: false, icon: <X size={14} color="#dc2626" /> };
      case "DMARC_PRESENT":
        return { label: "DMARC Enforced", passed: true, icon: <Check size={14} color="#059669" /> };
      case "DMARC_MISSING":
        return { label: "DMARC Missing", warning: true, icon: <AlertTriangle size={14} color="#d97706" /> };
      case "DMARC_INVALID":
        return { label: "DMARC Misconfigured", passed: false, icon: <X size={14} color="#dc2626" /> };
      case "NOT_DISPOSABLE":
        return { label: "Legitimate Mailbox", passed: true, icon: <Check size={14} color="#059669" /> };
      case "DISPOSABLE":
        return { label: "Burner / Temporary", passed: false, icon: <Flame size={14} color="#dc2626" /> };
      case "PERSONAL_ACCOUNT_LIKELY":
        return { label: "Individual Mailbox", passed: true, icon: <Check size={14} color="#059669" /> };
      case "ROLE_ACCOUNT":
        return { label: "Generic Role (e.g. sales@)", warning: true, icon: <AlertTriangle size={14} color="#d97706" /> };
      case "FREE_PROVIDER":
        return { label: "Consumer (Gmail/Outlook)", passed: true, icon: <Check size={14} color="#059669" /> };
      case "BUSINESS_CORPORATE":
        return { label: "Corporate Business", passed: true, icon: <Check size={14} color="#059669" /> };
      default:
        return { label: status, warning: true, icon: <AlertTriangle size={14} color="#94a3b8" /> };
    }
  };

  const coreSignals = [
    { title: "Syntax Format", icon: <FileCheck2 size={15} />, status: checks.syntax },
    { title: "MX Routing", icon: <Server size={15} />, status: checks.mx },
    { title: "Disposable Burner", icon: <ShieldCheck size={15} />, status: checks.disposable },
    { title: "SPF Protection", icon: <ShieldCheck size={15} />, status: checks.spf },
    { title: "DMARC Policy", icon: <Lock size={15} />, status: checks.dmarc },
    { title: "Mailbox Type", icon: <UserCheck size={15} />, status: checks.role },
  ];

  const handleCopyJson = () => {
    if (!rawPayload) return;
    navigator.clipboard.writeText(JSON.stringify(rawPayload, null, 2));
    setCopiedJson(true);
    toast.info("Audit JSON Copied", {
      description: "Complete response payload copied to clipboard.",
    });
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      {/* Core Summary Signal Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.65rem",
        }}
      >
        {coreSignals.map((signal, idx) => {
          const info = getSignalStatus(signal.status);
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.65rem 0.85rem",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "var(--text-muted)", display: "flex" }}>{signal.icon}</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#334155" }}>
                  {signal.title}
                </span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.74rem", fontWeight: 700 }}>
                {info.icon}
                <span
                  style={{
                    color: info.passed ? "#047857" : info.warning ? "#b45309" : "#b91c1c",
                  }}
                >
                  {info.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progressive Disclosure Toggle */}
      <div style={{ marginTop: "1rem" }}>
        <button
          type="button"
          onClick={() => setShowTechnical(!showTechnical)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            background: "none",
            border: "none",
            color: "var(--accent-blue)",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span>{showTechnical ? "Hide technical diagnostic details" : "Show technical DNS & DoH details"}</span>
          {showTechnical ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showTechnical && (
          <div
            style={{
              marginTop: "0.75rem",
              background: "#0f172a",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              color: "#e2e8f0",
              fontSize: "0.78rem",
              fontFamily: "var(--font-mono)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.72rem" }}>
                RESOLVER TELEMETRY & AUDIT PAYLOAD
              </span>
              {rawPayload && (
                <button
                  type="button"
                  onClick={handleCopyJson}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                    fontSize: "0.7rem",
                    padding: "0.25rem 0.55rem",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                  }}
                >
                  {copiedJson ? <CheckCheck size={12} color="#34d399" /> : <Copy size={12} />}
                  <span>{copiedJson ? "Copied" : "Copy JSON"}</span>
                </button>
              )}
            </div>

            <pre style={{ margin: 0, overflowX: "auto", color: "#38bdf8", lineHeight: 1.6, fontSize: "0.76rem" }}>
              {JSON.stringify(rawPayload || checks, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
