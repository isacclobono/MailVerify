import { useState, useEffect } from "react";
import { User } from "./types";
import { api } from "./api/client";
import { Header, AppView } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocsPage } from "./pages/DocsPage";
import { PricingPage } from "./pages/PricingPage";
import { PrivacyTermsPage } from "./pages/PrivacyTermsPage";
import { AdminPage } from "./pages/AdminPage";
import { DnsMxCheckerPage } from "./pages/DnsMxCheckerPage";
import { SpfDmarcAuditPage } from "./pages/SpfDmarcAuditPage";
import { InfrastructurePage } from "./pages/InfrastructurePage";
import { AccountQuotasPage } from "./pages/AccountQuotasPage";
import { useHourlyFont } from "./hooks/useHourlyFont";
import { AlertCircle, Loader2 } from "lucide-react";
import { Toaster } from "sonner";

function getPathForView(view: AppView): string {
  switch (view) {
    case "pricing":
      return "/pricing";
    case "docs":
      return "/docs";
    case "dashboard":
      return "/dashboard";
    case "admin":
      return "/admin";
    case "dns-mx":
      return "/dns-mx";
    case "spf-dmarc":
      return "/spf-dmarc";
    case "privacy":
      return "/privacy";
    case "account-quotas":
      return "/account";
    case "infra":
      return "/infra";
    case "home":
    default:
      return "/";
  }
}

function getViewFromPath(pathname: string): AppView {
  const p = pathname.toLowerCase();
  if (p.includes("pricing")) return "pricing";
  if (p.includes("docs")) return "docs";
  if (p.includes("dashboard")) return "dashboard";
  if (p.includes("admin")) return "admin";
  if (p.includes("dns") || p.includes("mx")) return "dns-mx";
  if (p.includes("spf") || p.includes("dmarc")) return "spf-dmarc";
  if (p.includes("privacy") || p.includes("terms")) return "privacy";
  if (p.includes("account") || p.includes("quota")) return "account-quotas";
  if (p.includes("infra")) return "infra";
  return "home";
}

export function App() {
  useHourlyFont(); // Automatically applies Poppins on even hours & Zain on odd hours

  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== "undefined") {
      return getViewFromPath(window.location.pathname);
    }
    return "home";
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial view from URL path
    const initialView = getViewFromPath(window.location.pathname);
    setCurrentView(initialView);

    // 2. Listen to browser Back/Forward navigation
    const handlePopState = () => {
      const view = getViewFromPath(window.location.pathname);
      setCurrentView(view);
    };
    window.addEventListener("popstate", handlePopState);

    // 3. Check for OAuth callback parameters
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    const tokenParam = params.get("token");

    if (tokenParam) {
      console.log("[MailVerify Auth] Received token from OAuth redirect.");
      localStorage.setItem("mv_token", tokenParam);
      setCurrentView("dashboard");
      window.history.replaceState({ view: "dashboard" }, document.title, "/dashboard");
    }

    if (errorParam) {
      console.warn("[MailVerify Auth] Error returned from OAuth:", errorParam);
      setAuthError(decodeURIComponent(errorParam));
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 4. Check if user is logged in
    api
      .getCurrentUser()
      .then((currentUser) => {
        if (currentUser) {
          console.log("[MailVerify Auth] Authenticated user:", currentUser.email, "Admin:", Boolean(currentUser.is_admin));
          setUser(currentUser);
          if (tokenParam || window.location.pathname.includes("dashboard")) {
            setCurrentView("dashboard");
          }
        }
      })
      .catch((err) => {
        console.warn("[MailVerify Auth] Failed to fetch user session:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout request errors
    }
    setUser(null);
    handleNavigate("home");
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    const targetPath = getPathForView(view);
    const fullTarget = targetPath + window.location.search;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view }, document.title, fullTarget);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-container">
      <Toaster position="top-right" richColors closeButton />
      <Header
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentView={currentView}
      />

      {authError && (
        <div style={{ maxWidth: "1120px", margin: "1rem auto 0", padding: "0 1.5rem", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--danger-bg)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)" }}>
            <AlertCircle size={18} />
            <span>Authentication Notice: {authError}</span>
          </div>
        </div>
      )}

      <main className="main-content">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", gap: "0.75rem", color: "var(--text-muted)" }}>
            <Loader2 size={24} className="animate-spin" />
            <span>Loading MailVerify...</span>
          </div>
        ) : currentView === "admin" ? (
          <AdminPage user={user} onNavigateHome={() => handleNavigate("home")} />
        ) : currentView === "dns-mx" ? (
          <DnsMxCheckerPage onNavigateHome={() => handleNavigate("home")} />
        ) : currentView === "spf-dmarc" ? (
          <SpfDmarcAuditPage onNavigateHome={() => handleNavigate("home")} />
        ) : currentView === "infra" ? (
          <InfrastructurePage />
        ) : currentView === "account-quotas" ? (
          <AccountQuotasPage user={user} onNavigateDashboard={() => handleNavigate("dashboard")} />
        ) : currentView === "docs" ? (
          <DocsPage />
        ) : currentView === "pricing" ? (
          <PricingPage onNavigateHome={() => handleNavigate("home")} />
        ) : currentView === "privacy" ? (
          <PrivacyTermsPage />
        ) : currentView === "dashboard" && user ? (
          <DashboardPage user={user} onLogout={handleLogout} />
        ) : (
          <HomePage
            user={user}
            onNavigateDashboard={() => handleNavigate("dashboard")}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
