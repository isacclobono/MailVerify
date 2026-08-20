import React, { useState } from "react";
import { User, VerificationResult } from "../types";
import { api } from "../api/client";
import { StatsBar } from "../components/StatsBar";
import { CodeSnippet } from "../components/CodeSnippet";
import { FeatureGrid } from "../components/FeatureGrid";
import { FaqSection } from "../components/FaqSection";
import { VerdictBadge } from "../components/VerdictBadge";
import { ChecksDetail } from "../components/ChecksDetail";
import { Search, Loader2, ArrowRight, Sparkles, LogIn, AlertCircle } from "lucide-react";

interface HomePageProps {
  user: User | null;
  onNavigateDashboard: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ user, onNavigateDashboard }) => {
  const [email, setEmail] = useState("alex@example.com");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingChecks, setRemainingChecks] = useState<number | null>(5);
  const [loginRequired, setLoginRequired] = useState(false);

  const handleVerify = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    const targetEmail = (customEmail || email).trim();
    if (!targetEmail) return;

    setLoading(true);
    setError(null);
    setLoginRequired(false);

    try {
      const data = await api.verifyEmail(targetEmail);
      setResult(data);
      if (data.remaining_anonymous_checks !== undefined) {
        setRemainingChecks(data.remaining_anonymous_checks);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification request failed";
      setError(message);
      if (message.includes("limit") || message.includes("sign in")) {
        setLoginRequired(true);
        setRemainingChecks(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTryEmail = (sampleEmail: string) => {
    setEmail(sampleEmail);
    const testerEl = document.getElementById("tester");
    if (testerEl) {
      testerEl.scrollIntoView({ behavior: "smooth" });
    }
    handleVerify(undefined, sampleEmail);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          Verify any email. 9+ checks. Zero cost.
        </h1>
        <p className="hero-subtitle">
          Multi-layer serverless email verification: MX routing, SPF alignment, DMARC enforcement, disposable inboxes, role accounts, and syntax compliance. Built for developers.
        </p>

        <div className="hero-actions">
          {user ? (
            <button className="btn btn-black" onClick={onNavigateDashboard}>
              Go to Dashboard <ArrowRight size={15} />
            </button>
          ) : (
            <a href={api.getGoogleLoginUrl()} className="btn btn-black">
              <LogIn size={15} /> Sign in with Google
            </a>
          )}

          <a href="#tester" className="btn btn-outline">
            Test an email
          </a>

          {!user && remainingChecks !== null && (
            <span className="quota-pill">
              <Sparkles size={13} />
              {remainingChecks > 0
                ? `${remainingChecks} of 5 Guest Checks Available`
                : "Guest Limit Reached — Sign in to continue"}
            </span>
          )}
        </div>
      </section>

      {/* Metrics Row with Gold/Blue/Green/Coral Accents */}
      <StatsBar />

      {/* Live Interactive Tester */}
      <section id="tester" className="live-tester-card">
        <div style={{ marginBottom: "1rem" }}>
          <span className="section-eyebrow">LIVE INTERACTIVE TESTER</span>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Test Any Email Address in Real-time</h2>
        </div>

        <form onSubmit={handleVerify} className="search-input-group">
          <input
            type="text"
            className="clean-input"
            placeholder="Enter an email to inspect (e.g. name@domain.com)..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-black" disabled={loading || !email.trim()}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span>Run Test</span>
          </button>
        </form>

        {error && (
          <div style={{ padding: "0.75rem 1rem", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "var(--radius-md)", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            {loginRequired && (
              <a href={api.getGoogleLoginUrl()} className="btn btn-black" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}>
                Sign in with Google
              </a>
            )}
          </div>
        )}

        {/* Live Verification Result Box */}
        {result && (
          <div className="result-card">
            <div className="result-header">
              <div>
                <span className="section-eyebrow">VERDICT</span>
                <div className="result-email">{result.email}</div>
              </div>
              <VerdictBadge verdict={result.verdict} score={result.score} />
            </div>

            <ChecksDetail checks={result.checks} />
          </div>
        )}

        {/* Code Snippet Preview */}
        <div style={{ marginTop: "2rem" }}>
          <span className="section-eyebrow">INTEGRATION CODE</span>
          <CodeSnippet emailSample={email || "alex@example.com"} />
        </div>
      </section>

      {/* Feature Exploration Grid */}
      <div id="pipeline">
        <FeatureGrid onTryEmail={handleTryEmail} />
      </div>

      {/* FAQ Section */}
      <div id="faq">
        <FaqSection />
      </div>
    </div>
  );
};
