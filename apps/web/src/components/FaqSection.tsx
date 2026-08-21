import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string | React.ReactNode;
  category?: string;
}

export type FaqPageCategory =
  | "home"
  | "pricing"
  | "docs"
  | "dns-mx"
  | "spf-dmarc"
  | "privacy"
  | "quotas";

interface FaqSectionProps {
  items?: FaqItem[];
  title?: string;
  eyebrow?: string;
  description?: string;
  pageCategory?: FaqPageCategory;
  defaultOpenIndex?: number;
}

const PAGE_FAQS: Record<FaqPageCategory, FaqItem[]> = {
  home: [
    {
      q: "How many emails can I check without signing in?",
      a: "Anonymous guests can check up to 5 emails completely free without signing in. Once you reach 5 checks, simply sign in with your Google account to receive 200 free API calls every month, batch upload tools, and API key generation.",
    },
    {
      q: "Do you send probe emails or connect directly to remote SMTP servers?",
      a: "No. Connecting directly to port 25 SMTP sockets from cloud serverless nodes often triggers firewall blocks and damages domain reputation. Instead, MailVerify conducts non-invasive DNS-over-HTTPS inspection of live MX records, A/AAAA resolution, SPF records, DMARC anti-spoofing policies, and disposable domain databases.",
    },
    {
      q: "What is the 5-day automatic retention policy?",
      a: "To guarantee data privacy and keep database storage clean, an automated Cloudflare Cron trigger executes daily at midnight to permanently purge verification records older than 5 days from the database.",
    },
    {
      q: "What file formats are supported for bulk verification?",
      a: "Authenticated users can verify batches of emails by uploading CSV files (.csv), JSON lists (.json), tab-separated files (.tsv), or by pasting newline/comma-separated text lists.",
    },
    {
      q: "How accurate is the Deliverability Score?",
      a: "Our composite algorithm weights RFC 5322 syntax compliance, domain existence, MX server availability, SPF/DMARC configuration, role-account markers, and burner domain blocklists to assign a risk score from 0 (Safe) to 100 (Invalid).",
    },
  ],

  pricing: [
    {
      q: "How does the Free Plan with 200 API calls/month work?",
      a: "Every authenticated user automatically receives 200 free API verification calls each calendar month. Your quota resets on the 1st day of each month at 00:00 UTC with zero credit card required.",
    },
    {
      q: "Where do I generate my API Key?",
      a: "After signing in with Google, open your Dashboard and click on the 'API Keys' tab. You can generate up to 5 active production API keys (e.g. mv_live_...) for backend integration.",
    },
    {
      q: "What happens when I reach 200 API calls in a month?",
      a: "When your 200-call monthly quota is exhausted, the API returns an HTTP 429 Monthly Quota Exceeded error. You can still test single addresses in the web dashboard until your quota resets on the 1st of next month.",
    },
    {
      q: "Are there any hidden costs or surprise renewal fees?",
      a: "None. MailVerify runs on an efficient serverless architecture with no credit cards attached to free accounts.",
    },
  ],

  docs: [
    {
      q: "How do I authenticate API requests with my key?",
      a: "Pass your API key using either the X-API-Key header or the Authorization header: `X-API-Key: mv_live_...` or `Authorization: Bearer mv_live_...`.",
    },
    {
      q: "What are the rate limit headers returned by the API?",
      a: "Every API response includes `X-RateLimit-Monthly-Limit: 200` and `X-RateLimit-Monthly-Remaining: <count>` so your application can monitor remaining monthly capacity programmatically.",
    },
    {
      q: "What is the timeout for DNS-over-HTTPS lookups?",
      a: "DoH queries resolve via Cloudflare's global 1.1.1.1 network with typical roundtrip latencies under 50ms. Repeated domain lookups are served in under 5ms from Cloudflare KV edge cache.",
    },
    {
      q: "Which HTTP status codes should my client handle?",
      a: "200 (Success), 400 (Bad request / invalid email syntax), 401 (Missing/invalid API key), 403 (Guest limit reached), and 429 (Monthly quota of 200 calls exceeded).",
    },
  ],

  "dns-mx": [
    {
      q: "What does the DNS & MX Record Checker test?",
      a: "It performs live recursive DNS queries to detect whether the domain has valid Mail Exchanger (MX) records, active A/AAAA host records, and legitimate mail servers configured to accept incoming traffic.",
    },
    {
      q: "Why do some domains have multiple MX records with different numbers?",
      a: "The numbers represent MX priorities (e.g., Priority 10 vs Priority 20). Sending servers attempt delivery to the lowest priority number first, falling back to higher numbers if the primary server is unreachable.",
    },
    {
      q: "What does 'NO_MX' mean for an email address?",
      a: "If a domain has no MX records and no fallback A records configured for mail routing, emails sent to that domain will bounce immediately with a hard delivery failure.",
    },
  ],

  "spf-dmarc": [
    {
      q: "Why are SPF and DMARC essential in 2026?",
      a: "Major email providers (Google, Yahoo, Microsoft) enforce strict sender authentication policies. Unauthenticated emails from domains without SPF and DMARC records are routinely sent to spam or rejected.",
    },
    {
      q: "What is the difference between DMARC p=none, p=quarantine, and p=reject?",
      a: "`p=none` only monitors traffic without blocking. `p=quarantine` instructs receiving servers to route failing emails to Spam. `p=reject` instructs receivers to block fraudulent emails outright.",
    },
    {
      q: "How does missing SPF/DMARC impact the Deliverability Score?",
      a: "Domains lacking SPF or DMARC records receive a penalty score and are categorized as 'RISKY', warning you that recipient servers may filter messages sent from that domain.",
    },
  ],

  privacy: [
    {
      q: "How does the automated 5-day retention purge work?",
      a: "A Cloudflare Cron Trigger executes automatically every 24 hours at midnight UTC to delete verification records, timestamps, and bulk job artifacts older than 5 days from the database.",
    },
    {
      q: "Do you sell or share verified email addresses?",
      a: "Never. We do not monetize, resell, or share target email addresses with data brokers or advertisers. Data is processed exclusively in-memory and in encrypted storage.",
    },
    {
      q: "How do I exercise my GDPR right to erasure?",
      a: "You can permanently delete your entire user profile, API keys, sessions, and verification logs at any time from your Dashboard &rarr; Account &rarr; Danger Zone, or via `DELETE /api/account`.",
    },
  ],

  quotas: [
    {
      q: "What are the quota limits for Guest vs Authenticated accounts?",
      a: "Guest visitors receive 5 instant verifications per IP address. Authenticated users receive 200 API calls per month, API key access, bulk CSV uploads, and 5-day audit history.",
    },
    {
      q: "Can I generate multiple API keys for different environments?",
      a: "Yes. You can create up to 5 distinct API keys with custom labels (e.g., Staging, Production, Zapier) and revoke them individually at any time.",
    },
    {
      q: "Do bulk CSV batches count toward my 200 monthly quota?",
      a: "Yes. Each email verified within a bulk batch deducts 1 call from your 200-call monthly quota.",
    },
  ],
};

