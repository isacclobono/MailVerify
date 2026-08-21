# 📧 MailVerify (Cloudflare-Native, 100% Zero-Cost Architecture)

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
- **Role-Based Admin Accounts**: Environment-controlled administrative system (`ADMIN_EMAILS`) with statistics, global logs, and user management.
- **Global CDN Edge Caching**: Cloudflare edge network caching for ultra-low latency API lookups and static assets.
- **Privacy & 5-Day Data Retention**: Automatic daily background Cron cleanup purging verification records older than 5 days.
- **Google OAuth 2.0 Authentication**: OpenID Connect with HttpOnly SameSite secure cookie sessions.
- **Bulk Multi-Format Verification**: Upload CSV, TXT, or JSON files to verify email lists in batches.
- **Rate Limiting**: Defends against brute-force and scraping for both anonymous and authenticated users.

---

## 🚀 1-Click Automated Local Setup

You can set up the entire monorepo, environment files, and local D1 SQLite database with a single command:

### On Linux / macOS / WSL / Git Bash:
```bash
chmod +x ./setup.sh
./setup.sh
```

### On Windows PowerShell:
```powershell
.\setup.ps1
```

Once completed, start the development servers:
```bash
# Terminal 1: Backend API (Worker on http://localhost:8787)
npm run dev:worker

# Terminal 2: Frontend (React Vite on http://localhost:5173)
npm run dev:web
```

---

## 📁 Repository Structure

```
.
├── apps/
│   ├── web/                    # React + Vite + TypeScript Frontend (Cloudflare Pages)
│   └── worker/                 # Cloudflare Workers API Backend (TypeScript + Hono)
├── migrations/                 # Cloudflare D1 SQL Schema & Indexes
├── docs/                       # Comprehensive Setup & Architecture Documentation
│   ├── setup-guide.md          # Local dev & Cloudflare deploy guide
│   ├── admin-guide.md          # Admin system & CDN caching documentation
│   ├── cloudflare-free-tier.md # Cloudflare Zero-Cost setup & limits
│   ├── google-oauth-setup.md   # Google Cloud OAuth & Admin configuration
│   └── api-reference.md        # Complete REST API documentation
├── setup.sh                    # Automated setup script for Bash / Linux / macOS
├── setup.ps1                   # Automated setup script for Windows PowerShell
├── .env.example                # Root environment template
└── package.json                # Monorepo workspaces configuration
```

---

## 📚 Documentation Index

- [📘 Setup & Deployment Guide](file:///d:/VIRUS%20FILE/MailVerify/docs/setup-guide.md)
- [🛡️ Admin & CDN Guide](file:///d:/VIRUS%20FILE/MailVerify/docs/admin-guide.md)
- [🔌 API Reference](file:///d:/VIRUS%20FILE/MailVerify/docs/api-reference.md)
- [☁️ Cloudflare Free Tier Architecture](file:///d:/VIRUS%20FILE/MailVerify/docs/cloudflare-free-tier.md)
- [🔑 Google OAuth & Admin Setup](file:///d:/VIRUS%20FILE/MailVerify/docs/google-oauth-setup.md)
