import { useState } from "react";
import { Lock, Mail, KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";
import { api } from "../../api/client";
import { toast } from "sonner";

interface AdminLoginCardProps {
  onNavigateHome: () => void;
}

export const AdminLoginCard = ({ onNavigateHome }: AdminLoginCardProps) => {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword) {
      setLoginError("Please provide both email and password.");
      toast.error("Please provide both email and password.");
      return;
    }
    setLoginLoading(true);
    setLoginError(null);
    try {
      await api.adminLogin(adminEmail.trim(), adminPassword);
      toast.success("Administrator authentication successful!");
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid administrator email or password.";
      setLoginError(msg);
      toast.error(msg);
    } finally {
      setLoginLoading(false);
    }
  };

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
};
