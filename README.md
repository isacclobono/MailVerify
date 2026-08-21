# 📧 MailVerify (Cloudflare-Native, 100% Zero-Cost Architecture)

A production-ready email verification platform built entirely on Cloudflare's serverless infrastructure (Workers, D1 SQLite, KV, Pages, and Cron Triggers).

---

## 🌟 Key Features

- **Multi-layer Email Verification Pipeline**:
  - **Syntax & Format Validation**: Standards-compliant RFC 5322 regex validation.
  - **DNS Resolution**: Live domain existence checks via DNS-over-HTTPS (DoH).
  - **MX Record Verification**: Validates mail-exchange server availability and RFC 7505 Null MX detection.
  - **SPF & DMARC Security Inspection**: Reads and assesses domain reputation and anti-spoofing policies.
  - **Multi-Source Disposable Email Intelligence**: Aggregates 10+ open-source burner feeds with deduplication and strict corporate allowlist protection.
  - **Role-Account Classification**: Detects shared mailbox prefixes (e.g. `admin@`, `support@`, `billing@`).
  - **Typo Suggestions**: Levenshtein distance detection for misspelled popular email domains (e.g. `gmial.com` &rarr; `gmail.com`).
  - **Weighted Scoring Engine**: Calculates risk score (0–100) and assigns actionable verdicts (`LIKELY_DELIVERABLE`, `RISKY`, `LIKELY_INVALID`, `DISPOSABLE`, `ROLE_ACCOUNT`, `NO_MX`, `INVALID_SYNTAX`).
- **Dedicated Admin Portal**:
  - Direct **Email & Password Authentication** at `/admin` (no Google OAuth required for admins).
  - Live infrastructure telemetry, D1 database inspection, user directory, and verification stream.
  - 1-Click Multi-Source Disposable Domain Sync.
- **Developer REST API**:
  - Full pipeline verification (`/api/verify`).
  - 7 Granular sub-pipeline micro-check endpoints (`/api/check/*`).
  - API Key management with 200 free monthly checks per account (`X-API-Key: mv_live_...`).
- **Zero-Cost & Free-Tier Guaranteed**: Operates completely within Cloudflare and Google free limits.
- **Privacy & 5-Day Data Retention**: Automatic daily background Cron cleanup purging verification records older than 5 days.

---

## 🔐 Administrator Portal Access

- **Admin Login Route**: [`/admin`](https://mailverify-8j0.pages.dev/admin) (or `http://localhost:5173/admin` locally)
- **Default Admin Email**: `admin@mailverify.com`
- **Default Admin Password**: `AdminMailVerify2026!`

To customize admin credentials in production:
```powershell
cd apps/worker
npx wrangler secret put ADMIN_EMAILS
npx wrangler secret put ADMIN_PASSWORD
```

---

## 🚀 1-Click Automated Local Setup

You can set up the entire monorepo, environment files, and local D1 SQLite database with a single command:

### On Windows PowerShell:
```powershell
.\setup.ps1
```

### On Linux / macOS / WSL / Git Bash:
```bash
chmod +x ./setup.sh
./setup.sh
```

### Start Development Servers:
```bash
# Terminal 1: Backend API (Worker on http://localhost:8787)
npm run dev:worker

# Terminal 2: Frontend (React Vite on http://localhost:5173)
npm run dev:web
```

---

## 🔄 Multi-Source Disposable Domain Aggregator

To aggregate, deduplicate, and compile all 10+ open-source disposable domain lists:
```powershell
npm run sync:disposable
```

---

## 📁 Repository Structure

```
.
├── apps/
│   ├── web/                    # React + Vite + TypeScript Frontend (Cloudflare Pages)
│   └── worker/                 # Cloudflare Workers API Backend (TypeScript + Hono)
├── migrations/                 # Cloudflare D1 SQL Schema & Indexes
├── scripts/                    # Multi-source disposable domain aggregator scripts
├── docs/                       # Comprehensive Architecture Documentation
│   ├── setup-guide.md          # Local dev & Cloudflare deploy guide
│   ├── admin-guide.md          # Admin system & Security documentation
│   ├── cloudflare-free-tier.md # Cloudflare Zero-Cost setup & limits
│   ├── google-oauth-setup.md   # Google Cloud OAuth configuration
│   └── api-reference.md        # Complete REST API documentation
├── setup.sh                    # Automated setup script for Bash / Linux / macOS
├── setup.ps1                   # Automated setup script for Windows PowerShell
├── .env.example                # Root environment template
└── package.json                # Monorepo workspaces configuration
```

---

## 📚 Documentation Index

- [🛡️ Admin Portal & Security Guide](docs/admin-guide.md)
- [🔌 REST API Reference](docs/api-reference.md)
- [📘 Setup & Deployment Guide](docs/setup-guide.md)
- [☁️ Cloudflare Free Tier Architecture](docs/cloudflare-free-tier.md)
- [🔑 Google OAuth Setup](docs/google-oauth-setup.md)
