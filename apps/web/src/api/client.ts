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
};
