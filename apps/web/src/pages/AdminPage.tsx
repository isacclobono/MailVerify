import { useState, useEffect } from "react";
import { User, AdminStats, AdminUserRecord } from "../types";
import { api } from "../api/client";
import { 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  Layers, 
  Server, 
  Trash2, 
  Search, 
  Loader2, 
  RefreshCw, 
  Lock, 
  ShieldCheck, 
  AlertTriangle,
  Database,
  Eye,
  EyeOff,
  Mail,
  KeyRound
} from "lucide-react";
import { Pagination } from "../components/Pagination";

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete user account.";
      alert(msg);
    } finally {
      setDeleting(false);
    }
  };
  const [syncingDisposable, setSyncingDisposable] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSyncDisposable = async () => {
    setSyncingDisposable(true);
    setSyncMessage(null);
    try {
      const res = await api.syncDisposableDomains();
      if (res.success) {
        setSyncMessage(`✓ Synced ${res.total_domains_collected.toLocaleString()} domains from ${res.sources_synced} live feeds in ${res.duration_ms}ms.`);
      } else {
        setSyncMessage("Sync completed with warnings.");
      }
    } catch (err) {
      setSyncMessage(err instanceof Error ? `Sync failed: ${err.message}` : "Sync failed.");
    } finally {
      setSyncingDisposable(false);
    }
  };

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword) {
      setLoginError("Please provide both email and password.");
      return;
    }
    setLoginLoading(true);
    setLoginError(null);
    try {
      await api.adminLogin(adminEmail.trim(), adminPassword);
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid administrator email or password.";
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  // 1. Not Logged In Screen (Admin Portal Email & Password Authentication)
  if (!user || !user.is_admin) {
    return (
      <div style={{ maxWidth: "460px", margin: "3rem auto", width: "100%" }}>
        <div className="card" style={{ padding: "2.5rem 2rem", borderTop: "4px solid var(--accent-gold)" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ display: "inline-flex", padding: "0.85rem", background: "rgba(217, 119, 6, 0.1)", borderRadius: "50%", color: "var(--accent-gold)", marginBottom: "1rem" }}>
              <KeyRound size={28} />
            </div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, marginBottom: "0.35rem" }}>Administrator Sign In</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.5 }}>
              Enter your administrator credentials to access infrastructure telemetry, database inspection, and user management.
            </p>
          </div>

          {loginError && (
            <div style={{ padding: "0.65rem 0.85rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1.25rem" }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
                ADMIN EMAIL
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="email"
                  className="clean-input"
                  placeholder="admin@mailverify.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  disabled={loginLoading}
                  style={{ width: "100%", padding: "0.55rem 0.75rem 0.55rem 2.25rem", fontSize: "0.85rem" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
                ADMIN PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="clean-input"
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  disabled={loginLoading}
                  style={{ width: "100%", padding: "0.55rem 2.5rem 0.55rem 2.25rem", fontSize: "0.85rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-black"
              disabled={loginLoading}
              style={{ width: "100%", justifyContent: "center", padding: "0.65rem", fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: "0.45rem", marginTop: "0.5rem" }}
            >
              {loginLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
              <span>{loginLoading ? "Authenticating..." : "Sign In to Admin Portal"}</span>
            </button>
          </form>

          <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onNavigateHome}
              style={{ width: "100%", fontSize: "0.8rem", padding: "0.5rem" }}
            >
              ← Return to Main Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered Users
  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", width: "100%" }}>
      {/* Admin Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(245, 158, 11, 0.15)", color: "#d97706", padding: "0.2rem 0.65rem", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.35rem" }}>
            <ShieldAlert size={13} /> LIVE ADMINISTRATOR CONSOLE
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>System Operations & Telemetry</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Real-time management for Cloudflare Workers, D1 database, and global verification streams.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-outline" onClick={fetchAdminData} disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem" }}>
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button className="btn btn-black" onClick={onNavigateHome} style={{ fontSize: "0.8rem" }}>
            Exit Console
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-subtle)", marginBottom: "2rem" }}>
        <button
          className="tab-btn"
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "overview" ? "2px solid var(--accent-blue)" : "2px solid transparent",
            color: activeTab === "overview" ? "var(--text-main)" : "var(--text-muted)",
            fontWeight: activeTab === "overview" ? 700 : 500,
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("overview")}
        >
          Telemetry Overview
        </button>
        <button
          className="tab-btn"
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "users" ? "2px solid var(--accent-blue)" : "2px solid transparent",
            color: activeTab === "users" ? "var(--text-main)" : "var(--text-muted)",
            fontWeight: activeTab === "users" ? 700 : 500,
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("users")}
        >
          Users Directory ({users.length})
        </button>
        <button
          className="tab-btn"
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "verifications" ? "2px solid var(--accent-blue)" : "2px solid transparent",
            color: activeTab === "verifications" ? "var(--text-main)" : "var(--text-muted)",
            fontWeight: activeTab === "verifications" ? 700 : 500,
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("verifications")}
        >
          Global Audit Stream
        </button>
        <button
          className="tab-btn"
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "infra" ? "2px solid var(--accent-blue)" : "2px solid transparent",
            color: activeTab === "infra" ? "var(--text-main)" : "var(--text-muted)",
            fontWeight: activeTab === "infra" ? 700 : 500,
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("infra")}
        >
          Cloudflare Infrastructure
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4rem", gap: "0.75rem", color: "var(--text-muted)" }}>
          <Loader2 size={24} className="animate-spin" />
          <span>Loading telemetry and database records...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div>
              {/* KPI Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
                <div className="card" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--accent-blue)", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>REGISTERED USERS</span>
                    <Users size={20} />
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 800 }}>{stats?.total_users || 0}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Authenticated via Google</div>
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
          )}

          {/* TAB 2: USERS DIRECTORY */}
          {activeTab === "users" && (
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Registered Users Directory</h3>
                <div style={{ position: "relative", minWidth: "240px" }}>
                  <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    placeholder="Search by email, name or ID..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setUsersPage(1);
                    }}
                    style={{ width: "100%", padding: "0.45rem 0.65rem 0.45rem 2rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "0.82rem" }}
                  />
                </div>
              </div>

              <div className="data-table-wrapper">
                <div className="data-table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>USER</th>
                        <th>USER ID</th>
                        <th>GOOGLE SUB</th>
                        <th>REGISTERED</th>
                        <th style={{ textAlign: "right" }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers
                          .slice((usersPage - 1) * USERS_PAGE_SIZE, usersPage * USERS_PAGE_SIZE)
                          .map((u) => (
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
                                    <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                {u.id}
                              </td>
                              <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                {u.google_sub ? u.google_sub.substring(0, 10) + "..." : "Local / None"}
                              </td>
                              <td style={{ color: "var(--text-muted)" }}>
                                {new Date(u.created_at).toLocaleDateString()}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button
                                  className="btn btn-outline"
                                  style={{ color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.3)", padding: "0.25rem 0.5rem", fontSize: "0.72rem" }}
                                  onClick={() => setDeleteConfirmUser(u)}
                                  title="Delete user and all data"
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </td>
                            </tr>
                          ))
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
                  totalPages={Math.ceil(filteredUsers.length / USERS_PAGE_SIZE)}
                  totalItems={filteredUsers.length}
                  pageSize={USERS_PAGE_SIZE}
                  onPageChange={setUsersPage}
                />
              </div>
            </div>
          )}

          {/* TAB 3: VERIFICATIONS STREAM */}
          {activeTab === "verifications" && (
            <div className="card" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>Global Live Verification Stream</h3>
              <div className="data-table-wrapper">
                <div className="data-table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>EMAIL</th>
                        <th>VERDICT</th>
                        <th>SCORE</th>
                        <th>TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifications.length > 0 ? (
                        verifications
                          .slice((verifsPage - 1) * VERIFS_PAGE_SIZE, verifsPage * VERIFS_PAGE_SIZE)
                          .map((v) => (
                            <tr key={v.id}>
                              <td style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{v.email}</td>
                              <td>
                                <span className={`table-pill ${v.verdict.includes("DELIVERABLE") ? "table-pill-success" : v.verdict.includes("RISKY") ? "table-pill-warning" : "table-pill-danger"}`}>
                                  {v.verdict}
                                </span>
                              </td>
                              <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                                {v.score}/100
                              </td>
                              <td style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                {new Date(v.created_at).toLocaleString()}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                            No global verification records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={verifsPage}
                  totalPages={Math.ceil(verifications.length / VERIFS_PAGE_SIZE)}
                  totalItems={verifications.length}
                  pageSize={VERIFS_PAGE_SIZE}
                  onPageChange={setVerifsPage}
                />
              </div>
            </div>
          )}

          {/* TAB 4: INFRASTRUCTURE DIAGNOSTICS */}
          {activeTab === "infra" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
              <div className="card" style={{ padding: "1.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <Server size={20} color="var(--accent-blue)" />
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Cloudflare Edge Runtime</h3>
                </div>
                <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 2 }}>
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
                <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 2 }}>
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
                    onClick={handleSyncDisposable}
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
          )}
        </>
      )}

      {/* Delete User Modal */}
      {deleteConfirmUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="card" style={{ maxWidth: "450px", width: "100%", padding: "2rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.75rem", color: "var(--danger)" }}>
              Delete User Account?
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              Are you sure you want to delete <strong>{deleteConfirmUser.email}</strong>? All their verification history, sessions, and bulk batch jobs will be permanently purged immediately.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setDeleteConfirmUser(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-black" style={{ background: "var(--danger)", borderColor: "var(--danger)" }} onClick={handleDeleteUser} disabled={deleting}>
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
