import { useState, useEffect } from "react";
import { User, VerificationResult, BulkJobSummary, ApiKeyItem, MonthlyQuota, GeneratedApiKeyResponse } from "../types";
import { api } from "../api/client";
import { 
  Search, 
  Upload, 
  History, 
  Settings, 
  Loader2, 
  Download, 
  Trash2, 
  Key, 
  Copy, 
  Check, 
  Plus, 
  Zap, 
  Info, 
  FileSpreadsheet, 
  FileText,
  AlertCircle
} from "lucide-react";
import { VerdictBadge } from "../components/VerdictBadge";
import { ChecksDetail } from "../components/ChecksDetail";

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

export const DashboardPage = ({ user, onLogout }: DashboardPageProps) => {
  const [activeTab, setActiveTab] = useState<"single" | "bulk" | "history" | "keys" | "settings">("single");

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
      // Ignore initial stats load failures
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
      // Ignore initial keys load failure
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
      loadApiKeys();
    } catch (err: unknown) {
      setSingleError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setSingleLoading(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkInput.trim()) return;

    setBulkLoading(true);
    setBulkError(null);
    setBulkSummary(null);

    try {
      const { summary } = await api.uploadBulkCsv(bulkInput.trim());
      setBulkSummary(summary);
      loadHistoryAndStats();
      loadApiKeys();
    } catch (err: unknown) {
      setBulkError(err instanceof Error ? err.message : "Bulk verification failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkLoading(true);
    setBulkError(null);
    setBulkSummary(null);

    try {
      const text = await file.text();
      setBulkInput(text);
      const { summary } = await api.uploadBulkCsv(text);
      setBulkSummary(summary);
      loadHistoryAndStats();
      loadApiKeys();
    } catch (err: unknown) {
      setBulkError(err instanceof Error ? err.message : "File parsing or upload failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingKey(true);
    try {
      const name = newKeyName.trim() || "Production API Key";
      const res = await api.createApiKey(name);
      setCreatedKey(res);
      setNewKeyName("");
      loadApiKeys();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (confirm("Are you sure you want to revoke this API key? Applications using it will immediately stop working.")) {
      try {
        await api.deleteApiKey(keyId);
        setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to revoke API key");
      }
    }
  };

  const handleCopyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleDownloadCsv = (results: VerificationResult[]) => {
    if (!results || results.length === 0) return;

    const headers = ["Email", "Verdict", "Risk Score", "Syntax", "Domain", "MX", "SPF", "DMARC", "Disposable", "Role", "Date"];
    const rows = results.map((r) => [
      r.email,
      r.verdict,
      r.score,
      r.checks.syntax,
      r.checks.domain,
      r.checks.mx,
      r.checks.spf,
      r.checks.dmarc,
      r.checks.disposable,
      r.checks.role,
      r.created_at,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((val) => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mailverify-export-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to permanently delete your account, API keys, and all stored verification data?"
      )
    ) {
      try {
        await api.deleteAccount();
        onLogout();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Account deletion failed");
      }
    }
  };

  const usagePercent = Math.min(100, Math.round((quota.calls_used / quota.monthly_limit) * 100));

  return (
    <div className="dashboard-page">
      {/* Dashboard Top Header */}
      <div className="dash-header">
        <div>
          <span className="section-eyebrow">DEVELOPER ACCOUNT</span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Welcome, {user.name || user.email}</h1>
        </div>
        <button className="btn btn-outline" onClick={onLogout}>
          Sign out
        </button>
      </div>

      {/* Monthly Quota Alert & Progress Bar */}
      <div className="card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem", background: "var(--bg-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap size={16} color="var(--accent-blue)" />
            <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Free Plan Monthly Quota:</span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-main)", fontWeight: 800 }}>
              {quota.calls_used} / {quota.monthly_limit} API Calls
            </span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {quota.remaining_calls} calls remaining ({quota.current_month})
          </div>
        </div>
        <div style={{ width: "100%", height: "8px", background: "var(--border-subtle)", borderRadius: "9999px", overflow: "hidden" }}>
          <div style={{ width: `${usagePercent}%`, height: "100%", background: usagePercent > 85 ? "var(--danger)" : "var(--accent-blue)", borderRadius: "9999px", transition: "width 0.3s ease" }} />
        </div>
      </div>

      {/* 4 Stats Boxes */}
      <div className="stats-row" style={{ marginTop: 0 }}>
        <div className="stat-box">
          <div className="stat-top-bar" style={{ backgroundColor: "#d97706" }} />
          <div className="stat-label">5-DAY TOTAL</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-subtitle">emails verified</div>
        </div>
        <div className="stat-box">
          <div className="stat-top-bar" style={{ backgroundColor: "#10b981" }} />
          <div className="stat-label">DELIVERABLE</div>
          <div className="stat-value" style={{ color: "#059669" }}>{stats.deliverable}</div>
          <div className="stat-subtitle">passed all checks</div>
        </div>
        <div className="stat-box">
          <div className="stat-top-bar" style={{ backgroundColor: "#3b82f6" }} />
          <div className="stat-label">RISKY / ROLE</div>
          <div className="stat-value" style={{ color: "#2563eb" }}>{stats.risky}</div>
          <div className="stat-subtitle">requires review</div>
        </div>
        <div className="stat-box">
          <div className="stat-top-bar" style={{ backgroundColor: "#e11d48" }} />
          <div className="stat-label">UNDELIVERABLE</div>
          <div className="stat-value" style={{ color: "#dc2626" }}>{stats.invalid}</div>
          <div className="stat-subtitle">invalid or disposable</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-nav-btn ${activeTab === "single" ? "active" : ""}`}
          onClick={() => setActiveTab("single")}
        >
          <Search size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />
          Single Check
        </button>
        <button
          className={`tab-nav-btn ${activeTab === "bulk" ? "active" : ""}`}
          onClick={() => setActiveTab("bulk")}
        >
          <Upload size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />
          Bulk Batch
        </button>
        <button
          className={`tab-nav-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <History size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />
          Audit History
        </button>
        <button
          className={`tab-nav-btn ${activeTab === "keys" ? "active" : ""}`}
          onClick={() => setActiveTab("keys")}
        >
          <Key size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />
          API Keys ({apiKeys.length})
        </button>
        <button
          className={`tab-nav-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <Settings size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />
          Account
        </button>
      </div>

      {/* TAB 1: Single Verification */}
      {activeTab === "single" && (
        <div className="live-tester-card">
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>Inspect Single Address</h2>
          <form onSubmit={handleSingleVerify} className="search-form">
            <input
              type="email"
              className="search-input"
              placeholder="e.g. alex@company.com"
              value={singleEmail}
              onChange={(e) => setSingleEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-black" disabled={singleLoading}>
              {singleLoading ? <Loader2 size={16} className="animate-spin" /> : "Verify Now"}
            </button>
          </form>

          {singleError && (
            <div style={{ color: "#dc2626", background: "#fef2f2", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", marginTop: "1rem" }}>
              {singleError}
            </div>
          )}

          {singleResult && (
            <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>TARGET EMAIL</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{singleResult.email}</div>
                </div>
                <VerdictBadge verdict={singleResult.verdict} score={singleResult.score} />
              </div>
              <ChecksDetail checks={singleResult.checks} />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Bulk Verification */}
      {activeTab === "bulk" && (
        <div className="live-tester-card">
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Bulk Email Batch Engine</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Paste email addresses (one per line, comma-separated, or JSON) or upload a CSV/TXT file.
          </p>

          <form onSubmit={handleBulkSubmit}>
            <textarea
              className="bulk-textarea"
              placeholder="user1@domain.com&#10;user2@company.org&#10;sales@startup.io"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              rows={6}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", flexWrap: "wrap", gap: "1rem" }}>
              <label className="btn btn-outline" style={{ cursor: "pointer" }}>
                <Upload size={14} /> Upload CSV / TXT
                <input type="file" accept=".csv,.txt,.json" onChange={handleFileUpload} style={{ display: "none" }} />
              </label>

              <button type="submit" className="btn btn-black" disabled={bulkLoading || !bulkInput.trim()}>
                {bulkLoading ? <Loader2 size={16} className="animate-spin" /> : "Run Batch Verification"}
              </button>
            </div>
          </form>

          {bulkError && (
            <div style={{ color: "#dc2626", background: "#fef2f2", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", marginTop: "1rem" }}>
              {bulkError}
            </div>
          )}

          {bulkSummary && (
            <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Batch Summary: {bulkSummary.total} Processed</h3>
                <button className="btn btn-outline" onClick={() => handleDownloadCsv(bulkSummary.results)}>
                  <Download size={14} /> Download Results (CSV)
                </button>
              </div>

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Verdict</th>
                    <th>Risk</th>
                    <th>MX Server</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkSummary.results.slice(0, 50).map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{r.email}</td>
                      <td><VerdictBadge verdict={r.verdict} score={r.score} /></td>
                      <td>{r.score}/100</td>
                      <td>{r.checks.mx}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Audit History */}
      {activeTab === "history" && (
        <div className="live-tester-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>5-Day Verification History</h2>
            {history.length > 0 && (
              <button className="btn btn-outline" onClick={() => handleDownloadCsv(history)}>
                <Download size={14} /> Export CSV
              </button>
            )}
          </div>

          {historyLoading ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto" }} />
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
              No verification records in the last 5 days.
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Verdict</th>
                  <th>Risk</th>
                  <th>MX Server</th>
                  <th>SPF</th>
                  <th>DMARC</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{r.email}</td>
                    <td><VerdictBadge verdict={r.verdict} score={r.score} /></td>
                    <td>{r.score}/100</td>
                    <td>{r.checks.mx}</td>
                    <td>{r.checks.spf}</td>
                    <td>{r.checks.dmarc}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 4: API Keys & Quota */}
      {activeTab === "keys" && (
        <div className="live-tester-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Developer API Keys</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.25rem" }}>
                Use your private API keys to integrate email validation into backend services, signup forms, and CRMs.
              </p>
            </div>
          </div>

          {/* Newly Created Key Banner (Shown once) */}
          {createdKey && (
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--success)", fontWeight: 700, marginBottom: "0.5rem" }}>
                <Check size={18} /> API Key Created Successfully!
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                {createdKey.message}
              </p>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="text"
                  readOnly
                  value={createdKey.raw_key}
                  style={{ width: "100%", fontFamily: "var(--font-mono)", fontSize: "0.85rem", padding: "0.6rem 0.75rem", background: "#fff", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}
                />
                <button className="btn btn-black" onClick={() => handleCopyKey(createdKey.raw_key)} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", whiteSpace: "nowrap" }}>
                  {copiedToken ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedToken ? "Copied!" : "Copy Key"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Create Key Form */}
          <form onSubmit={handleCreateApiKey} style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="e.g. My Next.js Backend, Zapier, Webhook"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              style={{ flex: 1, minWidth: "240px", padding: "0.6rem 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "0.9rem" }}
            />
            <button type="submit" className="btn btn-black" disabled={generatingKey || apiKeys.length >= 5} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              {generatingKey ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              <span>Generate API Key</span>
            </button>
          </form>

          {/* API Keys Table */}
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Active API Keys ({apiKeys.length}/5)</h3>
          {keysLoading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}><Loader2 size={20} className="animate-spin" /></div>
          ) : apiKeys.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              No API keys generated yet. Click "Generate API Key" above to create your first key.
            </div>
          ) : (
            <table className="custom-table" style={{ fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>KEY TOKEN</th>
                  <th>CREATED</th>
                  <th>LAST USED</th>
                  <th style={{ textAlign: "right" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((k) => (
                  <tr key={k.id}>
                    <td style={{ fontWeight: 600 }}>{k.name}</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{k.key_prefix}</td>
                    <td style={{ color: "var(--text-muted)" }}>{new Date(k.created_at).toLocaleDateString()}</td>
                    <td style={{ color: "var(--text-muted)" }}>{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}</td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-outline" style={{ color: "var(--danger)", padding: "0.25rem 0.5rem" }} onClick={() => handleDeleteApiKey(k.id)} title="Revoke Key">
                        <Trash2 size={13} /> Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Quick cURL Example */}
          <div style={{ marginTop: "2.5rem", background: "var(--bg-subtle)", padding: "1.25rem", borderRadius: "var(--radius-md)" }}>
            <h4 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.5rem" }}>How to use your API Key:</h4>
            <pre style={{ background: "#0f172a", color: "#f8fafc", padding: "0.85rem", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", overflowX: "auto" }}>
{`curl -X POST https://mailverify.pulsechat.workers.dev/api/verify \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKeys.length > 0 ? apiKeys[0].key_prefix.replace("...", "xxxx") : "mv_live_your_key_here"}" \\
  -d '{"email": "contact@targetdomain.com"}'`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 5: Settings & Danger Zone */}
      {activeTab === "settings" && (
        <div className="live-tester-card" style={{ maxWidth: "580px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.25rem" }}>Account & Data Privacy</h2>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name || user.email} style={{ width: "48px", height: "48px", borderRadius: "50%" }} />
            ) : (
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Search size={20} />
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700 }}>{user.name || "User"}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{user.email}</div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
            <h3 style={{ fontSize: "0.95rem", color: "#dc2626", fontWeight: 700, marginBottom: "0.3rem" }}>Danger Zone</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Permanently delete your user profile and wipe all associated sessions, API keys, bulk job logs, and verification history.
            </p>
            <button className="btn btn-danger" onClick={handleDeleteAccount}>
              <Trash2 size={14} /> Delete Account & Wipe All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
