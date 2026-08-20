import { Hono } from "hono";
import { AppContext } from "./env";
import { authRoutes } from "./auth/auth-routes";
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

export function createRouter(): Hono<AppContext> {
  const app = new Hono<AppContext>();

  // Global Middlewares
  app.use("*", corsMiddleware);
  app.use("*", securityHeadersMiddleware);
  app.use("/api/*", optionalAuthMiddleware);

  // Health check
  app.get("/api/health", (c) => {
    return c.json({
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Auth routes
  app.route("/api/auth", authRoutes);

  // Single Verification (Anonymous with 5-check limit & Authenticated)
  app.post("/api/verify", async (c) => {
    // 1. Rate Limiting Check
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
              message: `You have reached the free limit of ${ANONYMOUS_CHECK_LIMIT} anonymous email verifications. Please sign in with Google to continue verifying unlimited emails.`,
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

    // 2. Validate input
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(
        {
          success: false,
          error: { code: "INVALID_BODY", message: "Invalid JSON in request body." },
        },
        400
      );
    }

    const { valid, email, error } = validateEmailInput(body);
    if (!valid) {
      return c.json(
        {
          success: false,
          error: { code: "INVALID_EMAIL", message: error || "Invalid email parameter." },
        },
        400
      );
    }

    // 3. Perform Verification
    const cache = new CacheService(c.env.CACHE);
    const result = await verifyEmail(email, cache);

    // 4. Save record if user is authenticated
    const user = c.get("user");
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
        remaining_anonymous_checks: !user ? rateLimit.remaining : undefined,
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
    const history = await getUserVerifications(c.env.DB, user.id, 100, 0);

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

    // Create job record in D1
    const job = await createBulkJob(c.env.DB, user.id, emailsToVerify.length);

    // Process bulk verification
    const cache = new CacheService(c.env.CACHE);
    const summary = await processBulkVerification(c.env.DB, job.id, user.id, emailsToVerify, cache);

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
