import { Hono } from "hono";
import { AppContext } from "../env";
import { requireAuthMiddleware } from "../auth/sessions";
import {
  createApiKey,
  listApiKeysByUser,
  deleteApiKey,
  getMonthlyUsage,
  FREE_TIER_MONTHLY_LIMIT,
} from "../db/api-keys";

export const keyRoutes = new Hono<AppContext>();

// Require user authentication for key management
keyRoutes.use("*", requireAuthMiddleware);

// GET /api/keys - List all active API keys for user
keyRoutes.get("/", async (c) => {
  const user = c.get("user");
  if (!user || !c.env.DB) {
    return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "User session required." } }, 401);
  }

  const [keys, usage] = await Promise.all([
    listApiKeysByUser(c.env.DB, user.id),
    getMonthlyUsage(c.env.DB, user.id),
  ]);

  return c.json({
    success: true,
    data: {
      keys,
      usage: {
        current_month: usage.monthYear,
        calls_used: usage.callCount,
        monthly_limit: usage.limit,
        remaining_calls: usage.remaining,
      },
    },
  });
});

// POST /api/keys - Generate a new API key
keyRoutes.post("/", async (c) => {
  const user = c.get("user");
  if (!user || !c.env.DB) {
    return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "User session required." } }, 401);
  }

  let body: { name?: string } = {};
  try {
    body = await c.req.json();
  } catch {
    // Optional body
  }

  const name = (body.name || "Live API Key").trim().substring(0, 50);

  // Check key limit per user (max 5 keys)
  const existingKeys = await listApiKeysByUser(c.env.DB, user.id);
  if (existingKeys.length >= 5) {
    return c.json(
      {
        success: false,
        error: {
          code: "KEY_LIMIT_REACHED",
          message: "You can create up to 5 API keys. Please delete an unused key before creating a new one.",
        },
      },
      400
    );
  }

  const newKey = await createApiKey(c.env.DB, user.id, name);

  return c.json(
    {
      success: true,
      data: {
        key_id: newKey.keyId,
        raw_key: newKey.rawKey, // Returned ONLY once!
        key_prefix: newKey.keyPrefix,
        name: newKey.name,
        created_at: newKey.createdAt,
        message: "API Key created successfully. Please copy and store this key securely now. You will not be able to view the full key again.",
      },
    },
    201
  );
});

// DELETE /api/keys/:id - Revoke an API key
keyRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const keyId = c.req.param("id");

  if (!user || !c.env.DB) {
    return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "User session required." } }, 401);
  }

  const deleted = await deleteApiKey(c.env.DB, keyId, user.id);
  if (!deleted) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "API key not found or already deleted." } }, 404);
  }

  return c.json({
    success: true,
    data: {
      message: "API key revoked and deleted successfully.",
    },
  });
});

// GET /api/keys/usage - Get user's monthly API usage and quota stats
keyRoutes.get("/usage", async (c) => {
  const user = c.get("user");
  if (!user || !c.env.DB) {
    return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "User session required." } }, 401);
  }

  const usage = await getMonthlyUsage(c.env.DB, user.id);

  return c.json({
    success: true,
    data: {
      current_month: usage.monthYear,
      calls_used: usage.callCount,
      monthly_limit: usage.limit,
      remaining_calls: usage.remaining,
    },
  });
});
