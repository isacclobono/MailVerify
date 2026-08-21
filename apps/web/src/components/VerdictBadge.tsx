import { Verdict } from "../types";
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, HelpCircle } from "lucide-react";

interface VerdictBadgeProps {
  verdict: Verdict | string;
  score?: number;
  size?: "sm" | "md" | "lg";
}

export const VerdictBadge = ({ verdict, score, size = "md" }: VerdictBadgeProps) => {
  const iconSize = size === "sm" ? 13 : size === "lg" ? 18 : 14;

  const normalized = verdict ? verdict.toUpperCase() : "UNKNOWN";

  if (normalized.includes("DELIVERABLE")) {
    return (
      <span
        className="badge badge-deliverable"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: size === "sm" ? "0.15rem 0.45rem" : size === "lg" ? "0.35rem 0.8rem" : "0.2rem 0.55rem",
          fontSize: size === "sm" ? "0.7rem" : size === "lg" ? "0.9rem" : "0.74rem",
          fontWeight: 700,
        }}
      >
        <CheckCircle2 size={iconSize} color="#059669" />
        <span>Deliverable</span>
        {score !== undefined && (
          <span style={{ opacity: 0.85, fontFamily: "var(--font-mono)", fontSize: "0.9em" }}>
            {score}/100
          </span>
        )}
      </span>
    );
  }

  if (normalized.includes("RISKY")) {
    return (
      <span
        className="badge badge-risky"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: size === "sm" ? "0.15rem 0.45rem" : size === "lg" ? "0.35rem 0.8rem" : "0.2rem 0.55rem",
          fontSize: size === "sm" ? "0.7rem" : size === "lg" ? "0.9rem" : "0.74rem",
          fontWeight: 700,
        }}
      >
        <AlertTriangle size={iconSize} color="#d97706" />
        <span>Risky</span>
        {score !== undefined && (
          <span style={{ opacity: 0.85, fontFamily: "var(--font-mono)", fontSize: "0.9em" }}>
            {score}/100
          </span>
        )}
      </span>
    );
  }

  if (normalized.includes("ROLE")) {
    return (
      <span
        className="badge badge-role"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: size === "sm" ? "0.15rem 0.45rem" : size === "lg" ? "0.35rem 0.8rem" : "0.2rem 0.55rem",
          fontSize: size === "sm" ? "0.7rem" : size === "lg" ? "0.9rem" : "0.74rem",
          fontWeight: 700,
        }}
      >
        <ShieldAlert size={iconSize} color="#7c3aed" />
        <span>Role Account</span>
      </span>
    );
  }

  if (normalized.includes("DISPOSABLE") || normalized.includes("BURNER")) {
    return (
      <span
        className="badge badge-invalid"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: size === "sm" ? "0.15rem 0.45rem" : size === "lg" ? "0.35rem 0.8rem" : "0.2rem 0.55rem",
          fontSize: size === "sm" ? "0.7rem" : size === "lg" ? "0.9rem" : "0.74rem",
          fontWeight: 700,
        }}
      >
        <XCircle size={iconSize} color="#dc2626" />
        <span>Disposable Burner</span>
      </span>
    );
  }

  if (normalized.includes("NO_MX")) {
    return (
      <span
        className="badge badge-invalid"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: size === "sm" ? "0.15rem 0.45rem" : size === "lg" ? "0.35rem 0.8rem" : "0.2rem 0.55rem",
          fontSize: size === "sm" ? "0.7rem" : size === "lg" ? "0.9rem" : "0.74rem",
          fontWeight: 700,
        }}
      >
        <XCircle size={iconSize} color="#dc2626" />
        <span>No MX Server</span>
      </span>
    );
  }

  if (normalized.includes("SYNTAX")) {
    return (
      <span
        className="badge badge-invalid"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: size === "sm" ? "0.15rem 0.45rem" : size === "lg" ? "0.35rem 0.8rem" : "0.2rem 0.55rem",
          fontSize: size === "sm" ? "0.7rem" : size === "lg" ? "0.9rem" : "0.74rem",
          fontWeight: 700,
        }}
      >
        <XCircle size={iconSize} color="#dc2626" />
        <span>Invalid Syntax</span>
      </span>
    );
  }

  if (normalized === "UNKNOWN") {
    return (
      <span
        className="badge"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: size === "sm" ? "0.15rem 0.45rem" : size === "lg" ? "0.35rem 0.8rem" : "0.2rem 0.55rem",
          fontSize: size === "sm" ? "0.7rem" : size === "lg" ? "0.9rem" : "0.74rem",
          fontWeight: 700,
          background: "var(--bg-subtle)",
          color: "var(--text-muted)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <HelpCircle size={iconSize} color="var(--text-muted)" />
        <span>Unknown</span>
      </span>
    );
  }

  return (
    <span
      className="badge badge-invalid"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: size === "sm" ? "0.15rem 0.45rem" : size === "lg" ? "0.35rem 0.8rem" : "0.2rem 0.55rem",
        fontSize: size === "sm" ? "0.7rem" : size === "lg" ? "0.9rem" : "0.74rem",
        fontWeight: 700,
      }}
    >
      <XCircle size={iconSize} color="#dc2626" />
      <span>Undeliverable</span>
      {score !== undefined && (
        <span style={{ opacity: 0.85, fontFamily: "var(--font-mono)", fontSize: "0.9em" }}>
          {score}/100
        </span>
      )}
    </span>
  );
};
