import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { VerificationResult } from "../../types";
import { VerdictBadge } from "../VerdictBadge";
import { Pagination } from "../Pagination";
import { formatTimeAgo, formatUtcDateTime } from "../../utils/time";

interface DashboardHistoryTabProps {
  history: VerificationResult[];
  loading: boolean;
  onRefresh: () => void;
}

const HISTORY_PAGE_SIZE = 10;

export const DashboardHistoryTab = ({
  history,
  loading,
  onRefresh,
}: DashboardHistoryTabProps) => {
  const [historyPage, setHistoryPage] = useState(1);

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>5-Day Rolling History</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            Records are retained in encrypted storage for 5 days and purged automatically at midnight.
          </p>
        </div>
        <button
          className="btn btn-outline"
          onClick={onRefresh}
          disabled={loading}
          style={{ fontSize: "0.78rem", padding: "0.3rem 0.65rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {history.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem", fontSize: "0.82rem" }}>
          No verifications recorded in the last 5 days.
        </p>
      ) : (
        <div className="data-table-wrapper">
          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Verdict</th>
                  <th>Score</th>
                  <th>Verified At</th>
                </tr>
              </thead>
              <tbody>
                {history
                  .slice((historyPage - 1) * HISTORY_PAGE_SIZE, historyPage * HISTORY_PAGE_SIZE)
                  .map((h, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{h.email}</td>
                      <td>
                        <VerdictBadge verdict={h.verdict} score={h.score} />
                      </td>
                      <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{h.score}/100</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.75rem" }} title={formatUtcDateTime(h.created_at)}>
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
