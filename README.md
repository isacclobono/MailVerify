# 📧 Email Verifier (Cloudflare-Native, 100% Zero-Cost Architecture)

A production-ready email verification platform built entirely on Cloudflare's serverless infrastructure (Workers, D1, KV, Pages, and Cron Triggers) and Google OAuth 2.0.

---

## 🌟 Key Features

- **Multi-layer Email Verification Pipeline**:
  - **Syntax & Format Validation**: Standards-compliant RFC validation.
  - **DNS Resolution**: Live domain existence checks via DNS-over-HTTPS (DoH).
  - **MX Record Verification**: Verifies mail-exchange server availability.
  - **SPF & DMARC Security Inspection**: Reads and assesses domain reputation and anti-spoofing policies.
  - **Disposable Email Detection**: Instant lookup against curated disposable domain lists.
  - **Role-Account Classification**: Detects shared mailbox prefixes (e.g. `admin@`, `support@`, `billing@`).
  - **Weighted Scoring Engine**: Calculates risk score and assigns actionable verdicts (`LIKELY_DELIVERABLE`, `RISKY`, `LIKELY_INVALID`, `DISPOSABLE`, `ROLE_ACCOUNT`, `NO_MX`, `INVALID_SYNTAX`).
- **Zero-Cost & Free-Tier Guaranteed**: Operates completely within Cloudflare and Google free limits.
- **Privacy & 5-Day Data Retention**: Automatic daily background Cron cleanup purging verification records older than 5 days.
- **Google OAuth 2.0 Authentication**: OpenID Connect with HttpOnly SameSite secure cookie sessions.
- **Bulk CSV Verification**: Upload CSVs and verify email lists in batches.
- **Rate Limiting**: Defends against brute-force and scraping for both anonymous and authenticated users.

---

## 📁 Repository Structure

```
.
├── apps/
│   ├── web/              # React + Vite + TypeScript Frontend (Cloudflare Pages)
│   └── worker/           # Cloudflare Workers API Backend (TypeScript)
├── migrations/           # Cloudflare D1 SQL Schema & Indexes
├── docs/                 # Detailed Setup and Architecture Guides
│   ├── setup-guide.md          # Local dev & Cloudflare deploy guide
│   ├── cloudflare-free-tier.md # Cloudflare Zero-Cost setup & limits
│   ├── google-oauth-setup.md   # Google Cloud OAuth configuration
│   └── api-reference.md        # REST API documentation
└── package.json          # Workspace configuration
```

---

## 🚀 Quick Start

For detailed step-by-step guides, refer to:
- [📘 Setup Guide](file:///d:/VIRUS%20FILE/MailVerify/docs/setup-guide.md)
- [☁️ Cloudflare Free Tier Provisioning](file:///d:/VIRUS%20FILE/MailVerify/docs/cloudflare-free-tier.md)
- [🔑 Google OAuth Setup](file:///d:/VIRUS%20FILE/MailVerify/docs/google-oauth-setup.md)
- [🔌 API Reference](file:///d:/VIRUS%20FILE/MailVerify/docs/api-reference.md)
