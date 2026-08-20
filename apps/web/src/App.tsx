import React, { useState, useEffect } from "react";
import { User } from "./types";
import { api } from "./api/client";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { useHourlyFont } from "./hooks/useHourlyFont";

export function App() {
  useHourlyFont(); // Automatically applies Poppins on even hours & Zain on odd hours

  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<"home" | "dashboard">("home");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check if OAuth returned with an error
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    if (errorParam) {
      setAuthError(decodeURIComponent(errorParam));
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check if user is logged in
    api
      .getCurrentUser()
      .then((currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          if (window.location.pathname.includes("dashboard")) {
            setCurrentView("dashboard");
          }
        }
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

  return (
    <div className="app-container">
      <Header
        user={user}
        onLogout={handleLogout}
        onNavigateHome={() => setCurrentView("home")}
        onNavigateDashboard={() => setCurrentView("dashboard")}
        currentView={currentView}
      />

      {authError && (
        <div style={{ maxWidth: "1200px", margin: "1rem auto 0", padding: "0 1.5rem", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--danger-bg)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)" }}>
            <AlertCircle size={18} />
            <span>Authentication Notice: {authError}</span>
          </div>
        </div>
      )}

      <main className="main-content">
        {currentView === "dashboard" && user ? (
          <DashboardPage user={user} onLogout={handleLogout} />
        ) : (
          <HomePage
            user={user}
            onNavigateDashboard={() => setCurrentView("dashboard")}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
