import { Search, Users, Trash2, Sliders } from "lucide-react";
import { AdminUserRecord } from "../../types";
import { Pagination } from "../Pagination";
import { formatTimeAgo, formatUtcDateTime } from "../../utils/time";

interface AdminUsersTabProps {
  users: AdminUserRecord[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  usersPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onOpenPlanModal: (user: AdminUserRecord) => void;
  onOpenDeleteModal: (user: AdminUserRecord) => void;
}

export const AdminUsersTab = ({
  users,
  searchQuery,
  onSearchChange,
  usersPage,
  onPageChange,
  pageSize,
  onOpenPlanModal,
  onOpenDeleteModal,
}: AdminUsersTabProps) => {
  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Registered Users Directory</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", margin: 0 }}>
            Inspect accounts, modify plan limits, and manage permissions.
          </p>
        </div>
        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="clean-input"
            placeholder="Search by email, name or ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: "100%", padding: "0.45rem 0.65rem 0.45rem 2rem", fontSize: "0.82rem" }}
          />
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>USER</th>
                <th>PLAN</th>
                <th>MONTHLY LIMIT</th>
                <th>REGISTERED</th>
                <th style={{ textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers
                  .slice((usersPage - 1) * pageSize, usersPage * pageSize)
                  .map((u) => {
                    const isAdmin = u.is_admin || u.plan === "admin" || u.email.toLowerCase().includes("admin@mailverify.com");
                    const isUnlimited = u.monthly_limit === -1 || u.plan === "unlimited" || isAdmin;
                    const planLabel = isAdmin ? "ADMIN" : (u.plan || "free").toUpperCase();
                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={u.email} style={{ width: "22px", height: "22px", borderRadius: "50%" }} />
                            ) : (
                              <Users size={18} color="var(--text-muted)" />
                            )}
                            <div>
                              <div style={{ fontWeight: 600 }}>{u.name || "Anonymous User"}</div>
                              <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`table-pill ${
                              planLabel === "ADMIN" || planLabel === "UNLIMITED"
                                ? "table-pill-purple"
                                : planLabel === "PRO" || planLabel === "ENTERPRISE"
                                ? "table-pill-success"
                                : planLabel === "STARTER"
                                ? "table-pill-blue"
                                : "table-pill-muted"
                            }`}
                            style={{ fontWeight: 700 }}
                          >
                            {planLabel}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: isUnlimited ? "var(--accent-purple)" : "#0f172a" }}>
                            {isUnlimited ? "∞ Unlimited" : `${(u.monthly_limit || 200).toLocaleString()} / mo`}
                          </span>
                        </td>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.75rem" }} title={formatUtcDateTime(u.created_at)}>
                          {formatTimeAgo(u.created_at)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ padding: "0.25rem 0.5rem", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                              onClick={() => onOpenPlanModal(u)}
                              title="Edit Plan & Quota Limit"
                            >
                              <Sliders size={12} /> Plan
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.3)", padding: "0.25rem 0.5rem", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                              onClick={() => onOpenDeleteModal(u)}
                              title="Delete user and all data"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No users matched your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={usersPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};
