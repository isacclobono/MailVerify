import { Hono } from "hono";
import { AppContext } from "./env";
import { authRoutes } from "./auth/auth-routes";
import { adminRoutes } from "./admin/admin-routes";
import { keyRoutes } from "./keys/key-routes";
import { checkRoutes } from "./check-routes";
import { optionalAuthMiddleware, requireAuthMiddleware } from "./auth/sessions";
import { securityHeadersMiddleware, corsMiddleware } from "./security/security";
import { checkRateLimit, ANONYMOUS_CHECK_LIMIT } from "./security/rate-limit";
import { validateEmailInput, MAX_CSV_SIZE, MAX_BULK_EMAILS } from "./security/validation";
import { verifyEmail } from "./verification/verifier";
import { CacheService } from "./cache/cache";
import { saveVerification, getUserVerifications } from "./db/verifications";
import { createBulkJob, getBulkJobById } from "./db/jobs";
import { parseEmailsMultiFormat } from "./bulk/parser";
import { processBulkVerification } from "./bulk/bulk";
import { deleteUser } from "./db/users";
import { incrementMonthlyUsage, getMonthlyUsage, FREE_TIER_MONTHLY_LIMIT } from "./db/api-keys";

export function createRouter(): Hono<AppContext> {
  const app = new Hono<AppContext>();

  // Global Middlewares
  app.use("*", corsMiddleware);
  app.use("*", securityHeadersMiddleware);
  app.use("/api/*", optionalAuthMiddleware);

  // Root status page for browsers and API clients
  app.get("/", (c) => {
    const acceptHeader = c.req.header("Accept") || "";
    const appBaseUrl = c.env.APP_BASE_URL || "https://mailverify-8j0.pages.dev";

    if (acceptHeader.includes("text/html")) {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MailVerify API — Operational</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2'><rect width='20' height='16' x='2' y='4' rx='2'/><path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/></svg>">
  <style>
    :root {
      --bg: #09090b;
      --card: #18181b;
      --border: #27272a;
      --text: #fafafa;
      --muted: #a1a1aa;
      --primary: #3b82f6;
      --success: #10b981;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
    }
    .card {
      background-color: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 580px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }
    .dot {
      width: 8px;
      height: 8px;
      background-color: var(--success);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--success);
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }
    h1 span { color: var(--primary); font-weight: 400; }
    p {
      color: var(--muted);
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }
    .endpoints {
      background: #000;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem 1.25rem;
      font-family: monospace;
      font-size: 0.85rem;
      color: #d4d4d8;
      margin-bottom: 1.75rem;
      line-height: 1.8;
    }
    .endpoints div { display: flex; justify-content: space-between; }
    .method { color: #60a5fa; font-weight: 600; }
    .btn-group { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .btn-primary { background: #fafafa; color: #09090b; }
    .btn-primary:hover { background: #e4e4e7; transform: translateY(-1px); }
    .btn-secondary { background: transparent; color: #fafafa; border: 1px solid var(--border); }
    .btn-secondary:hover { background: #27272a; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span class="dot"></span> All Systems Operational
    </div>
    <h1>Mail<span>Verify</span> API</h1>
    <p>Cloudflare Serverless High-Precision Email Verification & Deliverability Engine.</p>
    
    <div class="endpoints">
      <div><span class="method">GET</span> <span>/api/health</span></div>
      <div><span class="method">POST</span> <span>/api/verify</span></div>
      <div><span class="method">POST</span> <span>/api/bulk</span></div>
      <div><span class="method">GET</span> <span>/api/auth/google</span></div>
      <div><span class="method">GET</span> <span>/api/admin/stats</span></div>
    </div>

    <div class="btn-group">
      <a href="${appBaseUrl}" class="btn btn-primary">Open Web Application →</a>
      <a href="https://github.com/isacclobono/MailVerify" target="_blank" class="btn btn-secondary">GitHub Docs</a>
    </div>
  </div>
</body>
</html>`;
      return c.html(html);
    }

    return c.json({
      name: "MailVerify API",
      status: "operational",
      message: "MailVerify Cloudflare Serverless API is running.",
      version: "1.0.0",
      frontend_url: appBaseUrl,
      docs_url: "https://github.com/isacclobono/MailVerify",
      edge_runtime: "Cloudflare Workers",
      endpoints: {
        health: "GET /api/health",
        verify: "POST /api/verify",
        bulk: "POST /api/bulk",
        auth_google: "GET /api/auth/google",
        auth_me: "GET /api/auth/me",
        admin_stats: "GET /api/admin/stats",
      },
    });
  });

  // Health check with CDN edge cache headers
  app.get("/api/health", (c) => {
    c.header("Cache-Control", "public, max-age=30, s-maxage=60");
    c.header("CF-Cache-Status", "DYNAMIC");
    return c.json({
      success: true,
      data: {
        status: "healthy",
        edge_runtime: "Cloudflare Workers",
        cdn_cache: "enabled",
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Auth routes
  app.route("/api/auth", authRoutes);

  // Admin routes
  app.route("/api/admin", adminRoutes);

  // API Key management routes
  app.route("/api/keys", keyRoutes);

  // Dedicated sub-checker pipeline routes
  app.route("/api/check", checkRoutes);

  // Single Verification (Anonymous with 5-check limit & Authenticated 200/mo limit)
  app.all("/api/verify", async (c) => {
    const user = c.get("user");

    // 1. Check Monthly Quota for Authenticated User (Session or API Key)
    if (user && c.env.DB) {
      const usage = await incrementMonthlyUsage(c.env.DB, user.id, 1, user.isAdmin);
      c.res.headers.set("X-RateLimit-Monthly-Limit", usage.limit === -1 ? "unlimited" : usage.limit.toString());
      c.res.headers.set("X-RateLimit-Monthly-Remaining", usage.remaining === -1 ? "unlimited" : usage.remaining.toString());

      if (!usage.allowed) {
        return c.json(
          {
            success: false,
            error: {
              code: "MONTHLY_QUOTA_EXCEEDED",
              message: `You have reached your monthly plan limit of ${usage.limit} API calls for this month. Your quota will reset on the 1st of next month.`,
            },
          },
          429
        );
      }
    } else {
      // Anonymous IP Rate Limiting
      const rateLimit = await checkRateLimit(c);
      c.res.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
      c.res.headers.set("X-RateLimit-Reset", rateLimit.reset.toString());

      if (!rateLimit.allowed) {
        if (rateLimit.requireLogin) {
          return c.json(
            {
              success: false,
              error: {
                code: "LOGIN_REQUIRED",
                message: `You have reached the free limit of ${ANONYMOUS_CHECK_LIMIT} anonymous email verifications. Please sign in with Google to get 200 free API calls and your API Key.`,
              },
            },
            403
          );
        }

        return c.json(
          {
            success: false,
            error: {
              code: "RATE_LIMITED",
              message: "Rate limit exceeded. Please wait a moment before trying again.",
            },
          },
          429
        );
      }
    }

    // 2. Validate input (from query ?email= or JSON body)
    let emailToVerify = c.req.query("email");
    if (!emailToVerify && c.req.method === "POST") {
      try {
        const body = await c.req.json();
        const validated = validateEmailInput(body);
        if (validated.valid) {
          emailToVerify = validated.email;
        } else {
          return c.json(
            {
              success: false,
              error: { code: "INVALID_EMAIL", message: validated.error || "Invalid email parameter." },
            },
            400
          );
        }
      } catch {
        return c.json(
          {
            success: false,
            error: { code: "INVALID_BODY", message: "Invalid JSON in request body." },
          },
          400
        );
      }
    }

    if (!emailToVerify) {
      return c.json(
        {
          success: false,
          error: { code: "INVALID_EMAIL", message: "Please provide an email address via ?email= or JSON body { email }." },
        },
        400
      );
    }

    const email = emailToVerify.trim();

    // 3. Perform Verification
    const cache = new CacheService(c.env.CACHE);
    const result = await verifyEmail(email, cache);

    // 4. Save record if user is authenticated
    if (user && c.env.DB) {
      try {
        const id = await saveVerification(c.env.DB, result, user.id);
        result.id = id;
      } catch (err) {
        console.error("Failed to save verification record:", err);
      }
    }

    return c.json({
      success: true,
      data: {
        ...result,
      },
    });
  });

  // History (Authenticated)
  app.get("/api/history", requireAuthMiddleware, async (c) => {
    const user = c.get("user")!;
    const limitParam = c.req.query("limit");
    const offsetParam = c.req.query("offset");

    const limit = Math.min(Math.max(parseInt(limitParam || "50", 10) || 50, 1), 100);
    const offset = Math.max(parseInt(offsetParam || "0", 10) || 0, 0);

    const history = await getUserVerifications(c.env.DB, user.id, limit, offset);

    return c.json({
      success: true,
      data: {
        items: history,
        limit,
        offset,
      },
    });
  });

  // Usage statistics (Authenticated)
  app.get("/api/usage", requireAuthMiddleware, async (c) => {
    const user = c.get("user")!;
    const [history, monthlyUsage] = await Promise.all([
      getUserVerifications(c.env.DB, user.id, 100, 0),
      getMonthlyUsage(c.env.DB, user.id, user.isAdmin),
    ]);

    const total = history.length;
    const deliverable = history.filter((h) => h.verdict === "LIKELY_DELIVERABLE").length;
    const risky = history.filter((h) => h.verdict === "RISKY" || h.verdict === "ROLE_ACCOUNT").length;
    const invalid = history.filter((h) => h.verdict === "LIKELY_INVALID" || h.verdict === "NO_MX" || h.verdict === "INVALID_SYNTAX" || h.verdict === "DISPOSABLE").length;

    return c.json({
      success: true,
      data: {
        total_recent_verifications: total,
        deliverable_count: deliverable,
        risky_count: risky,
        invalid_count: invalid,
        retention_days: 5,
        monthly_quota: {
          current_month: monthlyUsage.monthYear,
          plan: monthlyUsage.plan,
          calls_used: monthlyUsage.callCount,
          monthly_limit: monthlyUsage.limit,
          remaining_calls: monthlyUsage.remaining,
          is_unlimited: user.isAdmin || monthlyUsage.limit === -1,
        },
      },
    });
  });

  // Bulk Verification (Authenticated - Multi-format: CSV, JSON, TXT)
  app.post("/api/bulk", requireAuthMiddleware, async (c) => {
    const user = c.get("user")!;
    const contentType = c.req.header("Content-Type") || "";

    let emailsToVerify: string[] = [];

    if (contentType.includes("application/json")) {
      let body: unknown;
      try {
        body = await c.req.json();
      } catch {
        return c.json(
          { success: false, error: { code: "INVALID_JSON", message: "Malformed JSON payload." } },
          400
        );
      }
      emailsToVerify = parseEmailsMultiFormat(body, MAX_BULK_EMAILS);
    } else {
      // Text, CSV, TSV, or raw payload
      const rawText = await c.req.text();
      if (rawText.length > MAX_CSV_SIZE) {
        return c.json(
          { success: false, error: { code: "PAYLOAD_TOO_LARGE", message: "File exceeds maximum allowed size (2MB)." } },
          400
        );
      }
      emailsToVerify = parseEmailsMultiFormat(rawText, MAX_BULK_EMAILS);
    }

    if (emailsToVerify.length === 0) {
      return c.json(
        {
          success: false,
          error: { code: "EMPTY_LIST", message: "No valid email addresses found in the provided file/text." },
        },
        400
      );
    }

    // Check Monthly Quota for Authenticated User
    if (user && c.env.DB) {
      const currentQuota = await getMonthlyUsage(c.env.DB, user.id, user.isAdmin);
      if (!user.isAdmin && currentQuota.limit !== -1 && currentQuota.remaining <= 0) {
        return c.json(
          {
            success: false,
            error: {
              code: "MONTHLY_QUOTA_EXCEEDED",
              message: `You have reached your monthly plan limit of ${currentQuota.limit} API calls. Quota resets on the 1st.`,
            },
          },
          429
        );
      }
    }

    // Create job record in D1
    const job = await createBulkJob(c.env.DB, user.id, emailsToVerify.length);

    // Process bulk verification
    const cache = new CacheService(c.env.CACHE);
    const summary = await processBulkVerification(c.env.DB, job.id, user.id, emailsToVerify, cache);

    // Increment monthly quota by processed count
    if (user && c.env.DB && summary.processed > 0) {
      await incrementMonthlyUsage(c.env.DB, user.id, summary.processed, user.isAdmin);
    }

    return c.json({
      success: true,
      data: {
        job_id: job.id,
        summary,
      },
    });
  });

  // Bulk Job Status (Authenticated)
  app.get("/api/bulk/:id", requireAuthMiddleware, async (c) => {
    const user = c.get("user")!;
    const jobId = c.req.param("id");

    const job = await getBulkJobById(c.env.DB, jobId, user.id);
    if (!job) {
      return c.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Bulk verification job not found." },
        },
        404
      );
    }

    return c.json({
      success: true,
      data: { job },
    });
  });

  // Delete User Account (Authenticated)
  app.delete("/api/account", requireAuthMiddleware, async (c) => {
    const user = c.get("user")!;

    await deleteUser(c.env.DB, user.id);

    return c.json({
      success: true,
      message: "Account and all associated verification data deleted successfully.",
    });
  });

  return app;
}
