import { Check, X, ShieldAlert, Zap } from "lucide-react";

export const ComparisonSection = () => {
  const comparisonRows = [
    {
      feature: "DNS & MX Resolution Engine",
      mailverify: "High-speed Cloudflare DNS-over-HTTPS multi-resolver",
      traditional: "Local UDP socket queries (frequently throttled)",
      advantage: true,
    },
    {
      feature: "SPF & DMARC Anti-Spoofing Alignment",
      mailverify: "Real-time policy parsing (p=reject / quarantine)",
      traditional: "Often ignored or requires secondary paid lookup",
      advantage: true,
    },
    {
      feature: "Disposable & Burner Domain Database",
      mailverify: "Continuous curated lists + MX heuristic detection",
      traditional: "Stale static lists or no disposable detection",
      advantage: true,
    },
    {
      feature: "Typo Correction & Suggestions",
      mailverify: "Automatic Levenshtein distance dictionary check",
      traditional: "No typo suggestions provided",
      advantage: true,
    },
    {
      feature: "Dedicated Sub-Pipeline Endpoints",
      mailverify: "Direct /api/check/* modular micro-endpoints",
      traditional: "Monolithic single check only",
      advantage: true,
    },
    {
      feature: "Data Privacy & Log Retention",
      mailverify: "5-Day automated D1 SQLite cron purge · No data selling",
      traditional: "Indefinite log storage and email data harvesting",
      advantage: true,
    },
    {
      feature: "Developer Free Tier Quotas",
      mailverify: "200 calls/month forever free with private API keys",
      traditional: "Strict credit card paywalls from day 1",
      advantage: true,
    },
  ];

  return (
    <section className="feature-section" style={{ margin: "3.5rem 0" }}>
      <div className="section-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
        <span className="section-eyebrow">TECHNOLOGY COMPARISON</span>
        <h2 className="section-title" style={{ fontSize: "1.55rem" }}>
          Why Developers Choose MailVerify
        </h2>
        <p className="section-subtitle" style={{ maxWidth: "620px", margin: "0.25rem auto 0" }}>
          Serverless edge intelligence eliminates the risks of IP blacklisting and slow response times associated with legacy SMTP socket tools.
        </p>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Feature / Capability</th>
                <th style={{ color: "var(--accent-blue)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <Zap size={13} /> MailVerify Edge Platform
                  </span>
                </th>
                <th>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <ShieldAlert size={13} /> Traditional Legacy Tools
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: "var(--text-main)" }}>
                    {row.feature}
                  </td>
                  <td style={{ color: "#0f172a" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Check size={14} color="var(--success)" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>{row.mailverify}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <X size={14} color="var(--danger)" style={{ flexShrink: 0 }} />
                      <span>{row.traditional}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
