import { User, VerificationResult, BulkJobSummary } from "../types";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname.includes("localhost")
    ? "http://localhost:8787"
    : "https://mailverify.pulsechat.workers.dev");

console.log("[MailVerify API] Initialized with backend:", API_BASE_URL);

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Attach session Bearer token if present
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mv_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Include HttpOnly cookies
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
    console.warn(`[MailVerify API] Error on ${endpoint}:`, errorMsg);
    throw new Error(errorMsg);
  }

  return data.data;
}

export const api = {
  // Auth
  async adminLogin(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await apiRequest<{ token: string; user: User }>("/api/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== "undefined" && data.token) {
      localStorage.setItem("mv_token", data.token);
    }
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const data = await apiRequest<{ user: User }>("/api/auth/me");
      return data.user;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("mv_token");
      }
    }
  },

  getGoogleLoginUrl(): string {
    return `${API_BASE_URL}/api/auth/google`;
  },

  // Verification
  async verifyEmail(email: string): Promise<VerificationResult> {
    return apiRequest<VerificationResult>("/api/verify", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // History
  async getHistory(limit = 50, offset = 0): Promise<{ items: VerificationResult[] }> {
    return apiRequest<{ items: VerificationResult[] }>(`/api/history?limit=${limit}&offset=${offset}`);
  },

  // Usage stats
  async getUsage(): Promise<{
    total_recent_verifications: number;
    deliverable_count: number;
    risky_count: number;
    invalid_count: number;
    retention_days: number;
    monthly_quota?: {
      current_month: string;
      calls_used: number;
      monthly_limit: number;
      remaining_calls: number;
    };
  }> {
    return apiRequest("/api/usage");
  },

  // Bulk Verification
  async submitBulkVerification(emails: string[]): Promise<{ job_id: string; summary: BulkJobSummary }> {
    return apiRequest("/api/bulk", {
      method: "POST",
      body: JSON.stringify({ emails }),
    });
  },

  async uploadBulkCsv(csvText: string): Promise<{ job_id: string; summary: BulkJobSummary }> {
    const response = await fetch(`${API_BASE_URL}/api/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "text/csv",
      },
      body: csvText,
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to process CSV file.");
    }
    return data.data;
  },

  // Account
  async deleteAccount(): Promise<void> {
    await apiRequest("/api/account", { method: "DELETE" });
  },

  // API Key Management & Quota
  async listApiKeys(): Promise<{
    keys: Array<{
      id: string;
      user_id: string;
      key_prefix: string;
      name: string;
      created_at: string;
      last_used_at: string | null;
      is_active: number;
    }>;
    usage: {
      current_month: string;
      calls_used: number;
      monthly_limit: number;
      remaining_calls: number;
    };
  }> {
    return apiRequest("/api/keys");
  },

  async createApiKey(name = "Production API Key"): Promise<{
    key_id: string;
    raw_key: string;
    key_prefix: string;
    name: string;
    created_at: string;
    message: string;
  }> {
    return apiRequest("/api/keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  async deleteApiKey(keyId: string): Promise<void> {
    await apiRequest(`/api/keys/${keyId}`, { method: "DELETE" });
  },

  // Admin APIs (requires ADMIN_EMAILS access)
  async getAdminStats(): Promise<{
    total_users: number;
    total_verifications: number;
    total_bulk_jobs: number;
    verdict_breakdown: Record<string, number>;
    edge_runtime: string;
    cdn_cache_status: string;
    timestamp: string;
  }> {
    return apiRequest("/api/admin/stats");
  },

  async getAdminUsers(limit = 50, offset = 0): Promise<{
    users: Array<{
      id: string;
      google_sub: string | null;
      email: string;
      name: string | null;
      avatar_url: string | null;
      created_at: string;
      updated_at: string;
    }>;
    pagination: { total: number; limit: number; offset: number };
  }> {
    return apiRequest(`/api/admin/users?limit=${limit}&offset=${offset}`);
  },

  async getAdminVerifications(limit = 50, offset = 0): Promise<{
    verifications: Array<{
      id: string;
      user_id: string | null;
      email: string;
      normalized_email: string;
      verdict: string;
      score: number;
      created_at: string;
    }>;
    pagination: { total: number; limit: number; offset: number };
  }> {
    return apiRequest(`/api/admin/verifications?limit=${limit}&offset=${offset}`);
  },

  async deleteAdminUser(userId: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/api/admin/users/${userId}`, { method: "DELETE" });
  },

  async updateAdminUserPlan(userId: string, plan: string, monthlyLimit: number): Promise<{
    user_id: string;
    plan: string;
    monthly_limit: number;
    is_unlimited: boolean;
  }> {
    return apiRequest(`/api/admin/users/${userId}/plan`, {
      method: "PUT",
      body: JSON.stringify({ plan, monthly_limit: monthlyLimit }),
    });
  },

  async syncDisposableDomains(): Promise<{
    success: boolean;
    total_domains_collected: number;
    sources_synced: number;
    duration_ms: number;
    timestamp: string;
  }> {
    return apiRequest("/api/admin/disposable/sync", { method: "POST" });
  },

  async getDisposableStats(): Promise<{
    total: number;
    updated_at: string;
    sources_synced: number;
  }> {
    return apiRequest("/api/admin/disposable/stats");
  },
};
