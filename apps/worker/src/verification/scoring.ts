import { VerificationChecks, Verdict } from "./types";

export interface ScoreResult {
  score: number; // 0 (best) to 100 (worst)
  verdict: Verdict;
  confidence: number; // 0.0 to 1.0
  reasons: string[];
}

export function calculateScore(checks: VerificationChecks): ScoreResult {
  const reasons: string[] = [];

  // Immediate definitive failure conditions
  if (checks.syntax === "FAIL") {
    reasons.push("REASON_INVALID_SYNTAX");
    return { score: 100, verdict: "INVALID_SYNTAX", confidence: 1.0, reasons };
  }

  if (checks.disposable === "DISPOSABLE") {
    reasons.push("REASON_DISPOSABLE_MAILBOX");
    return { score: 95, verdict: "DISPOSABLE", confidence: 0.99, reasons };
  }

  if (checks.mx === "NO_MX") {
    reasons.push("REASON_NO_MX_RECORDS");
    return { score: 90, verdict: "NO_MX", confidence: 0.95, reasons };
  }

  if (checks.domain === "DOMAIN_NOT_FOUND") {
    reasons.push("REASON_DOMAIN_NOT_FOUND");
    return { score: 90, verdict: "LIKELY_INVALID", confidence: 0.95, reasons };
  }

  // Base score calculation for remaining checks
  let riskScore = 0;
  let confidenceScore = 0.95;

  // Free provider vs business
  if (checks.free_provider === "FREE_PROVIDER") {
    reasons.push("REASON_FREE_CONSUMER_MAILBOX");
  } else if (checks.free_provider === "BUSINESS_CORPORATE") {
    reasons.push("REASON_BUSINESS_CORPORATE_DOMAIN");
  }

  // Domain checks
  if (checks.domain === "DOMAIN_EXISTS") {
    reasons.push("REASON_DOMAIN_ACTIVE");
  } else if (checks.domain === "UNKNOWN") {
    riskScore += 25;
    confidenceScore -= 0.15;
    reasons.push("REASON_DOMAIN_DNS_UNRESOLVED");
  }

  // MX checks
  if (checks.mx === "MX_FOUND") {
    reasons.push("REASON_MX_SERVERS_CONFIGURED");
  } else if (checks.mx === "UNKNOWN") {
    riskScore += 25;
    confidenceScore -= 0.15;
    reasons.push("REASON_MX_QUERY_TIMEOUT");
  }

  // SPF checks
  if (checks.spf === "SPF_PRESENT") {
    reasons.push("REASON_SPF_POLICY_VALID");
  } else if (checks.spf === "SPF_MISSING") {
    riskScore += 10;
    reasons.push("REASON_SPF_POLICY_MISSING");
  } else if (checks.spf === "SPF_INVALID") {
    riskScore += 20;
    reasons.push("REASON_SPF_POLICY_MALFORMED");
  }

  // DMARC checks
  if (checks.dmarc === "DMARC_PRESENT") {
    reasons.push("REASON_DMARC_POLICY_ENFORCED");
  } else if (checks.dmarc === "DMARC_MISSING") {
    riskScore += 10;
    reasons.push("REASON_DMARC_POLICY_MISSING");
  } else if (checks.dmarc === "DMARC_INVALID") {
    riskScore += 20;
    reasons.push("REASON_DMARC_POLICY_MALFORMED");
  }

  // Role account check
  if (checks.role === "ROLE_ACCOUNT") {
    riskScore += 30;
    reasons.push("REASON_ROLE_BASED_ADDRESS");
  }

  // Normalize score between 0 and 100
  const finalScore = Math.min(Math.max(riskScore, 0), 100);
  const finalConfidence = Math.min(Math.max(Number(confidenceScore.toFixed(2)), 0.5), 1.0);

  // Assign Verdict based on score and characteristics
  let verdict: Verdict = "LIKELY_DELIVERABLE";

  if (checks.role === "ROLE_ACCOUNT") {
    verdict = "ROLE_ACCOUNT";
  } else if (finalScore >= 70) {
    verdict = "LIKELY_INVALID";
  } else if (finalScore >= 30) {
    verdict = "RISKY";
  } else {
    verdict = "LIKELY_DELIVERABLE";
  }

  return {
    score: finalScore,
    verdict,
    confidence: finalConfidence,
    reasons,
  };
}
