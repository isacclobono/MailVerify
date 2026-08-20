import React, { useState } from "react";
import { CodeSnippet } from "./CodeSnippet";
import { X, ExternalLink } from "lucide-react";

interface FeatureCard {
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  sampleEmail: string;
  details: string;
}

export const FeatureGrid: React.FC<{ onTryEmail: (email: string) => void }> = ({ onTryEmail }) => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureCard | null>(null);

  const features: FeatureCard[] = [
    {
      tag: "SYNTAX",
      tagColor: "#d97706",
      title: "RFC 5322 Syntax Validation",
      description: "Checks length boundaries, double dots, unquoted spaces, invalid characters, and TLD validity without fragile regex.",
      sampleEmail: "john.doe+tag@example.com",
      details: "Performs strict structural validation conforming to standard email specifications while preventing regex denial of service (ReDoS).",
    },
    {
      tag: "DNS & MX",
      tagColor: "#3b82f6",
      title: "Real-time DNS & MX Routing",
      description: "Direct DNS-over-HTTPS queries to verify active MX mail exchanges and resolve RFC 7505 Null-MX configurations.",
      sampleEmail: "support@google.com",
      details: "Queries Cloudflare DNS edge for active Mail Exchange (MX) and address records, ensuring the host is configured to accept incoming traffic.",
    },
    {
      tag: "SECURITY",
      tagColor: "#10b981",
      title: "SPF & DMARC Policy Inspection",
      description: "Inspects anti-spoofing TXT records, SPF syntax, and domain alignment policies to assess domain authority.",
      sampleEmail: "billing@stripe.com",
      details: "Fetches and analyzes Sender Policy Framework (SPF) and Domain-based Message Authentication, Reporting, and Conformance (DMARC) records.",
    },
    {
      tag: "DISPOSABLE",
      tagColor: "#e11d48",
      title: "Temporary & Disposable Detection",
      description: "Instantly flags throwaway, 10-minute, and burner inbox providers using a curated and KV-cached dataset.",
      sampleEmail: "user@mailinator.com",
      details: "Detects spam traps and throwaway mailboxes from known temporary providers (Mailinator, Temp-Mail, GuerrillaMail, etc.).",
    },
    {
      tag: "CLASSIFICATION",
      tagColor: "#8b5cf6",
      title: "Role-Account Identification",
      description: "Identifies generic departmental inboxes (admin@, sales@, billing@) versus personal recipient mailboxes.",
      sampleEmail: "sales@enterprise.org",
      details: "Classifies email addresses into personal direct recipients or generic organizational distribution aliases.",
    },
    {
      tag: "PRIVACY",
      tagColor: "#06b6d4",
      title: "5-Day Retention & Privacy Purge",
      description: "Automated daily Cloudflare Cron sweeps ensure verification logs older than 5 days are permanently destroyed.",
      sampleEmail: "privacy@mailverify.internal",
      details: "Zero long-term data hoarding. Parameterized SQL queries permanently delete verification rows on a rolling 5-day cycle.",
    },
  ];

  return (
    <div className="feature-section">
      <div className="section-header">
        <span className="section-eyebrow">VERIFICATION PIPELINE</span>
        <h2 className="section-title">How MailVerify Protects Your Deliverability</h2>
        <p className="section-subtitle">
          Explore the modular validation stages executed across Cloudflare edge workers on every request.
        </p>
      </div>

      <div className="feature-grid">
        {features.map((feat, idx) => (
          <div key={idx} className="feature-card">
            <div className="card-top">
              <span className="feature-tag" style={{ color: feat.tagColor, borderColor: `${feat.tagColor}40`, backgroundColor: `${feat.tagColor}15` }}>
                {feat.tag}
              </span>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-desc">{feat.description}</p>
            </div>
            <div className="card-actions">
              <button className="btn-card-action" onClick={() => setSelectedFeature(feat)}>
                View Code
              </button>
              <button
                className="btn-card-action btn-card-action-primary"
                onClick={() => onTryEmail(feat.sampleEmail)}
              >
                Run Test <ExternalLink size={13} style={{ marginLeft: "0.2rem", display: "inline" }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Code Modal Dialog */}
      {selectedFeature && (
        <div className="modal-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="feature-tag" style={{ color: selectedFeature.tagColor, borderColor: `${selectedFeature.tagColor}40`, backgroundColor: `${selectedFeature.tagColor}15` }}>
                  {selectedFeature.tag}
                </span>
                <h3 style={{ fontSize: "1.25rem", marginTop: "0.5rem", fontWeight: 700 }}>
                  {selectedFeature.title}
                </h3>
              </div>
              <button className="btn-modal-close" onClick={() => setSelectedFeature(null)}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "1rem 0" }}>
              {selectedFeature.details}
            </p>
            <CodeSnippet emailSample={selectedFeature.sampleEmail} />
            <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button className="btn btn-secondary" onClick={() => setSelectedFeature(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onTryEmail(selectedFeature.sampleEmail);
                  setSelectedFeature(null);
                }}
              >
                Try this email now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