export const FaqSection = ({
  items,
  title = "Frequently Asked Questions",
  eyebrow = "KNOWLEDGE BASE & FAQ",
  description,
  pageCategory = "home",
  defaultOpenIndex = 0,
}: FaqSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  const faqList = items || PAGE_FAQS[pageCategory] || PAGE_FAQS.home;

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="faq-section" style={{ maxWidth: "860px", margin: "3.5rem auto 2rem", width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-blue)", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.6rem" }}>
          <HelpCircle size={13} /> {eyebrow}
        </div>
        <h2 style={{ fontSize: "1.85rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          {title}
        </h2>
        {description && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto" }}>
            {description}
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {faqList.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="card"
              style={{
                padding: "0",
                overflow: "hidden",
                border: isOpen ? "1px solid var(--accent-blue)" : "1px solid var(--border-subtle)",
                transition: "all 0.2s ease",
                boxShadow: isOpen ? "0 4px 12px rgba(37, 99, 235, 0.08)" : "var(--shadow-sm)",
              }}
            >
              <button
                onClick={() => toggleItem(idx)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "1.25rem 1.5rem",
                  background: isOpen ? "var(--bg-subtle)" : "#ffffff",
                  border: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  cursor: "pointer",
                  color: "var(--text-main)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  transition: "background 0.2s ease",
                }}
                aria-expanded={isOpen}
              >
                <span style={{ lineHeight: 1.4 }}>{item.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    flexShrink: 0,
                    color: isOpen ? "var(--accent-blue)" : "var(--text-muted)",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.25s ease, color 0.2s ease",
                  }}
                />
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: "1.25rem 1.5rem 1.5rem",
                    color: "var(--text-muted)",
                    fontSize: "0.92rem",
                    lineHeight: 1.65,
                    borderTop: "1px solid var(--border-subtle)",
                    background: "#ffffff",
                  }}
                >
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
