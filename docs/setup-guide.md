# 🛠️ Setup and Deployment Guide

This guide covers 1-click automated local development setup and complete production deployment to Cloudflare using only free-tier services.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** (v9 or higher)
- **Cloudflare Account**: [Sign up for free](https://dash.cloudflare.com/sign-up)
- **Google Cloud Account**: For Google OAuth 2.0 credentials

---

## 2. Fast Local Development Setup (Automated)

You can set up the entire project locally with a single script:

### On Linux / macOS / WSL / Git Bash:
```bash
chmod +x ./setup.sh
./setup.sh
```

### On Windows PowerShell:
```powershell
.\setup.ps1
```

### What the automated script does:
1. Validates Node.js and npm installations.
2. Installs dependencies across monorepo workspaces.
3. Automatically sets up `.env`, `apps/worker/.dev.vars`, and `apps/web/.env`.
4. Runs local Cloudflare D1 migrations (`migrations/`).
5. Configures your development environment for immediate use.

---

## 3. Manual Local Development Setup

If you prefer to configure manually:

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
1. Root `.env`:
```ini
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=a-very-secure-random-32-char-string
APP_BASE_URL=http://localhost:5173
ADMIN_EMAILS=admin@example.com
VITE_API_BASE_URL=http://localhost:8787
```

2. Inside `apps/worker/.dev.vars`:
```ini
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=a-very-secure-random-32-char-string
APP_BASE_URL=http://localhost:5173
ADMIN_EMAILS=admin@example.com
```

3. Inside `apps/web/.env`:
```ini
VITE_API_BASE_URL=http://localhost:8787
```

### Step 3: Run D1 Local Database Migrations
```bash
cd apps/worker
npx wrangler d1 migrations apply mailverify --local
cd ../..
```

### Step 4: Start Local Development Servers
Run the Worker backend API:
```bash
npm run dev:worker
# Worker running on http://localhost:8787
```

In a separate terminal, run the React frontend:
```bash
npm run dev:web
# Frontend running on http://localhost:5173
```

---

## 4. Cloudflare Production Deployment

### Step 1: Login to Cloudflare Wrangler
```bash
cd apps/worker
npx wrangler login
```

### Step 2: Create Cloudflare D1 Database
```bash
npx wrangler d1 create mailverify
```
Copy the output `database_id` and update `apps/worker/wrangler.jsonc`.

### Step 3: Create Cloudflare KV Cache Namespace
```bash
npx wrangler kv namespace create CACHE
```
Copy the output `id` and update `apps/worker/wrangler.jsonc`.

### Step 4: Apply D1 Database Migrations in Production
```bash
npx wrangler d1 migrations apply mailverify --remote
```

### Step 5: Set Production Secrets in Cloudflare Worker
```bash
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET
npx wrangler secret put ADMIN_EMAILS
```

### Step 6: Deploy the Worker Backend
```bash
npm run deploy
```

### Step 7: Deploy the React Frontend to Cloudflare Pages
1. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository.
3. Set **Framework preset**: `Vite`.
4. Set **Root directory**: `apps/web`.
5. Set **Build command**: `npm run build`.
6. Set **Build output directory**: `dist`.
7. Add Environment variable:
   - `VITE_API_BASE_URL`: `https://your-worker.your-subdomain.workers.dev`
8. Click **Save and Deploy**.
