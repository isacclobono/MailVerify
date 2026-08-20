import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-cols">
          <div>
            <div className="footer-col-title">PRODUCT</div>
            <ul className="footer-col-list">
              <li><a href="#tester" className="footer-link">Single Verifier</a></li>
              <li><a href="#tester" className="footer-link">Bulk Batch Engine</a></li>
              <li><a href="#pipeline" className="footer-link">DNS & MX Checker</a></li>
              <li><a href="#pipeline" className="footer-link">SPF & DMARC Audit</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">INFRASTRUCTURE</div>
            <ul className="footer-col-list">
              <li><a href="https://workers.cloudflare.com" target="_blank" rel="noreferrer" className="footer-link">Cloudflare Workers</a></li>
              <li><a href="https://developers.cloudflare.com/d1/" target="_blank" rel="noreferrer" className="footer-link">Cloudflare D1 SQL</a></li>
              <li><a href="https://developers.cloudflare.com/kv/" target="_blank" rel="noreferrer" className="footer-link">Cloudflare KV</a></li>
              <li><a href="https://cloudflare-dns.com" target="_blank" rel="noreferrer" className="footer-link">DNS over HTTPS</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">DOCUMENTATION</div>
            <ul className="footer-col-list">
              <li><a href="#tester" className="footer-link">cURL Guide</a></li>
              <li><a href="#tester" className="footer-link">JavaScript Client</a></li>
              <li><a href="#tester" className="footer-link">Python SDK</a></li>
              <li><a href="#faq" className="footer-link">Error Codes</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">ACCOUNT</div>
            <ul className="footer-col-list">
              <li><a href="/api/auth/google" className="footer-link">Google Login</a></li>
              <li><span className="footer-link">5-Check Guest Quota</span></li>
              <li><span className="footer-link">Bulk CSV / JSON</span></li>
              <li><span className="footer-link">5-Day Rolling History</span></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">PRIVACY & TERMS</div>
            <ul className="footer-col-list">
              <li><span className="footer-link">5-Day Auto Retention Purge</span></li>
              <li><span className="footer-link">Zero Data Hoarding</span></li>
              <li><span className="footer-link">GDPR Conforming</span></li>
              <li><span className="footer-link">100% Free SLA</span></li>
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
