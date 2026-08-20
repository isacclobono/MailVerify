# 🛠️ Setup and Deployment Guide

This guide covers local development setup and deployment to Cloudflare using only free-tier services.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- **Cloudflare Account**: [Sign up for free](https://dash.cloudflare.com/sign-up)
- **Google Cloud Account**: For Google OAuth credentials

---

## 2. Local Development Setup

### Step 1: Install Dependencies
From the repository root:
```bash
npm install
```

### Step 2: Configure Environment Variables
Inside `apps/worker/`, create `.dev.vars` for local secrets:
```ini
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=super-secret-random-key-at-least-32-chars-long
APP_BASE_URL=http://localhost:5173
```

Inside `apps/web/`, create `.env.local`:
```ini
VITE_API_BASE_URL=http://localhost:8787
```

### Step 3: Run D1 Local Database Migrations
Apply the initial schema to local SQLite database:
```bash
cd apps/worker
npx wrangler d1 migrations apply mailverify --local
```

### Step 4: Start Local Development Servers
Run the Worker backend:
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

## 3. Cloudflare Production Deployment

### Step 1: Login to Cloudflare Wrangler
```bash
npx wrangler login
```

### Step 2: Create Cloudflare D1 Database
```bash
npx wrangler d1 create mailverify
```
Copy the `database_id` output and update `apps/worker/wrangler.jsonc`.

### Step 3: Create Cloudflare KV Cache Namespace
```bash
npx wrangler kv namespace create CACHE
```
Copy the `id` output and update `apps/worker/wrangler.jsonc`.

### Step 4: Apply D1 Database Migrations in Production
```bash
npx wrangler d1 migrations apply mailverify --remote
```

### Step 5: Set Production Secrets in Cloudflare Worker
```bash
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET
```

### Step 6: Deploy the Worker Backend
```bash
cd apps/worker
npm run deploy
```

### Step 7: Deploy the React Frontend to Cloudflare Pages
1. In Cloudflare Dashboard, go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository.
3. Set **Framework preset**: `Vite`.
4. Set **Root directory**: `apps/web`.
5. Set **Build command**: `npm run build`.
6. Set **Build output directory**: `dist`.
7. Add Environment variable: `VITE_API_BASE_URL=https://your-worker.your-subdomain.workers.dev`.
8. Click **Save and Deploy**.
