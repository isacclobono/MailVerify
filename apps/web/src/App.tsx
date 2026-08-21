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

export function App() {
  useHourlyFont(); // Automatically applies Poppins on even hours & Zain on odd hours

  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    const tokenParam = params.get("token");
    const viewParam = params.get("view") as AppView | null;

    // Check pathname or query param for initial view
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (pathname.includes("admin") || viewParam === "admin") {
      setCurrentView("admin");
    } else if (pathname.includes("dns") || pathname.includes("mx") || viewParam === "dns-mx" || hash.includes("dns")) {
      setCurrentView("dns-mx");
    } else if (pathname.includes("spf") || pathname.includes("dmarc") || viewParam === "spf-dmarc" || hash.includes("spf")) {
      setCurrentView("spf-dmarc");
    } else if (pathname.includes("infra") || viewParam === "infra") {
      setCurrentView("infra");
    } else if (pathname.includes("quota") || pathname.includes("account") || viewParam === "account-quotas") {
      setCurrentView("account-quotas");
    } else if (pathname.includes("docs") || viewParam === "docs") {
      setCurrentView("docs");
    } else if (pathname.includes("pricing") || viewParam === "pricing") {
      setCurrentView("pricing");
    } else if (pathname.includes("privacy") || pathname.includes("terms") || viewParam === "privacy") {
      setCurrentView("privacy");
    } else if (pathname.includes("dashboard") || viewParam === "dashboard") {
      setCurrentView("dashboard");
    }

    if (tokenParam) {
      console.log("[MailVerify Auth] Received token from OAuth redirect.");
      localStorage.setItem("mv_token", tokenParam);
      setCurrentView("dashboard");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (errorParam) {
      console.warn("[MailVerify Auth] Error returned from OAuth:", errorParam);
      setAuthError(decodeURIComponent(errorParam));
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check if user is logged in
    api
      .getCurrentUser()
      .then((currentUser) => {
        if (currentUser) {
          console.log("[MailVerify Auth] Authenticated user:", currentUser.email, "Admin:", Boolean(currentUser.is_admin));
          setUser(currentUser);
          if (tokenParam || pathname.includes("dashboard")) {
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
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout request errors
    }
    setUser(null);
    setCurrentView("home");
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-container">
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
