import { useState } from "react";
import { Copy, Check, RefreshCw, Search, Upload, CheckCircle2, XCircle } from "lucide-react";
import { VerificationResult, MonthlyQuota, ApiKeyItem } from "../../types";
import { VerdictBadge } from "../VerdictBadge";
import { formatTimeAgo, formatUtcDateTime } from "../../utils/time";
import { toast } from "sonner";

export type CodeLang = "curl" | "node" | "javascript" | "python" | "php" | "ruby" | "go" | "rust" | "java" | "c#" | "swift";

interface DashboardOverviewTabProps {
  stats: {
    total: number;
    deliverable: number;
    risky: number;
    invalid: number;
  };
  quota: MonthlyQuota;
  history: VerificationResult[];
  apiKeys: ApiKeyItem[];
  timeRange: "Last 24 hours" | "Last 30 days" | "Last 12 months";
  onTimeRangeChange: (t: "Last 24 hours" | "Last 30 days" | "Last 12 months") => void;
  onRefresh: () => void;
  onNavigateTab: (tab: "single" | "bulk" | "history" | "keys" | "settings") => void;
}

export const DashboardOverviewTab = ({
  stats,
  quota,
  history,
  apiKeys,
  onRefresh,
  onNavigateTab,
}: DashboardOverviewTabProps) => {
  const [selectedLang, setSelectedLang] = useState<CodeLang>("curl");
  const [copiedCode, setCopiedCode] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const languages: CodeLang[] = ["curl", "node", "javascript", "python", "php", "ruby", "go", "rust", "java", "c#", "swift"];
  const hourlyLabels = ["1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12p"];

  const activeKeyPrefix = apiKeys.length > 0 ? `${apiKeys[0].key_prefix}...` : "mv_live_8994cf5f2b0645589f2fe0d786140cf8";

  const isUnlimited = quota.monthly_limit === -1;
  const usagePercentage = isUnlimited ? 0 : Math.min(100, Math.round((quota.calls_used / quota.monthly_limit) * 100));
  const remainingCredits = isUnlimited ? "Unlimited" : Math.max(0, quota.monthly_limit - quota.calls_used);

  const getCodeSnippet = (lang: CodeLang): string => {
    const key = activeKeyPrefix;
    switch (lang) {
      case "curl":
        return `curl "https://mailverify.sk-builds.workers.dev/api/verify" \\\n  -X POST \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: ${key}" \\\n  -d '{"email": "contact@domain.com"}'`;
      case "node":
      case "javascript":
        return `const res = await fetch("https://mailverify.sk-builds.workers.dev/api/verify", {
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
    "https://mailverify.sk-builds.workers.dev/api/verify",
    headers={"X-API-Key": "${key}"},
    json={"email": "contact@domain.com"}
)
print(res.json())`;
      case "php":
        return `$ch = curl_init("https://mailverify.sk-builds.workers.dev/api/verify");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "X-API-Key": "${key}"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(["email" => "contact@domain.com"]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);`;
      case "go":
        return `req, _ := http.NewRequest("POST", "https://mailverify.sk-builds.workers.dev/api/verify", bytes.NewBuffer([]byte(\`{"email":"contact@domain.com"}\`)))
req.Header.Set("X-API-Key", "${key}")
req.Header.Set("Content-Type", "application/json")
resp, _ := http.DefaultClient.Do(req)`;
      case "rust":
        return `let client = reqwest::Client::new();
let res = client.post("https://mailverify.sk-builds.workers.dev/api/verify")
    .header("X-API-Key", "${key}")
    .json(&serde_json::json!({ "email": "contact@domain.com" }))
    .send()
    .await?;`;
      default:
        return `// Request to https://mailverify.sk-builds.workers.dev/api/verify with header X-API-Key: ${key}`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeSnippet(selectedLang));
    setCopiedCode(true);
    toast.info("Code Snippet Copied", {
      description: `${selectedLang.toUpperCase()} integration snippet copied to clipboard.`,
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div>
      {/* Personalized Task-Oriented Launcher Bar */}
      <div
        className="card"
        style={{
          padding: "1.5rem 1.75rem",
          marginBottom: "1.75rem",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
            {getGreeting()} 👋
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
            What would you like to verify today? Choose an action below to get started immediately.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-black"
            onClick={() => onNavigateTab("single")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1.1rem" }}
          >
            <Search size={14} />
            <span>Verify Single Email</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => onNavigateTab("bulk")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1.1rem" }}
          >
            <Upload size={14} />
            <span>Bulk Batch Upload</span>
          </button>
        </div>
      </div>

      {/* Quota Progress Bar Card */}
      <div
        className="card"
        style={{
          padding: "1.5rem",
          marginBottom: "1.75rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em", color: "var(--text-muted)" }}>
              MONTHLY USAGE QUOTA
            </span>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
              {quota.calls_used.toLocaleString()} / {isUnlimited ? "∞ Unlimited" : quota.monthly_limit.toLocaleString()} verifications
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {isUnlimited ? "Unlimited Admin Access" : `${remainingCredits.toLocaleString()} verifications remaining`}
            </span>
            {!isUnlimited && (
              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--accent-blue)" }}>
                {usagePercentage}% used
              </div>
            )}
          </div>
        </div>

        {!isUnlimited && (
          <div style={{ width: "100%", height: "8px", background: "var(--bg-subtle)", borderRadius: "9999px", overflow: "hidden" }}>
            <div
              style={{
                width: `${usagePercentage}%`,
                height: "100%",
                background: usagePercentage > 85 ? "var(--danger)" : "var(--accent-blue)",
                borderRadius: "9999px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        )}
      </div>

      {/* Decision-Oriented Telemetry Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted)" }}>
              TOTAL REQUESTS
            </span>
            <Search size={15} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>
            {stats.total.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Real-time DoH lookups
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", color: "#047857" }}>
              DELIVERABLE (SAFE)
            </span>
            <CheckCircle2 size={15} color="#059669" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--success)" }}>
            {stats.deliverable.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Active mailboxes & MX
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", color: "#b91c1c" }}>
              RISKY / UNDELIVERABLE
            </span>
            <XCircle size={15} color="#dc2626" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--danger)" }}>
            {(stats.invalid + stats.risky).toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Burners, no MX or syntax errors
          </div>
        </div>
      </div>

      {/* Requests Per Hour Visualizer */}
      <div className="card" style={{ padding: "1.75rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted)" }}>
            ACTIVITY TIMELINE (LAST 24 HOURS)
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Peak: {Math.max(stats.total, 1)} calls</span>
        </div>

        {/* Timeline Bars */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            height: "110px",
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
      <div style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.85rem",
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted)" }}>
            RECENT VERIFICATIONS
          </div>
          <button
            onClick={onRefresh}
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
            <RefreshCw size={12} />
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
              padding: "3rem 2rem",
              textAlign: "center",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.35rem", color: "#0f172a" }}>
              No verification history yet
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.25rem", maxWidth: "420px", margin: "0 auto 1.25rem" }}>
              Run your first live email check or generate an API key to integrate into your application.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", fontSize: "0.85rem" }}>
              <button
                type="button"
                className="btn btn-black"
                onClick={() => onNavigateTab("single")}
                style={{ fontSize: "0.78rem" }}
              >
                Verify First Email →
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => onNavigateTab("keys")}
                style={{ fontSize: "0.78rem" }}
              >
                Manage API Keys
              </button>
            </div>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <div className="data-table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Email Address</th>
                    <th>Outcome</th>
                    <th>Risk Score</th>
                    <th>Verified Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 5).map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{item.email}</td>
                      <td>
                        <VerdictBadge verdict={item.verdict} score={item.score} size="sm" />
                      </td>
                      <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{item.score}/100</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.75rem" }} title={formatUtcDateTime(item.created_at)}>
                        {formatTimeAgo(item.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Integration Code Sandbox Box */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
          DEVELOPER API INTEGRATION
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
                  padding: "0.35rem 0.65rem",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                  background: selectedLang === l ? "#1e293b" : "transparent",
                  color: selectedLang === l ? "#38bdf8" : "#94a3b8",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  textTransform: "capitalize",
                }}
              >
                {l}
              </button>
            ))}

            <div style={{ marginLeft: "auto", paddingLeft: "0.5rem" }}>
              <button
                onClick={handleCopy}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "0.3rem 0.6rem",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                }}
              >
                {copiedCode ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                <span>{copiedCode ? "Copied" : "Copy code"}</span>
              </button>
            </div>
          </div>

          {/* Snippet Body */}
          <pre
            style={{
              padding: "1.25rem",
              color: "#38bdf8",
              fontFamily: "var(--font-mono)",
              fontSize: "0.82rem",
              lineHeight: 1.6,
              overflowX: "auto",
              margin: 0,
            }}
          >
            {getCodeSnippet(selectedLang)}
          </pre>
        </div>
      </div>
    </div>
  );
};
