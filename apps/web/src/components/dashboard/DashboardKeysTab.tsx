import { useState, FormEvent } from "react";
import { Plus, Loader2, Copy, Check, Trash2, Key, CheckCircle2 } from "lucide-react";
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
  const [acknowledgedKey, setAcknowledgedKey] = useState(false);

  return (
    <div>
      {/* Top Key Generation Box */}
      <div className="card" style={{ padding: "1.75rem", marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
          <Key size={18} color="var(--accent-blue)" />
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Developer API Keys
          </h2>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
          Authenticate automated requests from your backend servers, Zapier, or marketing automation tools via <code>X-API-Key</code>.
        </p>

        <form onSubmit={onCreateKey} style={{ display: "flex", gap: "0.65rem", maxWidth: "560px" }}>
          <input
            type="text"
            className="clean-input"
            placeholder="Key label (e.g. Production Backend, Marketing Webhook)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            required
            disabled={generatingKey || apiKeys.length >= 5}
          />
          <button
            type="submit"
            className="btn btn-black"
            disabled={generatingKey || !newKeyName.trim() || apiKeys.length >= 5}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap", fontSize: "0.82rem", padding: "0.55rem 1.1rem" }}
          >
            {generatingKey ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            <span>Create Key</span>
          </button>
        </form>

        {/* High-Impact Secret Key Created Banner */}
        {createdKey && !acknowledgedKey && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.25rem",
              background: "rgba(16, 185, 129, 0.06)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 800, color: "var(--success)", fontSize: "0.9rem", marginBottom: "0.35rem" }}>
              <CheckCircle2 size={16} />
              <span>API Key Generated Successfully</span>
            </div>
            <p style={{ color: "#334155", fontSize: "0.8rem", margin: "0 0 0.85rem 0" }}>
              ⚠️ <strong>This secret key will never be shown again.</strong> Copy it now and store it in your server's environment variables.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
              <code style={{ background: "#0f172a", color: "#34d399", padding: "0.55rem 0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", fontFamily: "var(--font-mono)", flex: 1, overflowX: "auto" }}>
                {createdKey.raw_key}
              </code>
              <button
                type="button"
                className="btn btn-black"
                onClick={() => {
                  navigator.clipboard.writeText(createdKey.raw_key);
                  setCopiedToken(true);
                  toast.success("API Key Copied", {
                    description: "Secret token copied to clipboard. Keep it safe!",
                  });
                  setTimeout(() => setCopiedToken(false), 2000);
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", padding: "0.55rem 0.85rem" }}
              >
                {copiedToken ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedToken ? "Copied" : "Copy Key"}</span>
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setAcknowledgedKey(true)}
                style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem" }}
              >
                I've copied and saved this key ✓
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Keys List */}
      <div className="card" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>Active API Keys</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0.15rem 0 0 0" }}>
              Currently active authentication tokens ({apiKeys.length} of 5 used).
            </p>
          </div>
        </div>

        {keysLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem", padding: "1.5rem 0" }}>
            <Loader2 size={16} className="animate-spin" /> Loading API keys...
          </div>
        ) : apiKeys.length === 0 ? (
          <div style={{ border: "2px dashed var(--border-subtle)", padding: "2.5rem 1.5rem", textAlign: "center", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "inline-flex", padding: "0.6rem", background: "var(--bg-subtle)", borderRadius: "50%", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
              <Key size={20} />
            </div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.2rem" }}>
              No API keys generated yet
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0 }}>
              Use the form above to generate your first API key for backend integrations.
            </p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <div className="data-table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Key Label</th>
                    <th>Identifier Prefix</th>
                    <th>Created</th>
                    <th style={{ textAlign: "right" }}>Revoke</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((k) => (
                    <tr key={k.id}>
                      <td style={{ fontWeight: 600 }}>{k.name}</td>
                      <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.8rem" }}>{k.key_prefix}...</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.78rem" }} title={formatUtcDateTime(k.created_at)}>{formatTimeAgo(k.created_at)}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => onDeleteKey(k.id)}
                          style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.76rem", fontWeight: 600 }}
                        >
                          <Trash2 size={13} /> Revoke Key
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
