import { Verdict } from "../types";
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert } from "lucide-react";

interface VerdictBadgeProps {
  verdict: Verdict;
  score?: number;
}

export const VerdictBadge = ({ verdict, score }: VerdictBadgeProps) => {
  switch (verdict) {
    case "LIKELY_DELIVERABLE":
      return (
        <span className="badge badge-deliverable">
          <CheckCircle2 size={15} /> Deliverable {score !== undefined && `(${100 - score}%)`}
        </span>
      );
    case "RISKY":
      return (
        <span className="badge badge-risky">
          <AlertTriangle size={15} /> Risky {score !== undefined && `(${score}% risk)`}
        </span>
      );
    case "ROLE_ACCOUNT":
      return (
        <span className="badge badge-role">
          <ShieldAlert size={15} /> Role Account
        </span>
      );
    case "DISPOSABLE":
      return (
        <span className="badge badge-invalid">
          <XCircle size={15} /> Disposable
        </span>
      );
    case "NO_MX":
      return (
        <span className="badge badge-invalid">
          <XCircle size={15} /> No Mail Server
        </span>
      );
    case "INVALID_SYNTAX":
      return (
        <span className="badge badge-invalid">
          <XCircle size={15} /> Invalid Syntax
        </span>
      );
    case "LIKELY_INVALID":
    default:
      return (
        <span className="badge badge-invalid">
          <XCircle size={15} /> Undeliverable
        </span>
      );
  }
};
