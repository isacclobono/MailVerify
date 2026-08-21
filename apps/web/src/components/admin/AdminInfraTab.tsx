import { Server, ShieldCheck, Database, RefreshCw, Loader2 } from "lucide-react";

interface AdminInfraTabProps {
  syncingDisposable: boolean;
  syncMessage: string | null;
  onSyncDisposable: () => void;
}

export const AdminInfraTab = ({
  syncingDisposable,
  syncMessage,
  onSyncDisposable,
}: AdminInfraTabProps) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
      <div className="card" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Server size={20} color="var(--accent-blue)" />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Cloudflare Edge Runtime</h3>
        </div>
        <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 2, padding: 0 }}>
          <li><strong>Engine:</strong> Cloudflare Workers (V8 Isolate)</li>
          <li><strong>Active Region:</strong> Global Edge (280+ cities)</li>
          <li><strong>Compatibility Date:</strong> 2024-11-01 (nodejs_compat enabled)</li>
          <li><strong>DNS Pipeline:</strong> DNS-over-HTTPS (Cloudflare 1.1.1.1)</li>
        </ul>
      </div>

      <div className="card" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <ShieldCheck size={20} color="var(--accent-green)" />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Database & KV Bindings</h3>
        </div>
        <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 2, padding: 0 }}>
          <li><strong>D1 Database:</strong> mailverify (<code style={{ fontSize: "0.75rem" }}>adce9a67...</code>)</li>
          <li><strong>KV Cache:</strong> CACHE (<code style={{ fontSize: "0.75rem" }}>0de8d66a...</code>)</li>
          <li><strong>Cron Trigger:</strong> Daily at Midnight (<code>0 0 * * *</code>)</li>
          <li><strong>Retention Policy:</strong> 5-Day Automatic Log Purge</li>
        </ul>
      </div>

      {/* Multi-Source Disposable Domain Intelligence Hub */}
      <div className="card" style={{ padding: "1.75rem", gridColumn: "1 / -1" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Database size={20} color="var(--accent-purple)" />
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Multi-Source Disposable Domain Database</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0 }}>
                Aggregates 10+ open-source burner feeds with deduplication, normalization, and strict corporate allowlist protection.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-black"
            onClick={onSyncDisposable}
            disabled={syncingDisposable}
            style={{ fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.45rem 0.85rem" }}
          >
            {syncingDisposable ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            <span>{syncingDisposable ? "Syncing 10+ Feeds..." : "Sync All Feeds Now"}</span>
          </button>
        </div>

        {syncMessage && (
          <div style={{ padding: "0.65rem 0.85rem", background: syncMessage.startsWith("✓") ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", border: `1px solid ${syncMessage.startsWith("✓") ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`, borderRadius: "var(--radius-sm)", color: syncMessage.startsWith("✓") ? "var(--success)" : "var(--danger)", fontSize: "0.82rem", fontWeight: 600, marginBottom: "1rem" }}>
            {syncMessage}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginTop: "0.75rem" }}>
          <div style={{ padding: "0.85rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>INTELLIGENCE FEEDS</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent-blue)" }}>10+ Sources</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>GitHub, StefanPejcic, FakeFilter</div>
          </div>

          <div style={{ padding: "0.85rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>FILTER PIPELINE</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--success)" }}>Active</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Deduplication & Normalize</div>
          </div>

          <div style={{ padding: "0.85rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>ALLOWLIST SAFEGUARD</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>Enforced</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>0% False Positive Guarantee</div>
          </div>

          <div style={{ padding: "0.85rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>AUTO-CRON SYNC</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent-purple)" }}>Daily Midnight</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Edge KV background job</div>
          </div>
        </div>
      </div>
    </div>
  );
};
