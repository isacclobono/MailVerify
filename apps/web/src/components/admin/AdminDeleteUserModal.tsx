import { AdminUserRecord } from "../../types";

interface AdminDeleteUserModalProps {
  user: AdminUserRecord;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AdminDeleteUserModal = ({
  user,
  deleting,
  onConfirm,
  onCancel,
}: AdminDeleteUserModalProps) => {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div className="card" style={{ maxWidth: "450px", width: "100%", padding: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.75rem", color: "var(--danger)" }}>
          Delete User Account?
        </h3>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "1.5rem" }}>
          Are you sure you want to delete <strong>{user.email}</strong>? All their verification history, sessions, and bulk batch jobs will be permanently purged immediately.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-black"
            style={{ background: "var(--danger)", borderColor: "var(--danger)" }}
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Permanently Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
