import { AppView } from "./Header";

interface FooterProps {
  onNavigate?: (view: AppView) => void;
}

export const Footer = ({ onNavigate }: FooterProps) => {
  const handleNav = (view: AppView) => {
    if (onNavigate) {
      onNavigate(view);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-cols">
          <div>
            <div className="footer-col-title">PRODUCT</div>
            <ul className="footer-col-list">
              <li><button onClick={() => handleNav("home")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Single Verifier</button></li>
              <li><button onClick={() => handleNav("dashboard")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Bulk Batch Engine</button></li>
              <li><button onClick={() => handleNav("docs")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>DNS & MX Checker</button></li>
              <li><button onClick={() => handleNav("pricing")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Free Tier Quotas</button></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">INFRASTRUCTURE</div>
            <ul className="footer-col-list">
              <li><a href="https://workers.cloudflare.com" target="_blank" rel="noreferrer" className="footer-link">Cloudflare Workers</a></li>
              <li><a href="https://developers.cloudflare.com/d1/" target="_blank" rel="noreferrer" className="footer-link">Cloudflare D1 SQL</a></li>
              <li><a href="https://developers.cloudflare.com/kv/" target="_blank" rel="noreferrer" className="footer-link">Cloudflare KV Cache</a></li>
              <li><a href="https://cloudflare-dns.com" target="_blank" rel="noreferrer" className="footer-link">DNS over HTTPS</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">DOCUMENTATION</div>
            <ul className="footer-col-list">
              <li><button onClick={() => handleNav("docs")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>REST API Guide</button></li>
              <li><button onClick={() => handleNav("docs")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>cURL & Fetch Examples</button></li>
              <li><button onClick={() => handleNav("docs")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Deliverability Verdicts</button></li>
              <li><button onClick={() => handleNav("docs")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Error Codes</button></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">ADMIN & ACCESS</div>
            <ul className="footer-col-list">
              <li><button onClick={() => handleNav("admin")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Admin Portal</button></li>
              <li><button onClick={() => handleNav("dashboard")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>User Dashboard</button></li>
              <li><a href="https://github.com/isacclobono/MailVerify" target="_blank" rel="noreferrer" className="footer-link">GitHub Repository</a></li>
              <li><button onClick={() => handleNav("pricing")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Pricing & SLA</button></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">PRIVACY & TERMS</div>
            <ul className="footer-col-list">
              <li><button onClick={() => handleNav("privacy")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>5-Day Auto Purge Policy</button></li>
              <li><button onClick={() => handleNav("privacy")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Zero Data Hoarding</button></li>
              <li><button onClick={() => handleNav("privacy")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>GDPR & CCPA Conformance</button></li>
              <li><button onClick={() => handleNav("privacy")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Terms of Service</button></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="compliance-badges">
            <span className="badge-tag">GDPR COMPLIANT</span>
            <span className="badge-tag">5-DAY PURGE</span>
            <span className="badge-tag">ZERO-COST SLA</span>
            <span className="badge-tag">CLOUDFLARE EDGE</span>
          </div>
          <div>
            MailVerify © {new Date().getFullYear()} · Zero-Cost Serverless Email Deliverability Platform
          </div>
        </div>
      </div>
    </footer>
  );
};
