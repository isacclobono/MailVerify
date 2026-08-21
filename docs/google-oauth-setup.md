# 🔑 Google OAuth 2.0 Free Setup Guide

Follow these steps to configure Google OpenID Connect / OAuth login and Admin access for MailVerify.

---

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** > **New Project**.
3. Name it `MailVerify` and click **Create**.

---

## 2. Configure OAuth Consent Screen

1. In the left navigation, go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** and click **Create**.
3. Enter Application information:
   - **App name**: `MailVerify`
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**.
5. Under **Scopes**, click **Add or Remove Scopes** and select:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
6. Click **Save and Continue**.
7. If in Testing mode, add test email addresses under **Test users**, or publish the app to Production when ready.

---

## 3. Create OAuth 2.0 Credentials

1. In the left navigation, go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Select **Application type**: `Web application`.
4. Name: `MailVerify Web App`.
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (for local development)
   - `https://mailverify-8j0.pages.dev` (for Cloudflare Pages production)
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:8787/api/auth/google/callback` (for local development)
   - `https://mailverify.pulsechat.workers.dev/api/auth/google/callback` (for Cloudflare Workers production)
7. Click **Create**.
8. Copy your **Client ID** and **Client Secret**.

---

## 4. Set Environment Variables & Admin Accounts

### Local Development:
In `.env` and `apps/worker/.dev.vars`:
```ini
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
SESSION_SECRET=a-very-secure-random-32-char-string
APP_BASE_URL=http://localhost:5173
ADMIN_EMAILS=your.email@gmail.com,admin@yourdomain.com
```

### Production Deployment:
```bash
cd apps/worker
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET
npx wrangler secret put ADMIN_EMAILS
```
