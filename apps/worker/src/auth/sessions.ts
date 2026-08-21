import { Context, MiddlewareHandler } from "hono";
import { AppContext } from "../env";
import { findSessionAndUserByToken } from "../db/sessions";
import { findUserByApiKey, incrementMonthlyUsage, getMonthlyUsage, FREE_TIER_MONTHLY_LIMIT } from "../db/api-keys";

export const SESSION_COOKIE_NAME = "mv_session";

export function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [key, ...values] = pair.trim().split("=");
    if (key) {
      const rawVal = values.join("=");
      try {
        cookies[key] = decodeURIComponent(rawVal);
      } catch {
        cookies[key] = rawVal;
      }
    }
  }
  return cookies;
}

export function buildSessionCookie(token: string, maxAgeSeconds = 2592000, isSecure = true): string {
  const sameSite = isSecure ? "None" : "Lax";
  const secureFlag = isSecure ? "; Secure; Partitioned" : "";
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=${sameSite}${secureFlag}`;
}

export function buildClearSessionCookie(isSecure = true): string {
  const sameSite = isSecure ? "None" : "Lax";
  const secureFlag = isSecure ? "; Secure; Partitioned" : "";
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=${sameSite}${secureFlag}`;
}

export function extractAuthToken(c: Context<AppContext>): string | null {
  // 1. Check X-API-Key header
  const apiKeyHeader = c.req.header("X-API-Key");
  if (apiKeyHeader && apiKeyHeader.trim()) {
    return apiKeyHeader.trim();
  }

  // 2. Check Authorization header (Bearer token or API key)
  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.substring(7).trim();
  }

  // 3. Check Cookie
  const cookieHeader = c.req.header("Cookie") || null;
  const cookies = parseCookies(cookieHeader);
  if (cookies[SESSION_COOKIE_NAME]) {
    return cookies[SESSION_COOKIE_NAME];
  }

  return null;
}

export function checkIsAdmin(email: string, adminEmailsConfig?: string): boolean {
  if (!adminEmailsConfig || !email) return false;
  const list = adminEmailsConfig
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export const optionalAuthMiddleware: MiddlewareHandler<AppContext> = async (c, next) => {
  const rawToken = extractAuthToken(c);

  if (rawToken && c.env.DB) {
    try {
      if (rawToken.startsWith("mv_live_")) {
        // Authenticate via API Key
        const keyData = await findUserByApiKey(c.env.DB, rawToken);
        if (keyData) {
          const isAdmin = checkIsAdmin(keyData.user.email, c.env.ADMIN_EMAILS);
          c.set("user", {
            id: keyData.user.id,
            email: keyData.user.email,
            name: keyData.user.name || undefined,
            avatar_url: keyData.user.avatar_url || undefined,
            isAdmin,
          });
        }
      } else {
        // Authenticate via Session Token
        const authData = await findSessionAndUserByToken(c.env.DB, rawToken);
        if (authData) {
          const isAdmin = checkIsAdmin(authData.user.email, c.env.ADMIN_EMAILS);
          c.set("user", {
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.name || undefined,
            avatar_url: authData.user.avatar_url || undefined,
            isAdmin,
          });
          c.set("sessionId", authData.session.id);
        }
      }
    } catch {
      // Ignore session lookup failures
    }
  }

  await next();
};

export const requireAuthMiddleware: MiddlewareHandler<AppContext> = async (c, next) => {
  const rawToken = extractAuthToken(c);

  if (!rawToken || !c.env.DB) {
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication or API Key required to access this resource.",
        },
      },
      401
    );
  }

  if (rawToken.startsWith("mv_live_")) {
    const keyData = await findUserByApiKey(c.env.DB, rawToken);
    if (!keyData) {
      return c.json(
        {
          success: false,
          error: {
            code: "INVALID_API_KEY",
            message: "The provided API Key is invalid, inactive, or revoked.",
          },
        },
        401
      );
    }

    const isAdmin = checkIsAdmin(keyData.user.email, c.env.ADMIN_EMAILS);
    c.set("user", {
      id: keyData.user.id,
      email: keyData.user.email,
      name: keyData.user.name || undefined,
      avatar_url: keyData.user.avatar_url || undefined,
      isAdmin,
    });
  } else {
    const authData = await findSessionAndUserByToken(c.env.DB, rawToken);
    if (!authData) {
      return c.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Session expired or invalid.",
          },
        },
        401
      );
    }

    const isAdmin = checkIsAdmin(authData.user.email, c.env.ADMIN_EMAILS);
    c.set("user", {
      id: authData.user.id,
      email: authData.user.email,
      name: authData.user.name || undefined,
      avatar_url: authData.user.avatar_url || undefined,
      isAdmin,
    });
    c.set("sessionId", authData.session.id);
  }

  await next();
};

export const requireAdminMiddleware: MiddlewareHandler<AppContext> = async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
      },
      401
    );
  }

  if (!user.isAdmin) {
    return c.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Admin privileges required to access this resource.",
        },
      },
      403
    );
  }

  await next();
};

