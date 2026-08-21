import { useState, useEffect } from "react";
import { User, VerificationResult, BulkJobSummary } from "../types";
import { api } from "../api/client";
import { 
  Search, 
  Upload, 
  History, 
  Settings, 
  Loader2, 
  Download, 
  Trash2, 
  Info, 
  FileCode, 
  FileSpreadsheet, 
  FileText 
} from "lucide-react";
import { VerdictBadge } from "../components/VerdictBadge";
import { ChecksDetail } from "../components/ChecksDetail";

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

export const DashboardPage = ({ user, onLogout }: DashboardPageProps) => {
  const [activeTab, setActiveTab] = useState<"single" | "bulk" | "history" | "settings">("single");

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
    } catch {
      // Ignore initial stats load failures
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryAndStats();
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
    } catch (err: unknown) {
      setBulkError(err instanceof Error ? err.message : "File parsing or upload failed");
    } finally {
      setBulkLoading(false);
    }
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

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mailverify_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete your account and all stored verification data?"
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

  return (
    <div className="dashboard-page">
      {/* Dashboard Top Header */}
      <div className="dash-header">
        <div>
          <span className="section-eyebrow">AUTHENTICATED CONSOLE</span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Welcome, {user.name || user.email}</h1>
        </div>
        <button className="btn btn-outline" onClick={onLogout}>
          Sign out
        </button>
      </div>

      {/* 4 Stats Boxes with Top Color Bars */}
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
          <div className="stat-subtitle">invalid, no MX, or disposable</div>
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
          Bulk Batch (CSV, JSON, Excel, TXT)
        </button>
        <button
          className={`tab-nav-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("history");
            loadHistoryAndStats();
          }}
        >
          <History size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />
          5-Day History
        </button>
        <button
          className={`tab-nav-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <Settings size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />
          Account & Privacy
        </button>
      </div>

      {/* TAB 1: Single Check */}
      {activeTab === "single" && (
        <div className="live-tester-card">
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>Inspect Single Email</h2>
          <form onSubmit={handleSingleVerify} className="search-input-group">
            <input
              type="text"
              className="clean-input"
              placeholder="Enter recipient email address..."
              value={singleEmail}
              onChange={(e) => setSingleEmail(e.target.value)}
              disabled={singleLoading}
            />
            <button type="submit" className="btn btn-black" disabled={singleLoading || !singleEmail.trim()}>
              {singleLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              <span>Verify</span>
            </button>
          </form>

          {singleError && (
            <div style={{ padding: "0.75rem", background: "#fef2f2", color: "#dc2626", borderRadius: "var(--radius-md)", border: "1px solid #fecaca", marginBottom: "1rem" }}>
              {singleError}
            </div>
          )}

          {singleResult && (
            <div className="result-card" style={{ marginTop: "1.5rem" }}>
              <div className="result-header">
                <div>
                  <span className="section-eyebrow">RESULT</span>
                  <div className="result-email">{singleResult.email}</div>
                </div>
                <VerdictBadge verdict={singleResult.verdict} score={singleResult.score} />
              </div>
              <ChecksDetail checks={singleResult.checks} />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Multi-Format Bulk Check */}
      {activeTab === "bulk" && (
        <div className="live-tester-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Multi-Format Bulk Verification</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.2rem" }}>
                Verify up to 500 emails per batch. Automatically parses CSV, JSON, TSV, or plain newline/comma lists.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span className="badge-tag"><FileSpreadsheet size={12} style={{ display: "inline" }} /> CSV & Excel</span>
              <span className="badge-tag"><FileCode size={12} style={{ display: "inline" }} /> JSON array/obj</span>
              <span className="badge-tag"><FileText size={12} style={{ display: "inline" }} /> Plain TXT</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", margin: "1.5rem 0" }}>
            {/* Direct text input */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Option 1: Paste Text / CSV / JSON
              </label>
              <textarea
                rows={7}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  outline: "none",
                }}
                placeholder="alice@company.com&#10;bob@domain.io&#10;carol@service.org&#10;-- OR JSON: [{ &quot;email&quot;: &quot;...&quot; }]&#10;-- OR CSV with email column"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                disabled={bulkLoading}
              />
              <button
                type="button"
                className="btn btn-black"
                style={{ marginTop: "0.5rem" }}
                onClick={handleBulkSubmit}
                disabled={bulkLoading || !bulkInput.trim()}
              >
                {bulkLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                <span>Process Batch</span>
              </button>
            </div>

            {/* File Drag-and-drop / upload */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Option 2: Upload File (.csv, .json, .txt)
              </label>
              <div
                style={{
                  border: "2px dashed var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "2rem 1rem",
                  textAlign: "center",
                  background: "var(--bg-subtle)",
                }}
              >
                <Upload size={28} color="#64748b" style={{ margin: "0 auto 0.5rem" }} />
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                  Upload a <code>.csv</code>, <code>.json</code>, or <code>.txt</code> file
                </p>
                <input
                  type="file"
                  accept=".csv,.json,.txt,.tsv,text/csv,application/json,text/plain"
                  onChange={handleFileUpload}
                  disabled={bulkLoading}
                  style={{ display: "inline-block", fontSize: "0.85rem" }}
                />
              </div>
            </div>
          </div>

          {bulkError && (
            <div style={{ padding: "0.75rem", background: "#fef2f2", color: "#dc2626", borderRadius: "var(--radius-md)", border: "1px solid #fecaca", marginBottom: "1rem" }}>
              {bulkError}
            </div>
          )}

          {/* Results Summary Table */}
          {bulkSummary && (
            <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Job Finished: {bulkSummary.successful} / {bulkSummary.total} Processed
                </h3>
                <button
                  className="btn btn-outline"
                  onClick={() => handleDownloadCsv(bulkSummary.results)}
                >
                  <Download size={14} /> Download CSV Results
                </button>
              </div>

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Verdict</th>
                    <th>Risk</th>
                    <th>MX Server</th>
                    <th>SPF</th>
                    <th>DMARC</th>
                    <th>Disposable</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkSummary.results.map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{r.email}</td>
                      <td><VerdictBadge verdict={r.verdict} score={r.score} /></td>
                      <td>{r.score}/100</td>
                      <td>{r.checks.mx}</td>
                      <td>{r.checks.spf}</td>
                      <td>{r.checks.dmarc}</td>
                      <td>{r.checks.disposable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 5-Day History */}
      {activeTab === "history" && (
        <div className="live-tester-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Rolling 5-Day Verification History</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.2rem" }}>
                <Info size={13} /> Records older than 5 days are purged daily by Cloudflare Cron to safeguard data privacy.
              </p>
            </div>
            {history.length > 0 && (
              <button className="btn btn-outline" onClick={() => handleDownloadCsv(history)}>
                <Download size={14} /> Export CSV
              </button>
            )}
          </div>

          {historyLoading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
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

      {/* TAB 4: Settings & Danger Zone */}
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
              Permanently delete your user profile and wipe all associated sessions, bulk job logs, and verification history.
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
