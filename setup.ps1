# ==============================================================================
# MailVerify - Complete Local Development Automated Setup Script (PowerShell)
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " 🚀 MailVerify Local Environment Automated Setup    " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js and npm
Write-Host "▶ [1/5] Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "  ✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

try {
    $npmVersion = npm -v
    Write-Host "  ✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not found." -ForegroundColor Red
    exit 1
}

# 2. Install Dependencies
Write-Host "`n▶ [2/5] Installing dependencies across monorepo workspaces..." -ForegroundColor Yellow
npm install
Write-Host "  ✓ Dependencies installed successfully." -ForegroundColor Green

# 3. Environment Files
Write-Host "`n▶ [3/5] Setting up environment files..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  ✓ Created .env from .env.example" -ForegroundColor Green
    }
} else {
    Write-Host "  ✓ .env already exists" -ForegroundColor Green
}

if (-not (Test-Path "apps/worker/.dev.vars")) {
    if (Test-Path "apps/worker/.dev.vars.example") {
        Copy-Item "apps/worker/.dev.vars.example" "apps/worker/.dev.vars"
        Write-Host "  ✓ Created apps/worker/.dev.vars from example" -ForegroundColor Green
    }
} else {
    Write-Host "  ✓ apps/worker/.dev.vars already exists" -ForegroundColor Green
}

if (-not (Test-Path "apps/web/.env")) {
    if (Test-Path "apps/web/.env.example") {
        Copy-Item "apps/web/.env.example" "apps/web/.env"
        Write-Host "  ✓ Created apps/web/.env from example" -ForegroundColor Green
    }
} else {
    Write-Host "  ✓ apps/web/.env already exists" -ForegroundColor Green
}

# 4. Local D1 Migrations
Write-Host "`n▶ [4/5] Applying local Cloudflare D1 SQLite database migrations..." -ForegroundColor Yellow
Push-Location "apps/worker"
try {
    npx wrangler d1 migrations apply mailverify --local
    Write-Host "  ✓ Local database migrations applied successfully." -ForegroundColor Green
} finally {
    Pop-Location
}

# 5. Summary & How to run
Write-Host "`n====================================================" -ForegroundColor Green
Write-Host " 🎉 MailVerify Local Setup Complete!                " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the local development servers:" -ForegroundColor Yellow
Write-Host "  1. Backend API (Cloudflare Worker):"
Write-Host "     npm run dev:worker  (Running on http://localhost:8787)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Frontend (React Vite App):"
Write-Host "     npm run dev:web     (Running on http://localhost:5173)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: To enable Google Login and Admin account, fill in your GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and ADMIN_EMAILS in .env and apps/worker/.dev.vars" -ForegroundColor DarkYellow
