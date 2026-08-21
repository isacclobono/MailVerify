import { useState, FormEvent } from "react";
import { Plus, Loader2, Copy, Check, Trash2 } from "lucide-react";
import { ApiKeyItem, GeneratedApiKeyResponse } from "../../types";
import { formatTimeAgo, formatUtcDateTime } from "../../utils/time";
import { toast } from "sonner";

interface DashboardKeysTabProps {
  apiKeys: ApiKeyItem[];
  keysLoading: boolean;
  generatingKey: boolean;
  createdKey: GeneratedApiKeyResponse | null;
  newKeyName: string;
  setNewKeyName: (name: string) => void;
  onCreateKey: (e: FormEvent) => void;
  onDeleteKey: (keyId: string) => void;
}

export const DashboardKeysTab = ({
  apiKeys,
  keysLoading,
  generatingKey,
  createdKey,
  newKeyName,
  setNewKeyName,
  onCreateKey,
  onDeleteKey,
}: DashboardKeysTabProps) => {
  const [copiedToken, setCopiedToken] = useState(false);

  return (
    <div>
      {/* Top Key Generation Box */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.35rem" }}>Generate New API Key</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1.25rem" }}>
          Authenticate backend requests via <code>X-API-Key: mv_live_...</code> or <code>Authorization: Bearer &lt;key&gt;</code>.
        </p>

        <form onSubmit={onCreateKey} style={{ display: "flex", gap: "0.65rem", maxWidth: "520px" }}>
          <input
            type="text"
            className="clean-input"
            placeholder="Key label (e.g. Production Backend, Zapier)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            required
            disabled={generatingKey || apiKeys.length >= 5}
          />
          <button
            type="submit"
            className="btn btn-black"
            disabled={generatingKey || !newKeyName.trim() || apiKeys.length >= 5}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap", fontSize: "0.8rem", padding: "0.55rem 1rem" }}
          >
            {generatingKey ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            <span>Create Key</span>
          </button>
        </form>

        {createdKey && (
          <div style={{ marginTop: "1.25rem", padding: "0.85rem 1rem", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontWeight: 700, color: "var(--success)", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
              🎉 API Key Created! Copy it now (it won't be displayed again):
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <code style={{ background: "#0f172a", color: "#34d399", padding: "0.45rem 0.65rem", borderRadius: "var(--radius-sm)", fontSize: "0.82rem", fontFamily: "var(--font-mono)", flex: 1, overflowX: "auto" }}>
                {createdKey.raw_key}
              </code>
              <button
                className="btn btn-black"
                onClick={() => {
                  navigator.clipboard.writeText(createdKey.raw_key);
                  setCopiedToken(true);
                  toast.success("API Key Copied", {
                    description: "Secret token copied to clipboard. Keep it safe!",
                  });
                  setTimeout(() => setCopiedToken(false), 2000);
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", padding: "0.45rem 0.75rem" }}
              >
                {copiedToken ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedToken ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Keys List */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.85rem" }}>Active API Keys ({apiKeys.length}/5)</h3>
        {keysLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>
            <Loader2 size={14} className="animate-spin" /> Loading keys...
          </div>
        ) : apiKeys.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>No API keys generated yet. Create one above to get started.</p>
        ) : (
          <div className="data-table-wrapper">
            <div className="data-table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Prefix</th>
                    <th>Created</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((k) => (
                    <tr key={k.id}>
                      <td style={{ fontWeight: 600 }}>{k.name}</td>
                      <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.78rem" }}>{k.key_prefix}...</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.78rem" }} title={formatUtcDateTime(k.created_at)}>{formatTimeAgo(k.created_at)}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => onDeleteKey(k.id)}
                          style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 600 }}
                        >
                          <Trash2 size={13} /> Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
