export const FaqSection = () => {
  const faqs = [
    {
      q: "How many emails can I check without signing in?",
      a: "Anonymous visitors can check up to 5 emails completely free without an account. Once you reach 5 checks, simply sign in with your Google account to unlock unlimited single checks, batch CSV/JSON uploads, and your 5-day verification history.",
    },
    {
      q: "What is the 5-day automatic retention policy?",
      a: "To prioritize privacy and ensure a 100% zero-cost architecture, MailVerify runs an automated Cloudflare Cron trigger daily at midnight to permanently purge verification records older than 5 days from the D1 database.",
    },
    {
      q: "How is MailVerify completely free with zero bills?",
      a: "MailVerify is architected entirely on Cloudflare's serverless free tiers (Workers, D1 SQLite, KV cache, and Pages) and Google OAuth 2.0. We use public DNS-over-HTTPS for DNS queries instead of expensive third-party paid APIs.",
    },
    {
      q: "What file formats are supported for bulk verification?",
      a: "Logged-in users can verify batches of up to 500 emails at a time by uploading CSV files (.csv), JSON lists/objects (.json), tab-separated files (.tsv), or by pasting plain newline/comma-separated text lists.",
    },
    {
      q: "Do you send probe emails or connect directly to SMTP servers?",
      a: "No. Sending unauthorized SMTP socket probes from cloud infrastructure is widely blocked and damages deliverability reputation. Instead, we inspect live MX mail exchangers, DNS routing, SPF, DMARC, and disposable databases to determine deliverability accurately and safely.",
    },
  ];

  return (
    <div className="faq-section">
      <div className="section-header">
        <span className="section-eyebrow">COMMON QUESTIONS</span>
        <h2 className="section-title">Frequently Asked Questions</h2>
      </div>

      <div className="faq-list">
        {faqs.map((faq, idx) => (
          <div key={idx} className="faq-card">
            <h3 className="faq-question">{faq.q}</h3>
            <p className="faq-answer">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
