# 🛡️ Admin Portal & Security Guide

MailVerify provides a dedicated, credential-protected Administrator Portal with role-based security, live telemetry, multi-source disposable domain sync controls, and user directory management.

---

## 1. Admin Portal URL & Access

- **Web Portal Route**: [`/admin`](https://mailverify-8j0.pages.dev/admin) (or `http://localhost:5173/admin` locally)
- **Direct Tabs**:
  - `/admin?tab=overview` — Real-time telemetry, total users, verifications, and verdict breakdown.
  - `/admin?tab=users` — Searchable and paginated registered users directory.
  - `/admin?tab=verifications` — Live global verification stream.
  - `/admin?tab=infra` — Cloudflare Edge runtime diagnostics, D1 database status, and Disposable Domain Intelligence Hub.

---

## 2. How Admin Authentication Works

MailVerify supports dedicated **Email & Password Authentication** for administrators without requiring third-party Google OAuth:

1. **Authentication Endpoint**: `POST /api/auth/admin/login`
2. **Credentials Verification**:
   - The provided email is checked against `ADMIN_EMAILS` (or default `admin@mailverify.com`).
   - The provided password is validated against `ADMIN_PASSWORD` (or default `AdminMailVerify2026!`).
3. **Local D1 Admin Session**:
   - On successful validation, a session token is issued in D1 `sessions` table.
   - Secure HttpOnly session cookie (`mv_session`) is set.
4. **Middleware Protection**: All `/api/admin/*` endpoints enforce `requireAdminMiddleware`, returning `403 FORBIDDEN` for unauthorized accounts.

---

## 3. Configuring Admin Credentials

### In Local Development (`.env` and `apps/worker/.dev.vars`):
```ini
ADMIN_EMAILS=admin@mailverify.com,your-email@gmail.com
ADMIN_PASSWORD=YourCustomSecretPassword123!
```

### In Production (Cloudflare Worker Secrets):
```bash
cd apps/worker

# Set authorized admin emails (comma-separated):
npx wrangler secret put ADMIN_EMAILS

# Set secure admin password:
npx wrangler secret put ADMIN_PASSWORD
```

---

## 4. Administrator Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/admin/login` | Authenticate with administrator email & password. |
| `GET` | `/api/admin/stats` | Global analytics (total users, total checks, verdict breakdown, bulk jobs). |
| `GET` | `/api/admin/users?limit=50&offset=0` | Paginated registered users directory. |
| `GET` | `/api/admin/verifications?limit=50&offset=0` | Paginated live telemetry verification stream. |
| `DELETE` | `/api/admin/users/:id` | Permanently delete a user and cascade purge all their logs/sessions. |
| `POST` | `/api/admin/disposable/sync` | Trigger live multi-source synchronization of 10+ disposable domain lists. |
| `GET` | `/api/admin/disposable/stats` | View active metadata of the synchronized disposable domain dataset. |

---

## 5. Multi-Source Disposable Domain Intelligence Hub

Administrators can inspect and trigger real-time updates for the disposable domain database from the Admin Dashboard:

1. **10+ Curated Open-Source Feeds**:
   - `disposable/domains_strict.txt`
   - `disposable/domains.txt`
   - `disposable-email-domains/blocklist.conf`
   - `StefanPejcic/domains.txt`
   - `7c/fakefilter/data.txt`
   - `wesbos/burner-email-providers/emails.txt`
   - `Laravel-Disposable-Email/domains.json`
2. **Deduplication & Normalization**: Strips comments, subdomains, leading `@`, and validates RFC hostname structure.
3. **Allowlist Safeguard**: Never flags major providers (Gmail, Outlook, Yahoo, Apple, Proton, Fastmail, etc.).
4. **Automated Background Sync**: Runs daily at midnight UTC via Cloudflare Cron Triggers (`0 0 * * *`).
