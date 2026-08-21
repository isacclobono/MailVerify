import { useState } from "react";
import { RefreshCw, History, Search } from "lucide-react";
import { VerificationResult } from "../../types";
import { VerdictBadge } from "../VerdictBadge";
import { Pagination } from "../Pagination";
import { formatTimeAgo, formatUtcDateTime } from "../../utils/time";

interface DashboardHistoryTabProps {
  history: VerificationResult[];
  loading: boolean;
  onRefresh: () => void;
  onNavigateVerify?: () => void;
}

const HISTORY_PAGE_SIZE = 10;

export const DashboardHistoryTab = ({
  history,
  loading,
  onRefresh,
  onNavigateVerify,
}: DashboardHistoryTabProps) => {
  const [historyPage, setHistoryPage] = useState(1);

  return (
    <div className="card" style={{ padding: "1.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            5-Day Rolling Verification Log
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.2rem 0 0 0" }}>
            Audit records are stored in encrypted Cloudflare D1 storage for 5 days and purged automatically by midnight Cron.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={onRefresh}
          disabled={loading}
          style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh Log</span>
        </button>
      </div>

      {history.length === 0 ? (
        <div style={{ border: "2px dashed var(--border-subtle)", padding: "3rem 1.5rem", textAlign: "center", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "inline-flex", padding: "0.65rem", background: "var(--bg-subtle)", borderRadius: "50%", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
            <History size={22} />
          </div>
          <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
            No verification history in the last 5 days
          </h4>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "380px", margin: "0 auto 1.25rem" }}>
            Your recent single checks, bulk batch uploads, and API calls will automatically appear here.
          </p>
          {onNavigateVerify && (
            <button
              type="button"
              className="btn btn-black"
              onClick={onNavigateVerify}
              style={{ fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
            >
              <Search size={14} />
              <span>Verify First Email →</span>
            </button>
          )}
        </div>
      ) : (
        <div className="data-table-wrapper">
          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Target Email Address</th>
                  <th>Verification Outcome</th>
                  <th>Risk Score</th>
                  <th>Verified Time</th>
                </tr>
              </thead>
              <tbody>
                {history
                  .slice((historyPage - 1) * HISTORY_PAGE_SIZE, historyPage * HISTORY_PAGE_SIZE)
                  .map((h, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{h.email}</td>
                      <td>
                        <VerdictBadge verdict={h.verdict} score={h.score} size="sm" />
                      </td>
                      <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{h.score}/100</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.78rem" }} title={formatUtcDateTime(h.created_at)}>
                        {formatTimeAgo(h.created_at)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={historyPage}
            totalPages={Math.ceil(history.length / HISTORY_PAGE_SIZE)}
            totalItems={history.length}
            pageSize={HISTORY_PAGE_SIZE}
            onPageChange={setHistoryPage}
          />
        </div>
      )}
    </div>
  );
};
