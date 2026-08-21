import { useState, FormEvent } from "react";
import { User, VerificationResult } from "../types";
import { api } from "../api/client";
import { HeroSection } from "../components/HeroSection";
import { StatsBar } from "../components/StatsBar";
import { LiveTester } from "../components/LiveTester";
import { PipelineFlowDiagram } from "../components/PipelineFlowDiagram";
import { FeatureGrid } from "../components/FeatureGrid";
import { ComparisonSection } from "../components/ComparisonSection";
import { CtaBanner } from "../components/CtaBanner";
import { FaqSection } from "../components/FaqSection";

interface HomePageProps {
  user: User | null;
  onNavigateDashboard: () => void;
}

export const HomePage = ({ user, onNavigateDashboard }: HomePageProps) => {
  const [email, setEmail] = useState("alex@example.com");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingChecks, setRemainingChecks] = useState<number | null>(5);
  const [loginRequired, setLoginRequired] = useState(false);

  const handleVerify = async (e?: FormEvent, customEmail?: string) => {
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
      {/* 1. Hero Section */}
      <HeroSection
        user={user}
        remainingChecks={remainingChecks}
        onNavigateDashboard={onNavigateDashboard}
        onQuickSampleSelect={handleTryEmail}
      />

      {/* 2. Platform Telemetry Metrics */}
      <StatsBar />

      {/* 3. Live Interactive Tester & Code Console */}
      <LiveTester
        email={email}
        setEmail={setEmail}
        loading={loading}
        result={result}
        error={error}
        loginRequired={loginRequired}
        onVerify={handleVerify}
        onTryEmail={handleTryEmail}
      />

      {/* 4. Verification Pipeline Flow Architecture */}
      <div id="architecture">
        <PipelineFlowDiagram onSelectPipelineStage={() => handleTryEmail(email)} />
      </div>

      {/* 5. Sub-Pipeline Feature Grid with Live Test Modals */}
      <div id="pipeline">
        <FeatureGrid onTryEmail={handleTryEmail} />
      </div>

      {/* 6. Comparison Table (MailVerify vs Legacy Socket Checks) */}
      <div id="comparison">
        <ComparisonSection />
      </div>

      {/* 7. Bottom CTA Banner */}
      <CtaBanner
        user={user}
        onNavigateDashboard={onNavigateDashboard}
      />

      {/* 8. Contextual FAQ Section */}
      <div id="faq">
        <FaqSection />
      </div>
    </div>
  );
};
