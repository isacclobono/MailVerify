import { useState, useEffect } from "react";
import { User, AdminStats, AdminUserRecord } from "../types";
import { api } from "../api/client";
import { 
  ShieldAlert, 
  Users, 
  Layers, 
  Server, 
  Loader2, 
  RefreshCw, 
  AlertTriangle
} from "lucide-react";
import { AdminLoginCard } from "../components/admin/AdminLoginCard";
import { AdminOverviewTab } from "../components/admin/AdminOverviewTab";
import { AdminUsersTab } from "../components/admin/AdminUsersTab";
import { AdminVerificationsTab } from "../components/admin/AdminVerificationsTab";
import { AdminInfraTab } from "../components/admin/AdminInfraTab";
import { AdminPlanModal } from "../components/admin/AdminPlanModal";
import { AdminDeleteUserModal } from "../components/admin/AdminDeleteUserModal";
import { toast } from "sonner";

interface AdminPageProps {
  user: User | null;
  onNavigateHome: () => void;
}

type AdminTab = "overview" | "users" | "verifications" | "infra";

export const AdminPage = ({ user, onNavigateHome }: AdminPageProps) => {
  const getInitialTab = (): AdminTab => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as AdminTab;
      const valid: AdminTab[] = ["overview", "users", "verifications", "infra"];
      return valid.includes(tab) ? tab : "overview";
    } catch {
      return "overview";
    }
  };

  const [activeTab, setActiveTabState] = useState<AdminTab>(getInitialTab);

  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    try {
      const url = new URL(window.location.href);
      if (tab === "overview") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab);
      }
      window.history.replaceState({}, "", url.pathname + url.search);
    } catch {
      // Ignore error
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getInitialTab());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [verifications, setVerifications] = useState<Array<{
    id: string;
    user_id: string | null;
    email: string;
    normalized_email: string;
    verdict: string;
    score: number;
    created_at: string;
  }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AdminUserRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination states
  const [usersPage, setUsersPage] = useState(1);
  const [verifsPage, setVerifsPage] = useState(1);
  const USERS_PAGE_SIZE = 10;
  const VERIFS_PAGE_SIZE = 15;

  const fetchAdminData = async () => {
    if (!user || !user.is_admin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [statsData, usersData, verifsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(100, 0),
        api.getAdminVerifications(100, 0),
      ]);

      setStats(statsData);
      setUsers(usersData.users);
      setVerifications(verifsData.verifications);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load admin telemetry data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setDeleting(true);
    try {
      await api.deleteAdminUser(deleteConfirmUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirmUser.id));
      toast.success(`User ${deleteConfirmUser.email} deleted successfully.`);
      setDeleteConfirmUser(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete user account.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Disposable Sync State
  const [syncingDisposable, setSyncingDisposable] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSyncDisposable = async () => {
    setSyncingDisposable(true);
    setSyncMessage(null);
    const toastId = toast.loading("Syncing 10+ open-source disposable domain intelligence feeds...");
    try {
      const res = await api.syncDisposableDomains();
      if (res.success) {
        const msg = `✓ Synced ${res.total_domains_collected.toLocaleString()} domains from ${res.sources_synced} live feeds in ${res.duration_ms}ms.`;
        setSyncMessage(msg);
        toast.success(msg, { id: toastId });
      } else {
        setSyncMessage("Sync completed with warnings.");
        toast.warning("Sync completed with warnings.", { id: toastId });
      }
    } catch (err) {
      const errMsg = err instanceof Error ? `Sync failed: ${err.message}` : "Sync failed.";
      setSyncMessage(errMsg);
      toast.error(errMsg, { id: toastId });
    } finally {
      setSyncingDisposable(false);
    }
  };

  // Plan Editing State
  const [editingUserPlan, setEditingUserPlan] = useState<AdminUserRecord | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [customLimitInput, setCustomLimitInput] = useState("200");
  const [savingPlan, setSavingPlan] = useState(false);
  const [planSaveError, setPlanSaveError] = useState<string | null>(null);

  const handleOpenPlanModal = (targetUser: AdminUserRecord) => {
    setEditingUserPlan(targetUser);
    setSelectedPlan(targetUser.plan || "free");
    setCustomLimitInput(
      typeof targetUser.monthly_limit === "number" ? targetUser.monthly_limit.toString() : "200"
    );
    setPlanSaveError(null);
  };

  const handleSaveUserPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserPlan) return;
    setSavingPlan(true);
    setPlanSaveError(null);

    let limit = 200;
    if (selectedPlan === "free") limit = 200;
    else if (selectedPlan === "starter") limit = 1000;
    else if (selectedPlan === "pro") limit = 10000;
    else if (selectedPlan === "enterprise") limit = 100000;
    else if (selectedPlan === "admin" || selectedPlan === "unlimited") limit = -1;
    else {
      const parsed = parseInt(customLimitInput, 10);
      limit = isNaN(parsed) ? 200 : parsed;
    }

    try {
      await api.updateAdminUserPlan(editingUserPlan.id, selectedPlan, limit);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUserPlan.id
            ? { ...u, plan: selectedPlan, monthly_limit: limit }
            : u
        )
      );
      toast.success(`Plan for ${editingUserPlan.email} updated to ${selectedPlan.toUpperCase()} (${limit === -1 ? 'Unlimited' : `${limit.toLocaleString()}/mo`})`);
      setEditingUserPlan(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update user plan.";
      setPlanSaveError(msg);
      toast.error(msg);
    } finally {
      setSavingPlan(false);
    }
  };

  // If not logged in as admin, show dedicated email/password login card
  if (!user || !user.is_admin) {
    return <AdminLoginCard onNavigateHome={onNavigateHome} />;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Administrator Console
            </h1>
            <span className="badge-admin">ROOT PRIVILEGES</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Live platform telemetry, subscription plan control, and edge infrastructure management.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            className="btn btn-outline"
            onClick={() => {
              fetchAdminData();
              toast.info("Refreshing telemetry & records...");
            }}
            disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem", marginBottom: "1.5rem", overflowX: "auto" }}>
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
        >
          <Layers size={15} />
          <span>Platform Overview</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
        >
          <Users size={15} />
          <span>Users & Quotas ({users.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "verifications" ? "active" : ""}`}
          onClick={() => setActiveTab("verifications")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
        >
          <ShieldAlert size={15} />
          <span>Audit Stream ({verifications.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "infra" ? "active" : ""}`}
          onClick={() => setActiveTab("infra")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
        >
          <Server size={15} />
          <span>Edge & Intelligence Hub</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem", gap: "0.75rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          <Loader2 size={24} className="animate-spin" />
          <span>Loading telemetry and database records...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && <AdminOverviewTab stats={stats} />}

          {/* TAB 2: USERS DIRECTORY */}
          {activeTab === "users" && (
            <AdminUsersTab
              users={users}
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setUsersPage(1);
              }}
              usersPage={usersPage}
              onPageChange={setUsersPage}
              pageSize={USERS_PAGE_SIZE}
              onOpenPlanModal={handleOpenPlanModal}
              onOpenDeleteModal={setDeleteConfirmUser}
            />
          )}

          {/* TAB 3: VERIFICATIONS STREAM */}
          {activeTab === "verifications" && (
            <AdminVerificationsTab
              verifications={verifications}
              verifsPage={verifsPage}
              onPageChange={setVerifsPage}
              pageSize={VERIFS_PAGE_SIZE}
            />
          )}

          {/* TAB 4: INFRASTRUCTURE & DISPOSABLE DB */}
          {activeTab === "infra" && (
            <AdminInfraTab
              syncingDisposable={syncingDisposable}
              syncMessage={syncMessage}
              onSyncDisposable={handleSyncDisposable}
            />
          )}
        </>
      )}

      {/* Delete User Modal */}
      {deleteConfirmUser && (
        <AdminDeleteUserModal
          user={deleteConfirmUser}
          deleting={deleting}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteConfirmUser(null)}
        />
      )}

      {/* Edit User Plan & Quota Modal */}
      {editingUserPlan && (
        <AdminPlanModal
          editingUser={editingUserPlan}
          selectedPlan={selectedPlan}
          onSelectedPlanChange={setSelectedPlan}
          customLimitInput={customLimitInput}
          onCustomLimitInputChange={setCustomLimitInput}
          savingPlan={savingPlan}
          planSaveError={planSaveError}
          onSave={handleSaveUserPlan}
          onClose={() => setEditingUserPlan(null)}
        />
      )}
    </div>
  );
};
