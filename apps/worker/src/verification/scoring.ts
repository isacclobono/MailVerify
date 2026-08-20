import { VerificationChecks, Verdict } from "./types";

export interface ScoreResult {
  score: number; // 0 (best) to 100 (worst)
  verdict: Verdict;
}

export function calculateScore(checks: VerificationChecks): ScoreResult {
  // Immediate definitive failure conditions
  if (checks.syntax === "FAIL") {
    return { score: 100, verdict: "INVALID_SYNTAX" };
  }

  if (checks.disposable === "DISPOSABLE") {
    return { score: 95, verdict: "DISPOSABLE" };
  }

  if (checks.mx === "NO_MX") {
    return { score: 90, verdict: "NO_MX" };
  }

  if (checks.domain === "DOMAIN_NOT_FOUND") {
    return { score: 90, verdict: "LIKELY_INVALID" };
  }

  // Base score calculation for remaining checks
  let riskScore = 0;

  // Domain checks
  if (checks.domain === "UNKNOWN") {
    riskScore += 25;
  }

  // MX checks
  if (checks.mx === "UNKNOWN") {
    riskScore += 25;
  }

  // SPF checks
  if (checks.spf === "SPF_MISSING") {
    riskScore += 10;
  } else if (checks.spf === "SPF_INVALID") {
    riskScore += 20;
  } else if (checks.spf === "UNKNOWN") {
    riskScore += 5;
  }

  // DMARC checks
  if (checks.dmarc === "DMARC_MISSING") {
    riskScore += 10;
  } else if (checks.dmarc === "DMARC_INVALID") {
    riskScore += 20;
  } else if (checks.dmarc === "UNKNOWN") {
    riskScore += 5;
  }

  // Role account check
  if (checks.role === "ROLE_ACCOUNT") {
    riskScore += 30;
  }

  // Normalize score between 0 and 100
  const finalScore = Math.min(Math.max(riskScore, 0), 100);

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
  };
}
