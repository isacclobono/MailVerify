export type Verdict =
  | "LIKELY_DELIVERABLE"
  | "RISKY"
  | "LIKELY_INVALID"
  | "DISPOSABLE"
  | "ROLE_ACCOUNT"
  | "NO_MX"
  | "INVALID_SYNTAX"
  | "UNKNOWN";

export type SyntaxCheck = "PASS" | "FAIL";
export type DomainCheck = "DOMAIN_EXISTS" | "DOMAIN_NOT_FOUND" | "UNKNOWN";
export type MXCheck = "MX_FOUND" | "NO_MX" | "UNKNOWN";
export type SPFCheck = "SPF_PRESENT" | "SPF_MISSING" | "SPF_INVALID" | "UNKNOWN";
export type DMARCCheck = "DMARC_PRESENT" | "DMARC_MISSING" | "DMARC_INVALID" | "UNKNOWN";
export type DisposableCheck = "DISPOSABLE" | "NOT_DISPOSABLE" | "UNKNOWN";
export type RoleCheck = "ROLE_ACCOUNT" | "PERSONAL_ACCOUNT_LIKELY" | "UNKNOWN";
export type CatchAllCheck = "CATCH_ALL" | "NOT_CATCH_ALL" | "UNKNOWN";
export type SMTPCheck = "SMTP_EXISTS" | "SMTP_NOT_FOUND" | "UNKNOWN";
export type FreeProviderCheck = "FREE_PROVIDER" | "BUSINESS_CORPORATE" | "UNKNOWN";

export interface VerificationChecks {
  syntax: SyntaxCheck;
  domain: DomainCheck;
  mx: MXCheck;
  spf: SPFCheck;
  dmarc: DMARCCheck;
  disposable: DisposableCheck;
  role: RoleCheck;
  catch_all: CatchAllCheck;
  smtp: SMTPCheck;
  free_provider: FreeProviderCheck;
}

export interface VerificationResult {
  id?: string;
  email: string;
  normalized_email: string;
  verdict: Verdict;
  score: number;
  confidence: number;
  is_free_provider: boolean;
  did_you_mean: string | null;
  reasons: string[];
  checks: VerificationChecks;
  created_at: string;
  remaining_anonymous_checks?: number;
}
