export type Verdict =
  | "LIKELY_DELIVERABLE"
  | "RISKY"
  | "LIKELY_INVALID"
  | "DISPOSABLE"
  | "ROLE_ACCOUNT"
  | "NO_MX"
  | "INVALID_SYNTAX"
  | "UNKNOWN";

export interface VerificationChecks {
  syntax: "PASS" | "FAIL";
  domain: "DOMAIN_EXISTS" | "DOMAIN_NOT_FOUND" | "UNKNOWN";
  mx: "MX_FOUND" | "NO_MX" | "UNKNOWN";
  spf: "SPF_PRESENT" | "SPF_MISSING" | "SPF_INVALID" | "UNKNOWN";
  dmarc: "DMARC_PRESENT" | "DMARC_MISSING" | "DMARC_INVALID" | "UNKNOWN";
  disposable: "DISPOSABLE" | "NOT_DISPOSABLE" | "UNKNOWN";
  role: "ROLE_ACCOUNT" | "PERSONAL_ACCOUNT_LIKELY" | "UNKNOWN";
  catch_all: "CATCH_ALL" | "NOT_CATCH_ALL" | "UNKNOWN";
  smtp: "SMTP_EXISTS" | "SMTP_NOT_FOUND" | "UNKNOWN";
  free_provider?: "FREE_PROVIDER" | "BUSINESS_CORPORATE" | "UNKNOWN";
}

export interface VerificationResult {
  id?: string;
  email: string;
  normalized_email: string;
  verdict: Verdict;
  score: number;
  confidence?: number;
  is_free_provider?: boolean;
  did_you_mean?: string | null;
  reasons?: string[];
  checks: VerificationChecks;
  created_at: string;
  remaining_anonymous_checks?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  plan?: string;
  monthly_limit?: number;
  is_admin?: boolean;
}

export interface BulkJobSummary {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  results: VerificationResult[];
}

export interface AdminStats {
  total_users: number;
  total_verifications: number;
  total_bulk_jobs: number;
  verdict_breakdown: Record<string, number>;
  edge_runtime: string;
  cdn_cache_status: string;
  timestamp: string;
}

export interface MonthlyQuota {
  current_month: string;
  plan?: string;
  calls_used: number;
  monthly_limit: number;
  remaining_calls: number;
  is_unlimited?: boolean;
}

export interface ApiKeyItem {
  id: string;
  user_id: string;
  key_prefix: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  is_active: number;
}

export interface GeneratedApiKeyResponse {
  key_id: string;
  raw_key: string;
  key_prefix: string;
  name: string;
  created_at: string;
  message: string;
}

export interface AdminUserRecord {
  id: string;
  google_sub: string | null;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan?: string;
  monthly_limit?: number;
  created_at: string;
  updated_at: string;
}
