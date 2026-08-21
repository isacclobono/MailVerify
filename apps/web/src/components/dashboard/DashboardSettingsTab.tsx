import { User } from "../../types";
import { api } from "../../api/client";
import { toast } from "sonner";

interface DashboardSettingsTabProps {
  user: User;
  onLogout: () => void;
}

export const DashboardSettingsTab = ({ user, onLogout }: DashboardSettingsTabProps) => {
  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you absolutely sure you want to permanently erase your account and all data? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.deleteAccount();
      toast.success("Account Permanently Deleted", {
        description: "Your user profile, API keys, and validation logs have been purged.",
      });
      onLogout();
    } catch (err: unknown) {
      toast.error("Account Deletion Failed", {
        description: err instanceof Error ? err.message : "Failed to delete account.",
      });
    }
  };

  return (
    <div className="card" style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>Account Governance</h2>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Signed in email</div>
        <div style={{ fontSize: "1rem", fontWeight: 600 }}>{user.email}</div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--danger)", marginBottom: "0.5rem" }}>
          Danger Zone
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1rem" }}>
          Permanently delete your profile, API keys, and all verification history under GDPR right to erasure.
        </p>
        <button
          type="button"
          className="btn"
          onClick={handleDeleteAccount}
          style={{ background: "var(--danger)", color: "#fff", border: "none" }}
        >
          Permanently Delete Account
        </button>
      </div>
    </div>
  );
};
