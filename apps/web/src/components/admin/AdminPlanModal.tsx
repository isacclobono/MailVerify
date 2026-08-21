import React from "react";
import { Sliders, Loader2 } from "lucide-react";
import { AdminUserRecord } from "../../types";

interface AdminPlanModalProps {
  editingUser: AdminUserRecord;
  selectedPlan: string;
  onSelectedPlanChange: (plan: string) => void;
  customLimitInput: string;
  onCustomLimitInputChange: (limit: string) => void;
  savingPlan: boolean;
  planSaveError: string | null;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const AdminPlanModal = ({
  editingUser,
  selectedPlan,
  onSelectedPlanChange,
  customLimitInput,
  onCustomLimitInputChange,
  savingPlan,
  planSaveError,
  onSave,
  onClose,
}: AdminPlanModalProps) => {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div className="card" style={{ maxWidth: "480px", width: "100%", padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <Sliders size={20} color="var(--accent-blue)" />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>
            Manage User Plan & Quota
          </h3>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
          User: <strong style={{ color: "var(--text-main)", fontFamily: "var(--font-mono)" }}>{editingUser.email}</strong>
        </p>

        {planSaveError && (
          <div style={{ padding: "0.6rem 0.85rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1rem" }}>
            {planSaveError}
          </div>
        )}

        <form onSubmit={onSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
              SELECT SUBSCRIPTION PLAN
            </label>
            <select
              value={selectedPlan}
              onChange={(e) => {
                const p = e.target.value;
                onSelectedPlanChange(p);
                if (p === "free") onCustomLimitInputChange("200");
                else if (p === "starter") onCustomLimitInputChange("1000");
                else if (p === "pro") onCustomLimitInputChange("10000");
                else if (p === "enterprise") onCustomLimitInputChange("100000");
                else if (p === "unlimited" || p === "admin") onCustomLimitInputChange("-1");
              }}
              className="clean-input"
              style={{ width: "100%", padding: "0.55rem 0.75rem", fontSize: "0.85rem" }}
              disabled={savingPlan}
            >
              <option value="free">Free Tier (200 checks / mo)</option>
              <option value="starter">Starter Tier (1,000 checks / mo)</option>
              <option value="pro">Pro Tier (10,000 checks / mo)</option>
              <option value="enterprise">Enterprise Tier (100,000 checks / mo)</option>
              <option value="unlimited">Unlimited Plan (∞ No Limits)</option>
              <option value="custom">Custom Quota Limit</option>
            </select>
          </div>

          {selectedPlan === "custom" && (
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
                CUSTOM MONTHLY CALL LIMIT (Enter -1 for Unlimited)
              </label>
              <input
                type="number"
                className="clean-input"
                value={customLimitInput}
                onChange={(e) => onCustomLimitInputChange(e.target.value)}
                required
                min={-1}
                disabled={savingPlan}
                style={{ width: "100%", padding: "0.55rem 0.75rem", fontSize: "0.85rem" }}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={savingPlan}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-black"
              disabled={savingPlan}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              {savingPlan ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>{savingPlan ? "Saving..." : "Save Plan Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
