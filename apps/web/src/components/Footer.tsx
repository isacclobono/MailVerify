import { AppView } from "./Header";
import { api } from "../api/client";

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
              <li><button onClick={() => handleNav("dns-mx")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>DNS & MX Checker</button></li>
              <li><button onClick={() => handleNav("spf-dmarc")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>SPF & DMARC Audit</button></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">INFRASTRUCTURE</div>
            <ul className="footer-col-list">
              <li><button onClick={() => handleNav("infra")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Cloudflare Workers</button></li>
              <li><button onClick={() => handleNav("infra")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Cloudflare D1 SQL</button></li>
              <li><button onClick={() => handleNav("infra")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Cloudflare KV</button></li>
              <li><button onClick={() => handleNav("infra")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>DNS over HTTPS</button></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">DOCUMENTATION</div>
            <ul className="footer-col-list">
              <li><button onClick={() => handleNav("docs")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>cURL Guide</button></li>
              <li><button onClick={() => handleNav("docs")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>JavaScript Client</button></li>
              <li><button onClick={() => handleNav("docs")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Python SDK</button></li>
              <li><button onClick={() => handleNav("docs")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Error Codes</button></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">ACCOUNT</div>
            <ul className="footer-col-list">
              <li><a href={api.getGoogleLoginUrl()} className="footer-link">Google Login</a></li>
              <li><button onClick={() => handleNav("account-quotas")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>5-Check Guest Quota</button></li>
              <li><button onClick={() => handleNav("account-quotas")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Bulk CSV / JSON</button></li>
              <li><button onClick={() => handleNav("account-quotas")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>5-Day Rolling History</button></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">PRIVACY & TERMS</div>
            <ul className="footer-col-list">
              <li><button onClick={() => handleNav("privacy")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>5-Day Auto Retention Purge</button></li>
              <li><button onClick={() => handleNav("privacy")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Zero Data Hoarding</button></li>
              <li><button onClick={() => handleNav("privacy")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>GDPR Conforming</button></li>
              <li><button onClick={() => handleNav("pricing")} className="footer-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>100% Free SLA</button></li>
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
