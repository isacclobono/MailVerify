#!/usr/bin/env bash
# ==============================================================================
# MailVerify - Complete Local Development Automated Setup Script
# ==============================================================================
# This script sets up dependencies, environment files, local Cloudflare D1
# database migrations, and prepares both the backend worker and frontend apps.
# ==============================================================================

set -e

# Colors for terminal output
BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}====================================================${RESET}"
echo -e "${BOLD}${CYAN} 🚀 MailVerify Local Environment Automated Setup    ${RESET}"
echo -e "${BOLD}${CYAN}====================================================${RESET}\n"

# 1. Check Node.js and npm
echo -e "${BOLD}▶ [1/5] Checking prerequisites...${RESET}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v18 or later from https://nodejs.org/${RESET}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "  ${GREEN}✓${RESET} Node.js version: ${NODE_VERSION}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not found. Please install npm.${RESET}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "  ${GREEN}✓${RESET} npm version: ${NPM_VERSION}"

# 2. Install Dependencies across workspaces
echo -e "\n${BOLD}▶ [2/5] Installing dependencies across monorepo workspaces...${RESET}"
npm install
echo -e "  ${GREEN}✓${RESET} Dependencies successfully installed."

# 3. Setup Environment Files
echo -e "\n${BOLD}▶ [3/5] Setting up environment files...${RESET}"

# Root .env
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "  ${GREEN}✓${RESET} Created .env from .env.example"
    fi
else
    echo -e "  ${GREEN}✓${RESET} .env already exists"
fi

# Worker .dev.vars
if [ ! -f "apps/worker/.dev.vars" ]; then
    if [ -f "apps/worker/.dev.vars.example" ]; then
        cp apps/worker/.dev.vars.example apps/worker/.dev.vars
        echo -e "  ${GREEN}✓${RESET} Created apps/worker/.dev.vars from example"
    fi
else
    echo -e "  ${GREEN}✓${RESET} apps/worker/.dev.vars already exists"
fi

# Web .env
if [ ! -f "apps/web/.env" ]; then
    if [ -f "apps/web/.env.example" ]; then
        cp apps/web/.env.example apps/web/.env
        echo -e "  ${GREEN}✓${RESET} Created apps/web/.env from example"
    fi
else
    echo -e "  ${GREEN}✓${RESET} apps/web/.env already exists"
fi

# 4. Run Local Cloudflare D1 Migrations
echo -e "\n${BOLD}▶ [4/5] Applying local Cloudflare D1 SQLite database migrations...${RESET}"
cd apps/worker
npx wrangler d1 migrations apply mailverify --local
cd ../..
echo -e "  ${GREEN}✓${RESET} Local database migrations applied successfully."

# 5. Summary & How to run
echo -e "\n${BOLD}${GREEN}====================================================${RESET}"
echo -e "${BOLD}${GREEN} 🎉 MailVerify Local Setup Complete!                ${RESET}"
echo -e "${BOLD}${GREEN}====================================================${RESET}\n"
echo -e "${BOLD}To start the local development servers:${RESET}"
echo -e "  1. Backend API (Cloudflare Worker):"
echo -e "     ${CYAN}npm run dev:worker${RESET}  (Running on http://localhost:8787)\n"
echo -e "  2. Frontend (React Vite App):"
echo -e "     ${CYAN}npm run dev:web${RESET}     (Running on http://localhost:5173)\n"
echo -e "${YELLOW}Note: To enable Google Login and Admin account, fill in your GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and ADMIN_EMAILS in .env and apps/worker/.dev.vars${RESET}\n"
