# 🔌 REST API Reference

All requests and responses use JSON. Authenticated endpoints use HttpOnly session cookies. Edge responses utilize Cloudflare CDN caching where applicable.

---

## 1. System Health & CDN Status
### `GET /api/health`
Checks Worker health, runtime, and edge CDN status.

#### Response Headers:
- `Cache-Control: public, max-age=30, s-maxage=60`
- `CF-Cache-Status: DYNAMIC`

#### Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "edge_runtime": "Cloudflare Workers",
    "cdn_cache": "enabled",
    "timestamp": "2026-08-21T12:00:00.000Z"
  }
}
```

---

## 2. Authentication
### `GET /api/auth/google`
Redirects browser to Google OAuth consent screen.

### `GET /api/auth/google/callback`
Validates OAuth state, exchanges code for Google tokens, creates user session in D1, and sets `mv_session` HttpOnly cookie.

### `GET /api/auth/me`
Fetches current authenticated user profile including admin status.

#### Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_12345",
      "email": "admin@example.com",
      "name": "Jane Doe",
      "avatar_url": "https://lh3.googleusercontent.com/...",
      "is_admin": true
    }
  }
}
```

### `POST /api/auth/logout`
Destroys session in D1 and clears the session cookie.

---

## 3. Email Verification
### `POST /api/verify`
Performs multi-step email verification (Anonymous: 5 req/min, Authenticated: 30 req/min).

#### Request Body:
```json
{
  "email": "test@example.com"
}
```

#### Response:
```json
{
  "success": true,
  "data": {
    "id": "ver_98765",
    "email": "test@example.com",
    "normalized_email": "test@example.com",
    "verdict": "LIKELY_DELIVERABLE",
    "score": 10,
    "checks": {
      "syntax": "PASS",
      "domain": "DOMAIN_EXISTS",
      "mx": "MX_FOUND",
      "spf": "SPF_PRESENT",
      "dmarc": "DMARC_PRESENT",
      "disposable": "NOT_DISPOSABLE",
      "role": "PERSONAL_ACCOUNT_LIKELY",
      "catch_all": "NOT_CATCH_ALL",
      "smtp": "SMTP_EXISTS"
    },
    "created_at": "2026-08-21T12:00:00.000Z"
  }
}
```

---

## 4. History (Authenticated)
### `GET /api/history`
Returns user's verification records from the last 5 days.

---

## 5. Bulk Verification (Authenticated)
### `POST /api/bulk`
Upload a CSV, TXT, or JSON list of emails (max 500 emails per batch in free tier).

### `GET /api/bulk/:id`
Check status and real-time progress of a bulk verification job.

### `GET /api/bulk/:id/results`
Download or view results of the bulk verification job.

---

## 6. Admin Endpoints (Admin Authenticated)
*Requires user email to be included in `ADMIN_EMAILS`.*

### `GET /api/admin/stats`
Returns system overview metrics, total users, verification volume, and verdict distribution.

#### Response:
```json
{
  "success": true,
  "data": {
    "total_users": 150,
    "total_verifications": 14230,
    "total_bulk_jobs": 48,
    "verdict_breakdown": {
      "LIKELY_DELIVERABLE": 11200,
      "RISKY": 1500,
      "LIKELY_INVALID": 1200,
      "DISPOSABLE": 330
    },
    "edge_runtime": "Cloudflare Workers",
    "cdn_cache_status": "Active (Edge-Cached)",
    "timestamp": "2026-08-21T12:00:00.000Z"
  }
}
```

### `GET /api/admin/users?limit=50&offset=0`
Returns paginated list of registered users.

### `GET /api/admin/verifications?limit=50&offset=0`
Returns recent verifications across the entire system.

### `DELETE /api/admin/users/:id`
Deletes a user account and cascades deletion to their sessions, verification history, and bulk jobs.

---

## 7. Account Management (Authenticated)
### `DELETE /api/account`
Deletes the logged-in user account and associated data immediately.
