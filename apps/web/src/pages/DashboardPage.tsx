import { useState, useEffect } from "react";
import { User, VerificationResult, BulkJobSummary, ApiKeyItem, MonthlyQuota, GeneratedApiKeyResponse } from "../types";
import { api } from "../api/client";
import { 
  Search, 
  Upload, 
  History, 
  Settings, 
  Key, 
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardOverviewTab } from "../components/dashboard/DashboardOverviewTab";
import { DashboardSingleTab } from "../components/dashboard/DashboardSingleTab";
import { DashboardBulkTab } from "../components/dashboard/DashboardBulkTab";
import { DashboardHistoryTab } from "../components/dashboard/DashboardHistoryTab";
import { DashboardKeysTab } from "../components/dashboard/DashboardKeysTab";
import { DashboardSettingsTab } from "../components/dashboard/DashboardSettingsTab";

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

type DashboardTab = "overview" | "single" | "bulk" | "history" | "keys" | "settings";

export const DashboardPage = ({ user, onLogout }: DashboardPageProps) => {
  const getInitialTab = (): DashboardTab => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as DashboardTab;
      const validTabs: DashboardTab[] = ["overview", "single", "bulk", "history", "keys", "settings"];
      return validTabs.includes(tab) ? tab : "overview";
    } catch {
      return "overview";
    }
  };

  const [activeTab, setActiveTabState] = useState<DashboardTab>(getInitialTab);

  const setActiveTab = (tab: DashboardTab) => {
    setActiveTabState(tab);
    try {
      const url = new URL(window.location.href);
      if (tab === "overview") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab);
      }
      window.history.replaceState({}, "", url.pathname + url.search);
    } catch {
      // Ignore history state error
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getInitialTab());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const [timeRange, setTimeRange] = useState<"Last 24 hours" | "Last 30 days" | "Last 12 months">("Last 24 hours");

  // Single verify state
  const [singleEmail, setSingleEmail] = useState("");
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<VerificationResult | null>(null);
  const [singleError, setSingleError] = useState<string | null>(null);

  // Bulk verify state
  const [bulkInput, setBulkInput] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkSummary, setBulkSummary] = useState<BulkJobSummary | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // History & Stats state
  const [history, setHistory] = useState<VerificationResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    deliverable: 0,
    risky: 0,
    invalid: 0,
  });

  // API Keys & Quota State
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [quota, setQuota] = useState<MonthlyQuota>({
    current_month: new Date().toISOString().substring(0, 7),
    calls_used: 0,
    monthly_limit: 200,
    remaining_calls: 200,
  });
  const [keysLoading, setKeysLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatingKey, setGeneratingKey] = useState(false);
  const [createdKey, setCreatedKey] = useState<GeneratedApiKeyResponse | null>(null);

  const loadHistoryAndStats = async () => {
    setHistoryLoading(true);
    try {
      const [histData, usageData] = await Promise.all([
        api.getHistory(50, 0),
        api.getUsage(),
      ]);
      setHistory(histData.items);
      setStats({
        total: usageData.total_recent_verifications,
        deliverable: usageData.deliverable_count,
        risky: usageData.risky_count,
        invalid: usageData.invalid_count,
      });
      if (usageData.monthly_quota) {
        setQuota(usageData.monthly_quota);
      }
    } catch {
      // Ignore stats load failure
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadApiKeys = async () => {
    setKeysLoading(true);
    try {
      const res = await api.listApiKeys();
      setApiKeys(res.keys);
      if (res.usage) {
        setQuota(res.usage);
      }
    } catch {
      // Ignore keys load failure
    } finally {
      setKeysLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryAndStats();
    loadApiKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setGeneratingKey(true);
    try {
      const res = await api.createApiKey(newKeyName.trim());
      setCreatedKey(res);
      setNewKeyName("");
      toast.success("API Key Generated", {
        description: `New key "${res.name}" created. Please copy it immediately.`,
      });
      loadApiKeys();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate API key.";
      toast.error("Key Generation Failed", {
        description: msg,
      });
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Applications using it will be blocked.")) return;
    try {
      await api.deleteApiKey(keyId);
      setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
      toast.success("API Key Revoked", {
        description: "The selected API key has been deleted and can no longer be used.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to revoke API key.";
      toast.error("Revocation Failed", {
        description: msg,
      });
    }
  };

  const handleSingleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleEmail.trim()) return;

    setSingleLoading(true);
    setSingleError(null);
    setSingleResult(null);

    try {
      const res = await api.verifyEmail(singleEmail.trim());
      setSingleResult(res);
      if (res.verdict === "LIKELY_DELIVERABLE") {
        toast.success("Email Verified Deliverable", {
          description: `${res.email} is deliverable with score ${res.score}/100.`,
        });
      } else if (res.verdict.includes("RISKY") || res.verdict.includes("ROLE")) {
        toast.warning("Risky / Role Email Detected", {
          description: `${res.email} flagged as ${res.verdict} (Score: ${res.score}/100).`,
        });
      } else {
        toast.error("Undeliverable Email", {
          description: `${res.email} is undeliverable (${res.verdict}).`,
        });
      }
      loadHistoryAndStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification request failed.";
      setSingleError(msg);
      toast.error("Verification Request Failed", {
        description: msg,
      });
    } finally {
      setSingleLoading(false);
    }
  };

  // Smart client-side email extractor for CSV/Text/JSON
  const parseEmailsFromText = (raw: string): string[] => {
    const emailRegex = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = raw.match(emailRegex) || [];
    return Array.from(new Set(matches.map((e) => e.trim().toLowerCase())));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const extracted = parseEmailsFromText(content);
        if (extracted.length > 0) {
          setBulkInput(extracted.join("\n"));
          setBulkError(null);
          toast.info("File Uploaded", {
            description: `Extracted ${extracted.length} valid email addresses from ${file.name}.`,
          });
        } else {
          setBulkError("No valid email addresses detected in the uploaded file.");
          toast.warning("No Emails Found", {
            description: "Could not parse any valid email formats in the uploaded file.",
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const loadSampleEmails = () => {
    const samples = [
      "alex@gmail.com",
      "contact@stripe.com",
      "billing@apple.com",
      "temp-user@mailinator.com",
      "support@github.com",
      "test@invalid-domain-xyz.test",
      "founder@dropbox.com",
      "info@cloudflare.com",
    ];
    setBulkInput(samples.join("\n"));
    setBulkError(null);
    toast.info("Sample Emails Loaded", {
      description: "Populated batch queue with 8 representative test addresses.",
    });
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emails = parseEmailsFromText(bulkInput);

    if (emails.length === 0) {
      setBulkError("Please enter or upload at least one valid email address.");
      return;
    }

    if (emails.length > 200) {
      setBulkError("Batch size exceeds 200 emails limit per submission.");
      return;
    }

    setBulkLoading(true);
    setBulkError(null);
    setBulkSummary(null);

    try {
      const res = await api.submitBulkVerification(emails);
      setBulkSummary(res.summary);
      toast.success("Batch Verification Complete", {
        description: `Verified ${res.summary.total} emails: ${res.summary.successful} deliverable, ${res.summary.failed} risky/undeliverable.`,
      });
      loadHistoryAndStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bulk processing failed.";
      setBulkError(msg);
      toast.error("Batch Processing Failed", {
        description: msg,
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const isUnlimited = quota.monthly_limit === -1 || user.plan === "admin" || user.plan === "unlimited";

  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", width: "100%" }}>
      {/* Top Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a", marginBottom: "0.15rem" }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            Real-time analytics, bulk validation engine, and API key management.
          </p>
        </div>

        {/* Requests This Cycle Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.45rem 0.85rem",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
          }}
        >
          <span>Requests this cycle</span>
          <strong style={{ color: "#0f172a", fontWeight: 700 }}>
            {quota.calls_used} / {isUnlimited ? "∞ Unlimited" : quota.monthly_limit}
          </strong>
          {!isUnlimited && (
            <span style={{ color: "var(--accent-blue)", fontWeight: 700 }}>
              {Math.round((quota.calls_used / quota.monthly_limit) * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div
        className="tab-nav"
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "1px solid var(--border-subtle)",
          marginBottom: "2rem",
          overflowX: "auto",
        }}
      >
        <button
          className={`tab-nav-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <LayoutDashboard size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />
          Overview
        </button>

        <button
          className={`tab-nav-btn ${activeTab === "single" ? "active" : ""}`}
          onClick={() => setActiveTab("single")}
        >
          <Search size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />
          Single Check
        </button>

        <button
          className={`tab-nav-btn ${activeTab === "bulk" ? "active" : ""}`}
          onClick={() => setActiveTab("bulk")}
        >
          <Upload size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />
          Bulk Batch Engine
        </button>

        <button
          className={`tab-nav-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <History size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />
          Audit History
        </button>

        <button
          className={`tab-nav-btn ${activeTab === "keys" ? "active" : ""}`}
          onClick={() => setActiveTab("keys")}
        >
          <Key size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />
          API Keys ({apiKeys.length})
        </button>

        <button
          className={`tab-nav-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <Settings size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />
          Account
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <DashboardOverviewTab
          stats={stats}
          quota={quota}
          history={history}
          apiKeys={apiKeys}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onRefresh={loadHistoryAndStats}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === "single" && (
        <DashboardSingleTab
          email={singleEmail}
          setEmail={setSingleEmail}
          loading={singleLoading}
          result={singleResult}
          error={singleError}
          onVerify={handleSingleVerify}
        />
      )}

      {activeTab === "bulk" && (
        <DashboardBulkTab
          bulkInput={bulkInput}
          setBulkInput={setBulkInput}
          bulkLoading={bulkLoading}
          bulkError={bulkError}
          bulkSummary={bulkSummary}
          onBulkSubmit={handleBulkSubmit}
          onLoadSamples={loadSampleEmails}
          onFileUpload={handleFileUpload}
        />
      )}

      {activeTab === "history" && (
        <DashboardHistoryTab
          history={history}
          loading={historyLoading}
          onRefresh={loadHistoryAndStats}
        />
      )}

      {activeTab === "keys" && (
        <DashboardKeysTab
          apiKeys={apiKeys}
          keysLoading={keysLoading}
          generatingKey={generatingKey}
          createdKey={createdKey}
          newKeyName={newKeyName}
          setNewKeyName={setNewKeyName}
          onCreateKey={handleCreateKey}
          onDeleteKey={handleDeleteKey}
        />
      )}

      {activeTab === "settings" && (
        <DashboardSettingsTab
          user={user}
          onLogout={onLogout}
        />
      )}
    </div>
  );
};
