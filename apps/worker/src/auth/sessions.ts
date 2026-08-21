import { Context, MiddlewareHandler } from "hono";
import { AppContext } from "../env";
import { findSessionAndUserByToken } from "../db/sessions";

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
  const secureFlag = isSecure ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax${secureFlag}`;
}

export function buildClearSessionCookie(isSecure = true): string {
  const secureFlag = isSecure ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secureFlag}`;
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
  const cookieHeader = c.req.header("Cookie") || null;
  const cookies = parseCookies(cookieHeader);
  const rawToken = cookies[SESSION_COOKIE_NAME];

  if (rawToken && c.env.DB) {
    try {
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
    } catch {
      // Ignore session lookup failures
    }
  }

  await next();
};

export const requireAuthMiddleware: MiddlewareHandler<AppContext> = async (c, next) => {
  const cookieHeader = c.req.header("Cookie") || null;
  const cookies = parseCookies(cookieHeader);
  const rawToken = cookies[SESSION_COOKIE_NAME];

  if (!rawToken || !c.env.DB) {
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required to access this resource.",
        },
      },
      401
    );
  }

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

