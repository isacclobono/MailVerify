import { Users, CheckCircle2, Layers, Server } from "lucide-react";
import { AdminStats } from "../../types";

interface AdminOverviewTabProps {
  stats: AdminStats | null;
}

export const AdminOverviewTab = ({ stats }: AdminOverviewTabProps) => {
  return (
    <div>
      {/* KPI Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--accent-blue)", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>REGISTERED USERS</span>
            <Users size={20} />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800 }}>{stats?.total_users || 0}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Direct & OAuth Accounts</div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--accent-green)", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>TOTAL VERIFICATIONS</span>
            <CheckCircle2 size={20} />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800 }}>{stats?.total_verifications || 0}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Stored across 5-day rolling window</div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--accent-purple)", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>BULK BATCH JOBS</span>
            <Layers size={20} />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800 }}>{stats?.total_bulk_jobs || 0}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Processed CSV/JSON batches</div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--accent-gold)", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>CDN CACHE STATUS</span>
            <Server size={20} />
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#10b981" }}>Active (Edge)</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Cloudflare KV + Edge Cache</div>
        </div>
      </div>

      {/* Verdict Distribution */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem" }}>Global Verdict Distribution</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {stats?.verdict_breakdown && Object.keys(stats.verdict_breakdown).length > 0 ? (
            Object.entries(stats.verdict_breakdown).map(([verdict, count]) => {
              const total = stats.total_verifications || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={verdict}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                    <span style={{ fontWeight: 600 }}>{verdict}</span>
                    <span style={{ color: "var(--text-muted)" }}>{count} ({percentage}%)</span>
                  </div>
                  <div style={{ height: "8px", background: "var(--bg-subtle)", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${percentage}%`, background: verdict.includes("DELIVERABLE") ? "var(--success)" : verdict.includes("RISKY") ? "var(--warning)" : "var(--danger)", borderRadius: "9999px" }} />
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "1.5rem" }}>
              No verifications recorded in database yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
