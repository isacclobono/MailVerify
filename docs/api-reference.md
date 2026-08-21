# 🔌 REST API Reference & Specification

Base URL: `https://mailverify.pulsechat.workers.dev`

All requests and responses use standard JSON formatting. Authentication supports both `X-API-Key: mv_live_...` and `Authorization: Bearer ...` headers as well as HttpOnly session cookies.

---

## 1. Authentication Endpoints

### `POST /api/auth/admin/login`
Authenticates administrator via email and password without Google OAuth.

#### Request Body:
```json
{
  "email": "admin@mailverify.com",
  "password": "YourAdminPassword123!"
}
```

#### Response:
```json
{
  "success": true,
  "data": {
    "token": "mv_sess_...",
    "user": {
      "id": "usr_admin_123",
      "email": "admin@mailverify.com",
      "name": "System Administrator",
      "is_admin": true
    }
  }
}
```

---

### `GET /api/auth/google`
Initiates Google OAuth 2.0 OpenID Connect login flow.

### `GET /api/auth/google/callback`
Validates OAuth authorization code and creates session cookie.

### `GET /api/auth/me`
Returns profile details of the authenticated developer / administrator.

### `POST /api/auth/logout`
Destroys session and clears cookies.

---

## 2. Core Email Verification Pipeline

### `POST /api/verify` or `GET /api/verify?email=...`
Executes the full 8-stage verification pipeline: Syntax, Domain DNS, MX Exchanger, SPF, DMARC, Disposable Detection, Role Classification, and Typo Suggestions.

#### Request Payload:
```json
{
  "email": "contact@stripe.com"
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "email": "contact@stripe.com",
    "normalized_email": "contact@stripe.com",
    "verdict": "LIKELY_DELIVERABLE",
    "score": 10,
    "confidence": 0.98,
    "is_free_provider": false,
    "did_you_mean": null,
    "reasons": [
      "REASON_BUSINESS_CORPORATE_DOMAIN",
      "REASON_DOMAIN_ACTIVE",
      "REASON_MX_SERVERS_CONFIGURED",
      "REASON_SPF_POLICY_VALID",
      "REASON_DMARC_POLICY_ENFORCED"
    ],
    "checks": {
      "syntax": "PASS",
      "domain": "DOMAIN_EXISTS",
      "mx": "MX_FOUND",
      "spf": "SPF_PRESENT",
      "dmarc": "DMARC_PRESENT",
      "disposable": "NOT_DISPOSABLE",
      "role": "PERSONAL_ACCOUNT_LIKELY",
      "catch_all": "UNKNOWN",
      "smtp": "UNKNOWN",
      "free_provider": "BUSINESS_CORPORATE"
    },
    "created_at": "2026-08-21T14:00:00.000Z"
  }
}
```

---

## 3. Dedicated Sub-Pipeline Micro-Checks

Call individual verification stages independently:

| Endpoint | Method | Parameter | Description |
|---|---|---|---|
| `/api/check/syntax` | `GET\|POST` | `email` | RFC 5322 syntax and length boundaries. |
| `/api/check/dns` | `GET\|POST` | `domain` | DoH A/AAAA address resolution. |
| `/api/check/mx` | `GET\|POST` | `domain` | MX records sorted by priority & RFC 7505 check. |
| `/api/check/security` | `GET\|POST` | `domain` | Raw SPF & DMARC anti-spoofing policy inspection. |
| `/api/check/disposable` | `GET\|POST` | `domain` | Lookup against 10+ multi-source burner domain lists. |
| `/api/check/provider` | `GET\|POST` | `email` | Detects role mailbox aliases & corporate vs free provider. |
| `/api/check/typo` | `GET\|POST` | `email` | Levenshtein typo detection and corrections (e.g. `gmial.com`). |

---

## 4. Bulk Batch Verification

### `POST /api/bulk`
Verifies up to 200 emails per batch concurrently with automatic rate throttling.

#### Request Body (JSON or raw CSV/TXT):
```json
{
  "emails": [
    "user1@gmail.com",
    "contact@stripe.com",
    "burner@mailinator.com"
  ]
}
```

#### Response:
```json
{
  "success": true,
  "summary": {
    "total": 3,
    "processed": 3,
    "successful": 2,
    "failed": 1,
    "results": [ ... ]
  }
}
```

---

## 5. API Key Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/keys` | List active API keys and monthly quota usage. |
| `POST` | `/api/keys` | Generate a new API key (`mv_live_...`). Max 5 keys. |
| `DELETE` | `/api/keys/:id` | Revoke an API key. |

---

## 6. Administrator API Endpoints (Admin Only)

Protected by `requireAdminMiddleware`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Global user & verification counts and verdict breakdown. |
| `GET` | `/api/admin/users` | List registered accounts with pagination. |
| `GET` | `/api/admin/verifications` | Real-time global verification stream. |
| `DELETE` | `/api/admin/users/:id` | Permanently delete user and all associated records. |
| `POST` | `/api/admin/disposable/sync` | Trigger live multi-source synchronization of 10+ feeds. |
| `GET` | `/api/admin/disposable/stats` | View active metadata of the synchronized burner database. |
