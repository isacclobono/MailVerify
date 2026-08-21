# 🛡️ Admin Account & CDN Integration Guide

MailVerify includes built-in role-based administrator controls and Cloudflare Edge CDN caching capabilities.

---

## 1. How the Admin System Works

1. **Role Verification**: Admin access is governed by the `ADMIN_EMAILS` configuration.
2. **Zero-Database Password Leaks**: When an administrator signs in via Google OAuth, the server checks their authenticated email against `ADMIN_EMAILS`.
3. **Admin Flag in Session**: If the email matches, the session payload marks `isAdmin: true` and `/api/auth/me` includes `is_admin: true`.
4. **Middleware Protection**: All `/api/admin/*` endpoints require the `requireAdminMiddleware`, which returns `403 FORBIDDEN` for non-admin users.

---

## 2. Configuring Admin Accounts

### In Local Development (`.env` and `apps/worker/.dev.vars`):
Add comma-separated emails to `ADMIN_EMAILS`:
```ini
ADMIN_EMAILS=your.email@gmail.com,admin@yourdomain.com
```

### In Production (Cloudflare Worker Secrets):
Set the secret using Wrangler:
```bash
cd apps/worker
npx wrangler secret put ADMIN_EMAILS
# Enter your comma-separated admin emails when prompted:
# e.g., your.email@gmail.com,colleague@yourdomain.com
```

---

## 3. Administrator Capabilities

| Action | Endpoint | Description |
|---|---|---|
| **System Stats** | `GET /api/admin/stats` | View total users, total verifications, bulk jobs, and verdict breakdown. |
| **User Directory** | `GET /api/admin/users` | List registered users with registration timestamps and avatars. |
| **Global Audit Log** | `GET /api/admin/verifications` | Monitor real-time email verification queries across the platform. |
| **User Deletion** | `DELETE /api/admin/users/:id` | Remove any user and cascade delete all their stored sessions and data. |

---

## 4. Cloudflare CDN Edge Optimization

MailVerify leverages Cloudflare's global edge network (280+ cities) for CDN delivery and low-latency responses:

1. **Static Assets**:
   - The React frontend (`apps/web`) is deployed to Cloudflare Pages and served from Cloudflare's CDN edge.
   - Immutable assets (JS chunks, CSS, SVG icons) are automatically cached with long TTLs.

2. **API Edge Caching**:
   - Public non-sensitive routes (e.g. `/api/health`, domain lookup lists) serve `Cache-Control` headers (`public, s-maxage=...`) to cache responses at Cloudflare CDN edge nodes.
   - Repeated MX and DNS lookups are cached in Cloudflare KV with TTL to avoid redundant network queries.

3. **Global Sub-50ms Latency**:
   - Cloudflare Workers run across global points of presence (PoP), executing DNS/DoH verification close to the user.
