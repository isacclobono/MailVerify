import { MiddlewareHandler } from "hono";
import { AppContext } from "../env";

export const securityHeadersMiddleware: MiddlewareHandler<AppContext> = async (c, next) => {
  await next();

  c.res.headers.set("X-Content-Type-Options", "nosniff");
  c.res.headers.set("X-Frame-Options", "DENY");
  c.res.headers.set("X-XSS-Protection", "1; mode=block");
  c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  c.res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
};

export const corsMiddleware: MiddlewareHandler<AppContext> = async (c, next) => {
  const origin = c.req.header("Origin");
  const appBaseUrl = c.env.APP_BASE_URL || "http://localhost:5173";

  // Check if origin is allowed
  const isAllowedOrigin =
    origin &&
    (origin === appBaseUrl ||
      origin === "http://localhost:5173" ||
      origin.endsWith(".pages.dev"));

  if (c.req.method === "OPTIONS") {
    const headers = new Headers();
    if (isAllowedOrigin && origin) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Access-Control-Allow-Credentials", "true");
    }
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
    headers.set("Access-Control-Max-Age", "86400");
    return new Response(null, { status: 204, headers });
  }

  await next();

  if (isAllowedOrigin && origin) {
    c.res.headers.set("Access-Control-Allow-Origin", origin);
    c.res.headers.set("Access-Control-Allow-Credentials", "true");
  }
};
