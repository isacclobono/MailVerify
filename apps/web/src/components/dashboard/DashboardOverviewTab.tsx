import { useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
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
  history,
  apiKeys,
  timeRange,
  onTimeRangeChange,
  onRefresh,
  onNavigateTab,
}: DashboardOverviewTabProps) => {
  const [selectedLang, setSelectedLang] = useState<CodeLang>("curl");
  const [copiedCode, setCopiedCode] = useState(false);

  const languages: CodeLang[] = ["curl", "node", "javascript", "python", "php", "ruby", "go", "rust", "java", "c#", "swift"];
  const hourlyLabels = ["1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12p"];

  const activeKeyPrefix = apiKeys.length > 0 ? `${apiKeys[0].key_prefix}...` : "mv_live_8994cf5f2b0645589f2fe0d786140cf8";

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
              onClick={() => onTimeRangeChange(t)}
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
          onClick={onRefresh}
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
                onClick={() => onNavigateTab("single")}
                style={{ background: "none", border: "none", color: "var(--accent-blue)", cursor: "pointer", textDecoration: "underline" }}
              >
                trigger a sample request
              </button>
              <span style={{ color: "var(--text-muted)" }}>or</span>
              <button
                onClick={() => onNavigateTab("keys")}
                style={{ background: "none", border: "none", color: "var(--accent-blue)", cursor: "pointer", textDecoration: "underline" }}
              >
                view API keys
              </button>
            </div>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <div className="data-table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Verdict</th>
                    <th>Score</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 5).map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{item.email}</td>
                      <td>
                        <VerdictBadge verdict={item.verdict} score={item.score} />
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
