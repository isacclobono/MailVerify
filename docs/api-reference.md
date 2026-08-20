# 🔌 REST API Reference

All requests and responses use JSON. Authenticated endpoints use HttpOnly session cookies.

---

## 1. System Health
### `GET /api/health`
Checks Worker status and database availability.

#### Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-08-20T12:00:00.000Z"
  }
}
```

---

## 2. Authentication
### `GET /api/auth/google`
Redirects browser to Google OAuth consent screen.

### `GET /api/auth/google/callback`
Validates OAuth state, exchanges code for Google tokens, creates user session, and sets `session` HttpOnly cookie.

### `GET /api/auth/me`
Fetches current authenticated user profile.

#### Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_12345",
      "email": "user@example.com",
      "name": "Jane Doe",
      "avatar_url": "https://lh3.googleusercontent.com/..."
    }
  }
}
```

### `POST /api/auth/logout`
Destroys session in D1 and invalidates the session cookie.

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
      "domain": "PASS",
      "mx": "PASS",
      "spf": "PASS",
      "dmarc": "PASS",
      "disposable": "NOT_DISPOSABLE",
      "role": "NOT_ROLE",
      "catch_all": "UNKNOWN",
      "smtp": "UNKNOWN"
    },
    "created_at": "2026-08-20T12:00:00.000Z"
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
Upload a CSV or JSON list of emails (max 500 emails per batch in free tier).

### `GET /api/bulk/:id`
Check status and progress of a bulk verification job.

### `GET /api/bulk/:id/results`
Download or view results of the bulk verification job.

---

## 6. Account Management (Authenticated)
### `DELETE /api/account`
Deletes user account, associated sessions, verification history, and bulk jobs immediately.
