import { normalizeEmail } from "./normalize";
import { checkSyntax } from "./syntax";
import { checkDomain } from "./domain";
import { checkMX } from "./mx";
import { checkSPF } from "./spf";
import { checkDMARC } from "./dmarc";
import { checkDisposable } from "./disposable";
import { checkRoleAccount } from "./role";
import { calculateScore } from "./scoring";
import { VerificationResult, VerificationChecks } from "./types";
import { CacheService } from "../cache/cache";

export async function verifyEmail(
  rawEmail: string,
  cache?: CacheService
): Promise<VerificationResult> {
  const { normalized, localPart, domain, isValidFormat } = normalizeEmail(rawEmail);
  const now = new Date().toISOString();

  // 1. Syntax check
  const syntax = isValidFormat ? checkSyntax(normalized) : "FAIL";

  if (syntax === "FAIL") {
    const checks: VerificationChecks = {
      syntax: "FAIL",
      domain: "UNKNOWN",
      mx: "UNKNOWN",
      spf: "UNKNOWN",
      dmarc: "UNKNOWN",
      disposable: "UNKNOWN",
      role: "UNKNOWN",
      catch_all: "UNKNOWN",
      smtp: "UNKNOWN",
    };

    const { score, verdict } = calculateScore(checks);

    return {
      email: rawEmail,
      normalized_email: normalized || rawEmail.toLowerCase(),
      verdict,
      score,
      checks,
      created_at: now,
    };
  }

  // 2. Parallel execution of DNS and heuristic checks
  const [domainResult, mxResult, spfResult, dmarcResult, disposableResult] =
    await Promise.all([
      checkDomain(domain, cache),
      checkMX(domain, cache),
      checkSPF(domain, cache),
      checkDMARC(domain, cache),
      checkDisposable(domain, cache),
    ]);

  const roleResult = checkRoleAccount(localPart);

  const checks: VerificationChecks = {
    syntax: "PASS",
    domain: domainResult,
    mx: mxResult,
    spf: spfResult,
    dmarc: dmarcResult,
    disposable: disposableResult,
    role: roleResult,
    catch_all: "UNKNOWN",
    smtp: "UNKNOWN",
  };

  // 3. Final Scoring and Verdict
  const { score, verdict } = calculateScore(checks);

  return {
    email: rawEmail,
    normalized_email: normalized,
    verdict,
    score,
    checks,
    created_at: now,
  };
}
