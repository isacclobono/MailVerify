import { normalizeEmail } from "./normalize";
import { checkSyntax } from "./syntax";
import { checkDomain } from "./domain";
import { checkMX } from "./mx";
import { checkSPF } from "./spf";
import { checkDMARC } from "./dmarc";
import { checkDisposable } from "./disposable";
import { checkRoleAccount } from "./role";
import { isFreeEmailProvider } from "./free-providers";
import { detectTypo } from "./typos";
import { calculateScore } from "./scoring";
import { VerificationResult, VerificationChecks } from "./types";
import { CacheService } from "../cache/cache";

export async function verifyEmail(
  rawEmail: string,
  cache?: CacheService
): Promise<VerificationResult> {
  const { normalized, localPart, domain, isValidFormat } = normalizeEmail(rawEmail);
  const now = new Date().toISOString();

  // 1. Domain typo & suggestion check
  const typoInfo = detectTypo(domain, localPart);

  // 2. Free email provider classification
  const isFree = isFreeEmailProvider(domain);

  // 3. Syntax check
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
      free_provider: isFree ? "FREE_PROVIDER" : "BUSINESS_CORPORATE",
    };

    const { score, verdict, confidence, reasons } = calculateScore(checks);

    return {
      email: rawEmail,
      normalized_email: normalized || rawEmail.toLowerCase(),
      verdict,
      score,
      confidence,
      is_free_provider: isFree,
      did_you_mean: typoInfo.suggestedEmail,
      reasons,
      checks,
      created_at: now,
    };
  }

  // 4. Parallel execution of DNS and heuristic intelligence checks
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
    free_provider: isFree ? "FREE_PROVIDER" : "BUSINESS_CORPORATE",
  };

  // 5. Final Scoring, Confidence & Reason Code Generation
  const { score, verdict, confidence, reasons } = calculateScore(checks);

  return {
    email: rawEmail,
    normalized_email: normalized,
    verdict,
    score,
    confidence,
    is_free_provider: isFree,
    did_you_mean: typoInfo.suggestedEmail,
    reasons,
    checks,
    created_at: now,
  };
}
