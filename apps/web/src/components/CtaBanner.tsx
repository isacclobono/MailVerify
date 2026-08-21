import { ArrowRight, LogIn, Sparkles, Key, ShieldCheck } from "lucide-react";
import { User } from "../types";
import { api } from "../api/client";

interface CtaBannerProps {
  user: User | null;
  onNavigateDashboard: () => void;
}

export const CtaBanner = ({ user, onNavigateDashboard }: CtaBannerProps) => {
  return (
    <section
      className="card"
      style={{
        margin: "3.5rem 0",
        padding: "2.5rem 2rem",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#ffffff",
        borderRadius: "var(--radius-lg)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", zIndex: 2, maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.2rem 0.65rem", borderRadius: "9999px", background: "rgba(37, 99, 235, 0.2)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#93c5fd", fontSize: "0.72rem", fontWeight: 700, marginBottom: "0.85rem" }}>
          <Sparkles size={13} />
          <span>FREE DEVELOPER ACCESS · 200 API CALLS / MONTH</span>
        </div>

        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.65rem", color: "#ffffff" }}>
          Start Verifying in Under 60 Seconds
        </h2>

        <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1.75rem" }}>
          Generate your private API keys, test individual addresses or batch upload thousands of records with zero credit card required.
        </p>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {user ? (
            <button
              className="btn btn-outline"
              onClick={onNavigateDashboard}
              style={{ background: "#ffffff", color: "#0f172a", border: "none", fontWeight: 700, padding: "0.6rem 1.25rem" }}
            >
              Open Dashboard <ArrowRight size={15} />
            </button>
          ) : (
            <a
              href={api.getGoogleLoginUrl()}
              className="btn btn-outline"
              style={{ background: "#ffffff", color: "#0f172a", border: "none", fontWeight: 700, padding: "0.6rem 1.25rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <LogIn size={15} /> Sign in with Google
            </a>
          )}

          <a
            href="/docs"
            className="btn btn-outline"
            style={{ background: "transparent", color: "#ffffff", borderColor: "#475569", padding: "0.6rem 1.25rem" }}
          >
            Read API Docs
          </a>
        </div>

        {/* Footnote perks */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1.25rem", flexWrap: "wrap", marginTop: "1.75rem", fontSize: "0.75rem", color: "#94a3b8" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <Key size={13} color="#60a5fa" /> Instant API Key Generation
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <ShieldCheck size={13} color="#34d399" /> 5-Day Auto Retention Purge
          </span>
        </div>
      </div>
    </section>
  );
};
