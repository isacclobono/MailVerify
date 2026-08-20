import React from "react";
import { VerificationChecks } from "../types";
import { Check, X, HelpCircle, Shield, Server, FileText, Lock, UserCheck } from "lucide-react";

interface ChecksDetailProps {
  checks: VerificationChecks;
}

export const ChecksDetail: React.FC<ChecksDetailProps> = ({ checks }) => {
  const getStatusIcon = (passed: boolean, unknown = false) => {
    if (unknown) return <HelpCircle size={16} color="#94a3b8" />;
    return passed ? <Check size={16} color="#34d399" /> : <X size={16} color="#f87171" />;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PASS":
        return { text: "Valid Syntax", passed: true };
      case "FAIL":
        return { text: "Syntax Error", passed: false };
      case "DOMAIN_EXISTS":
        return { text: "Active & Resolving", passed: true };
      case "DOMAIN_NOT_FOUND":
        return { text: "Domain Not Found", passed: false };
      case "MX_FOUND":
        return { text: "Valid Mail Server", passed: true };
      case "NO_MX":
        return { text: "No Mail Server", passed: false };
      case "SPF_PRESENT":
        return { text: "SPF Configured", passed: true };
      case "SPF_MISSING":
        return { text: "SPF Missing", passed: false };
      case "SPF_INVALID":
        return { text: "SPF Invalid", passed: false };
      case "DMARC_PRESENT":
        return { text: "DMARC Enforced", passed: true };
      case "DMARC_MISSING":
        return { text: "DMARC Missing", passed: false };
      case "DMARC_INVALID":
        return { text: "DMARC Invalid", passed: false };
      case "NOT_DISPOSABLE":
        return { text: "Standard Provider", passed: true };
      case "DISPOSABLE":
        return { text: "Temporary / Disposable", passed: false };
      case "PERSONAL_ACCOUNT_LIKELY":
        return { text: "Personal / Direct Mailbox", passed: true };
      case "ROLE_ACCOUNT":
        return { text: "Generic Role (e.g. support@)", passed: false };
      default:
        return { text: status, unknown: true, passed: false };
    }
  };

  const items = [
    { title: "Syntax Check", icon: <FileText size={16} />, status: checks.syntax },
    { title: "Domain Resolution", icon: <Server size={16} />, status: checks.domain },
    { title: "MX Routing", icon: <Server size={16} />, status: checks.mx },
    { title: "SPF Record", icon: <Shield size={16} />, status: checks.spf },
    { title: "DMARC Policy", icon: <Lock size={16} />, status: checks.dmarc },
    { title: "Disposable Domain", icon: <Shield size={16} />, status: checks.disposable },
    { title: "Account Type", icon: <UserCheck size={16} />, status: checks.role },
  ];

  return (
    <div className="checks-grid">
      {items.map((item, idx) => {
        const info = getStatusText(item.status);
        return (
          <div key={idx} className="check-item">
            <span className="check-title">{item.title}</span>
            <div className="check-status">
              {getStatusIcon(info.passed, info.unknown)}
              <span>{info.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
