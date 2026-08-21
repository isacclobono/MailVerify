import { useState, useEffect, useRef } from "react";
import { User, VerificationResult, BulkJobSummary, ApiKeyItem, MonthlyQuota, GeneratedApiKeyResponse } from "../types";
import { api } from "../api/client";
import { 
  Search, 
  Upload, 
  History, 
  Settings, 
  Loader2, 
  Trash2, 
  Key, 
  Copy, 
  Check, 
  Plus, 
  LayoutDashboard,
  RefreshCw,
  Download,
  FileSpreadsheet,
  Sparkles
} from "lucide-react";
import { VerdictBadge } from "../components/VerdictBadge";
import { ChecksDetail } from "../components/ChecksDetail";

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

type CodeLang = "curl" | "node" | "javascript" | "python" | "php" | "ruby" | "go" | "rust" | "java" | "c#" | "swift";

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
  const [selectedLang, setSelectedLang] = useState<CodeLang>("curl");
  const [copiedCode, setCopiedCode] = useState(false);

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [copiedToken, setCopiedToken] = useState(false);

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

  const handleSingleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleEmail.trim()) return;

    setSingleLoading(true);
    setSingleError(null);
    setSingleResult(null);

    try {
      const res = await api.verifyEmail(singleEmail.trim());
      setSingleResult(res);
      loadHistoryAndStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification request failed.";
      setSingleError(msg);
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
        } else {
          setBulkError("No valid email addresses detected in the uploaded file.");
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
      loadHistoryAndStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bulk processing failed.";
      setBulkError(msg);
    } finally {
      setBulkLoading(false);
    }
  };

  const downloadResultsCSV = () => {
    if (!bulkSummary || !bulkSummary.results) return;
    const header = "Email,Verdict,Score,Confidence,MX_Status,SPF_Status,DMARC_Status,Disposable,Provider_Type\n";
    const rows = bulkSummary.results
      .map((r) => `"${r.email}","${r.verdict}",${r.score},"${Math.round((r.confidence || 0.95) * 100)}%","${r.checks.mx}","${r.checks.spf}","${r.checks.dmarc}","${r.checks.disposable}","${r.is_free_provider ? "FREE" : "BUSINESS"}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mailverify_batch_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const downloadResultsTXT = () => {
    if (!bulkSummary || !bulkSummary.results) return;
    const lines = bulkSummary.results
      .map((r) => `${r.email} | ${r.verdict} | Score: ${r.score}/100 | ${r.checks.mx} | ${r.is_free_provider ? "CONSUMER" : "BUSINESS"}`)
      .join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mailverify_batch_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
  };

  const downloadDeliverableOnlyTXT = () => {
    if (!bulkSummary || !bulkSummary.results) return;
    const cleanEmails = bulkSummary.results
      .filter((r) => r.verdict === "LIKELY_DELIVERABLE")
      .map((r) => r.email)
      .join("\n");
    const blob = new Blob([cleanEmails], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mailverify_clean_only_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
  };

  const downloadResultsJSON = () => {
    if (!bulkSummary || !bulkSummary.results) return;
    const jsonStr = JSON.stringify(bulkSummary.results, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mailverify_batch_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setGeneratingKey(true);
    try {
      const res = await api.createApiKey(newKeyName.trim());
      setCreatedKey(res);
      setNewKeyName("");
      loadApiKeys();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to generate key.");
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Applications using it will be blocked.")) return;
    try {
      await api.deleteApiKey(keyId);
      loadApiKeys();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete key.");
    }
  };

  const activeKeyPrefix = apiKeys.length > 0 ? `${apiKeys[0].key_prefix}...` : "mv_live_8994cf5f2b0645589f2fe0d786140cf8";

  const getCodeSnippet = (lang: CodeLang): string => {
    const key = activeKeyPrefix;
    switch (lang) {
      case "curl":
        return `curl "https://mailverify.pulsechat.workers.dev/api/verify" \\\n  -X POST \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: ${key}" \\\n  -d '{"email": "contact@domain.com"}'`;
      case "node":
      case "javascript":
        return `const res = await fetch("https://mailverify.pulsechat.workers.dev/api/verify", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "${key}"
  },
  body: JSON.stringify({ email: "contact@domain.com" })
});
const data = await res.json();
console.log(data);`;
      case "python":
        return `import requests

res = requests.post(
    "https://mailverify.pulsechat.workers.dev/api/verify",
    headers={"X-API-Key": "${key}"},
    json={"email": "contact@domain.com"}
)
print(res.json())`;
      case "php":
        return `$ch = curl_init("https://mailverify.pulsechat.workers.dev/api/verify");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "X-API-Key": "${key}"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(["email" => "contact@domain.com"]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);`;
      case "go":
        return `req, _ := http.NewRequest("POST", "https://mailverify.pulsechat.workers.dev/api/verify", bytes.NewBuffer([]byte(\`{"email":"contact@domain.com"}\`)))
req.Header.Set("X-API-Key", "${key}")
req.Header.Set("Content-Type", "application/json")
resp, _ := http.DefaultClient.Do(req)`;
      case "rust":
        return `let client = reqwest::Client::new();
let res = client.post("https://mailverify.pulsechat.workers.dev/api/verify")
    .header("X-API-Key", "${key}")
    .json(&serde_json::json!({ "email": "contact@domain.com" }))
    .send()
    .await?;`;
      default:
        return `// Request to https://mailverify.pulsechat.workers.dev/api/verify with header X-API-Key: ${key}`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet(selectedLang));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const languages: CodeLang[] = ["curl", "node", "javascript", "python", "php", "ruby", "go", "rust", "java", "c#", "swift"];
  const hourlyLabels = ["1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12p"];

  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", width: "100%" }}>
      {/* Top Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a", marginBottom: "0.15rem" }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Welcome back, {user.name ? user.name.split(" ")[0] : "Developer"}.
          </p>
        </div>

        {/* Requests This Cycle Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.3rem 0.85rem",
            borderRadius: "9999px",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border-subtle)",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
          }}
        >
          <span>Requests this cycle</span>
          <strong style={{ color: "#0f172a", fontWeight: 700 }}>
            {quota.calls_used} / {quota.monthly_limit}
          </strong>
          <span style={{ color: "var(--accent-blue)", fontWeight: 700 }}>
            {Math.round((quota.calls_used / quota.monthly_limit) * 100)}%
          </span>
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

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div>
          {/* Time range selector & Refresh link */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                background: "var(--bg-subtle)",
                padding: "0.2rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {(["Last 24 hours", "Last 30 days", "Last 12 months"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  style={{
                    padding: "0.3rem 0.75rem",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    background: timeRange === t ? "#0f172a" : "transparent",
                    color: timeRange === t ? "#ffffff" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={loadHistoryAndStats}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "0.78rem",
                cursor: "pointer",
              }}
            >
              <span>Just updated</span>
              <span style={{ textDecoration: "underline", textUnderlineOffset: "3px", color: "var(--text-main)", fontWeight: 600 }}>
                Refresh
              </span>
            </button>
          </div>

          {/* 3 Metric Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                REQUESTS
              </div>
              <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                {stats.total}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>—</div>
            </div>

            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                2XX REQUESTS (DELIVERABLE)
              </div>
              <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--success)", lineHeight: 1 }}>
                {stats.deliverable}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>—</div>
            </div>

            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                ERRORS / RISKY
              </div>
              <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--danger)", lineHeight: 1 }}>
                {stats.invalid + stats.risky}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>—</div>
            </div>
          </div>

          {/* Requests Per Hour Visualizer */}
          <div className="card" style={{ padding: "1.75rem", marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                REQUESTS PER HOUR
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Max: {Math.max(stats.total, 1)}</span>
            </div>

            {/* Timeline Bars */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                height: "120px",
                gap: "4px",
                borderBottom: "1px solid var(--border-subtle)",
                paddingBottom: "4px",
              }}
            >
              {hourlyLabels.map((_, idx) => {
                const hasActivity = stats.total > 0 && idx === hourlyLabels.length - 2;
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: hasActivity ? "80%" : "3px",
                        background: hasActivity ? "var(--accent-blue)" : "rgba(226, 232, 240, 0.7)",
                        borderRadius: "2px 2px 0 0",
                        transition: "all 0.2s ease",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Timeline Labels */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.68rem",
                color: "var(--text-muted)",
                marginTop: "0.6rem",
              }}
            >
              {hourlyLabels.map((h, i) => (
                <span key={i} style={{ flex: 1, textAlign: "center" }}>
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div style={{ marginBottom: "3rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                RECENT ACTIVITY
              </div>
              <button
                onClick={loadHistoryAndStats}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                <span>Just updated</span>
                <span style={{ textDecoration: "underline", textUnderlineOffset: "3px", color: "var(--text-main)", fontWeight: 600 }}>
                  Refresh
                </span>
              </button>
            </div>

            {history.length === 0 ? (
              <div
                className="card"
                style={{
                  border: "2px dashed var(--border-subtle)",
                  padding: "3.5rem 2rem",
                  textAlign: "center",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.4rem", color: "#0f172a" }}>
                  No requests yet
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem", maxWidth: "480px", margin: "0 auto 1.25rem" }}>
                  Once you make your first call to the API, the most recent requests will show up here.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", fontSize: "0.88rem" }}>
                  <button
                    onClick={() => setActiveTab("single")}
                    style={{ background: "none", border: "none", color: "var(--accent-blue)", cursor: "pointer", textDecoration: "underline" }}
                  >
                    trigger a sample request
                  </button>
                  <span style={{ color: "var(--text-muted)" }}>or</span>
                  <button
                    onClick={() => setActiveTab("keys")}
                    style={{ background: "none", border: "none", color: "var(--accent-blue)", cursor: "pointer", textDecoration: "underline" }}
                  >
                    view API keys
                  </button>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                      <th style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontWeight: 600 }}>Email</th>
                      <th style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontWeight: 600 }}>Verdict</th>
                      <th style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontWeight: 600 }}>Score</th>
                      <th style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontWeight: 600 }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 5).map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{item.email}</td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <VerdictBadge verdict={item.verdict} score={item.score} />
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>{item.score}/100</td>
                        <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>
                          {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Example Request Multi-Language Snippet Box */}
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              EXAMPLE REQUEST
            </div>

            <div style={{ background: "var(--bg-dark)", borderRadius: "var(--radius-lg)", border: "1px solid #1e293b", overflow: "hidden" }}>
              {/* Language Selector Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#090e17",
                  borderBottom: "1px solid #1e293b",
                  padding: "0.35rem 0.5rem",
                  overflowX: "auto",
                }}
              >
                {languages.map((l) => (
                  <button
                    key={l}
                    onClick={() => setSelectedLang(l)}
                    style={{
                      background: selectedLang === l ? "#1e293b" : "transparent",
                      color: selectedLang === l ? "#ffffff" : "#94a3b8",
                      border: "none",
                      padding: "0.35rem 0.65rem",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.78rem",
                      fontFamily: "var(--font-mono)",
                      cursor: "pointer",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* Code Box */}
              <div style={{ position: "relative", padding: "1.25rem 1.5rem" }}>
                <button
                  onClick={handleCopyCode}
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    fontSize: "0.75rem",
                    padding: "0.3rem 0.65rem",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                  }}
                >
                  {copiedCode ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                  <span>{copiedCode ? "Copied!" : "Copy"}</span>
                </button>

                <pre style={{ margin: 0, color: "#38bdf8", fontFamily: "var(--font-mono)", fontSize: "0.85rem", lineHeight: 1.6, overflowX: "auto" }}>
                  {getCodeSnippet(selectedLang)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Single Verification */}
      {activeTab === "single" && (
        <div className="live-tester-card">
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem" }}>Inspect Single Address</h2>
          <form onSubmit={handleSingleVerify} className="search-input-group" style={{ maxWidth: "580px" }}>
            <input
              type="email"
              className="clean-input"
              placeholder="e.g. alex@company.com"
              value={singleEmail}
              onChange={(e) => setSingleEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-black" disabled={singleLoading} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap", padding: "0.6rem 1rem" }}>
              {singleLoading ? <Loader2 size={14} className="animate-spin" /> : "Verify Now"}
            </button>
          </form>

          {singleError && (
            <div style={{ color: "#dc2626", background: "#fef2f2", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)", marginTop: "0.75rem", fontSize: "0.82rem" }}>
              {singleError}
            </div>
          )}

          {singleResult && (
            <div className="result-card" style={{ marginTop: "1.25rem" }}>
              {singleResult.did_you_mean && (
                <div
                  style={{
                    background: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ fontSize: "0.82rem", color: "#92400e" }}>
                    💡 Possible typo detected. Did you mean <strong>{singleResult.did_you_mean}</strong>?
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setSingleEmail(singleResult.did_you_mean || "");
                    }}
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.55rem", borderColor: "#f59e0b", color: "#b45309" }}
                  >
                    Apply {singleResult.did_you_mean} →
                  </button>
                </div>
              )}

              <div className="result-header">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.2rem" }}>
                    <span className="section-eyebrow">VERDICT</span>
                    {singleResult.confidence !== undefined && (
                      <span style={{ fontSize: "0.68rem", padding: "0.15rem 0.45rem", borderRadius: "9999px", background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", fontWeight: 700 }}>
                        {Math.round(singleResult.confidence * 100)}% Confidence
                      </span>
                    )}
                    {singleResult.is_free_provider && (
                      <span style={{ fontSize: "0.68rem", padding: "0.15rem 0.45rem", borderRadius: "9999px", background: "rgba(100, 116, 139, 0.1)", color: "var(--text-muted)", fontWeight: 600 }}>
                        Consumer Mailbox
                      </span>
                    )}
                  </div>
                  <div className="result-email">{singleResult.email}</div>
                </div>
                <VerdictBadge verdict={singleResult.verdict} score={singleResult.score} />
              </div>

              <ChecksDetail checks={singleResult.checks} />

              {singleResult.reasons && singleResult.reasons.length > 0 && (
                <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  {singleResult.reasons.map((r, i) => (
                    <span key={i} style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)" }}>
                      {r.replace("REASON_", "")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Bulk Verification */}
      {activeTab === "bulk" && (
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.2rem" }}>Bulk Email Batch Engine</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                Verify up to 200 emails per batch. Paste text, upload CSV/JSON, or load sample records.
              </p>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={loadSampleEmails}
                style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
              >
                <Sparkles size={12} color="var(--accent-blue)" /> Load 10 Samples
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.txt,.json,.tsv"
                style={{ display: "none" }}
              />

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
              >
                <FileSpreadsheet size={12} /> Upload CSV / TXT
              </button>
            </div>
          </div>

          <form onSubmit={handleBulkSubmit}>
            <textarea
              className="clean-input"
              style={{ width: "100%", height: "130px", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: "0.75rem", lineHeight: 1.5 }}
              placeholder={`Paste emails separated by newlines or commas:\nalex@gmail.com\ncontact@stripe.com\nsupport@company.org`}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
              <button
                type="submit"
                className="btn btn-black"
                disabled={bulkLoading || !bulkInput.trim()}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.55rem 1rem" }}
              >
                {bulkLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                <span>{bulkLoading ? "Processing Batch..." : "Run Batch Verification"}</span>
              </button>

              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Detected emails: <strong style={{ color: "var(--text-main)" }}>{parseEmailsFromText(bulkInput).length}</strong>
              </div>
            </div>
          </form>

          {bulkError && (
            <div style={{ color: "#dc2626", background: "#fef2f2", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)", marginTop: "0.75rem", fontSize: "0.82rem" }}>
              {bulkError}
            </div>
          )}

          {/* Bulk Summary & Full Results Table */}
          {bulkSummary && (
            <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Batch Verification Results</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    Completed {bulkSummary.processed} verifications ({bulkSummary.successful} deliverable, {bulkSummary.failed} risky/undeliverable).
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                  <button className="btn btn-outline" onClick={downloadResultsCSV} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}>
                    <Download size={13} /> Export CSV
                  </button>
                  <button className="btn btn-outline" onClick={downloadResultsTXT} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}>
                    <Download size={13} /> Export TXT
                  </button>
                  <button className="btn btn-outline" onClick={downloadDeliverableOnlyTXT} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem", borderColor: "var(--success)", color: "var(--success)" }}>
                    <Download size={13} /> Clean Only (.txt)
                  </button>
                  <button className="btn btn-outline" onClick={downloadResultsJSON} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}>
                    <Download size={13} /> Export JSON
                  </button>
                </div>
              </div>

              {/* Metric Breakdown Row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div className="card" style={{ padding: "0.85rem", textAlign: "center" }}>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700 }}>PROCESSED</div>
                  <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>{bulkSummary.total}</div>
                </div>
                <div className="card" style={{ padding: "0.85rem", textAlign: "center" }}>
                  <div style={{ fontSize: "0.68rem", color: "var(--success)", fontWeight: 700 }}>DELIVERABLE</div>
                  <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--success)" }}>{bulkSummary.successful}</div>
                </div>
                <div className="card" style={{ padding: "0.85rem", textAlign: "center" }}>
                  <div style={{ fontSize: "0.68rem", color: "var(--danger)", fontWeight: 700 }}>UNDELIVERABLE / RISKY</div>
                  <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--danger)" }}>{bulkSummary.failed}</div>
                </div>
              </div>

              {/* Detailed Results Table */}
              {bulkSummary.results && bulkSummary.results.length > 0 && (
                <div style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                        <th style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontWeight: 700 }}>Email Address</th>
                        <th style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontWeight: 700 }}>Verdict</th>
                        <th style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontWeight: 700 }}>Score</th>
                        <th style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontWeight: 700 }}>MX Record</th>
                        <th style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontWeight: 700 }}>SPF / DMARC</th>
                        <th style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontWeight: 700 }}>Disposable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkSummary.results.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{r.email}</td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <VerdictBadge verdict={r.verdict} score={r.score} />
                          </td>
                          <td style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>{r.score}/100</td>
                          <td style={{ padding: "0.75rem 1rem", color: r.checks.mx === "MX_FOUND" ? "var(--success)" : "var(--danger)" }}>
                            {r.checks.mx === "MX_FOUND" ? "✓ Found" : "✗ Missing"}
                          </td>
                          <td style={{ padding: "0.75rem 1rem", color: r.checks.spf.includes("PRESENT") ? "var(--success)" : "var(--warning)" }}>
                            {r.checks.spf.includes("PRESENT") ? "✓ Valid" : "⚠ Missing"}
                          </td>
                          <td style={{ padding: "0.75rem 1rem", color: r.checks.disposable === "NOT_DISPOSABLE" ? "var(--text-muted)" : "var(--danger)" }}>
                            {r.checks.disposable === "NOT_DISPOSABLE" ? "Clean" : "Burner"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Audit History */}
      {activeTab === "history" && (
        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>5-Day Rolling History</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Records are retained in encrypted storage for 5 days and purged automatically at midnight.
              </p>
            </div>
            <button className="btn btn-outline" onClick={loadHistoryAndStats} disabled={historyLoading}>
              <RefreshCw size={14} className={historyLoading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          {history.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>No verifications recorded in the last 5 days.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-subtle)", textAlign: "left" }}>
                    <th style={{ padding: "0.75rem" }}>Email</th>
                    <th style={{ padding: "0.75rem" }}>Verdict</th>
                    <th style={{ padding: "0.75rem" }}>Score</th>
                    <th style={{ padding: "0.75rem" }}>Verified At</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "0.75rem", fontWeight: 600 }}>{h.email}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <VerdictBadge verdict={h.verdict} score={h.score} />
                      </td>
                      <td style={{ padding: "0.75rem" }}>{h.score}/100</td>
                      <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>
                        {new Date(h.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: API Keys & Quota */}
      {activeTab === "keys" && (
        <div>
          {/* Top Key Generation Box */}
          <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Generate New API Key</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
              Authenticate backend requests via <code>X-API-Key: mv_live_...</code> or <code>Authorization: Bearer &lt;key&gt;</code>.
            </p>

            <form onSubmit={handleCreateKey} style={{ display: "flex", gap: "0.75rem", maxWidth: "520px" }}>
              <input
                type="text"
                className="clean-input"
                placeholder="Key label (e.g. Production Backend, Zapier)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                required
                disabled={generatingKey || apiKeys.length >= 5}
              />
              <button type="submit" className="btn btn-black" disabled={generatingKey || !newKeyName.trim() || apiKeys.length >= 5} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap" }}>
                {generatingKey ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                <span>Create Key</span>
              </button>
            </form>

            {createdKey && (
              <div style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontWeight: 700, color: "var(--success)", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                  🎉 API Key Created! Copy it now (it won't be displayed again):
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <code style={{ background: "#0f172a", color: "#34d399", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", fontFamily: "var(--font-mono)", flex: 1, overflowX: "auto" }}>
                    {createdKey.raw_key}
                  </code>
                  <button
                    className="btn btn-black"
                    onClick={() => {
                      navigator.clipboard.writeText(createdKey.raw_key);
                      setCopiedToken(true);
                      setTimeout(() => setCopiedToken(false), 2000);
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    {copiedToken ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedToken ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Keys List */}
          <div className="card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Active API Keys ({apiKeys.length}/5)</h3>
            {keysLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
                <Loader2 size={16} className="animate-spin" /> Loading keys...
              </div>
            ) : apiKeys.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No API keys generated yet. Create one above to get started.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-subtle)", textAlign: "left" }}>
                    <th style={{ padding: "0.75rem" }}>Label</th>
                    <th style={{ padding: "0.75rem" }}>Prefix</th>
                    <th style={{ padding: "0.75rem" }}>Created</th>
                    <th style={{ padding: "0.75rem", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((k) => (
                    <tr key={k.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "0.75rem", fontWeight: 600 }}>{k.name}</td>
                      <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{k.key_prefix}...</td>
                      <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>{new Date(k.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: "0.75rem", textAlign: "right" }}>
                        <button
                          onClick={() => handleDeleteKey(k.id)}
                          style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                        >
                          <Trash2 size={14} /> Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Settings / Account */}
      {activeTab === "settings" && (
        <div className="card" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>Account Governance</h2>
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Signed in email</div>
            <div style={{ fontSize: "1rem", fontWeight: 600 }}>{user.email}</div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--danger)", marginBottom: "0.5rem" }}>Danger Zone</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1rem" }}>
              Permanently delete your profile, API keys, and all verification history under GDPR right to erasure.
            </p>
            <button
              className="btn"
              onClick={async () => {
                if (confirm("Are you absolutely sure you want to permanently erase your account and all data? This cannot be undone.")) {
                  await api.deleteAccount();
                  onLogout();
                }
              }}
              style={{ background: "var(--danger)", color: "#fff", border: "none" }}
            >
              Permanently Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
