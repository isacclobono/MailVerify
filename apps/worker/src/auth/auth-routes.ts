import { Hono } from "hono";
import { AppContext } from "../env";
import {
  generateOAuthState,
  getGoogleAuthorizationUrl,
  exchangeCodeForTokens,
  fetchGoogleUserProfile,
} from "./google";
import {
  parseCookies,
  buildSessionCookie,
  buildClearSessionCookie,
  requireAuthMiddleware,
  checkIsAdmin,
  extractAuthToken,
  SESSION_COOKIE_NAME,
} from "./sessions";
import { createOrUpdateGoogleUser, findOrCreateAdminUser } from "../db/users";
import { createSession, deleteSessionByToken } from "../db/sessions";

const authRoutes = new Hono<AppContext>();

// Initiates Google OAuth Login
authRoutes.get("/google", async (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return c.json(
      {
        success: false,
        error: { code: "CONFIG_ERROR", message: "Google Client ID is not configured." },
      },
      500
    );
  }

  const reqUrl = new URL(c.req.url);
  const redirectUri = `${reqUrl.origin}/api/auth/google/callback`;
  const state = generateOAuthState();

  const isSecure = reqUrl.protocol === "https:";
  const stateCookie = `oauth_state=${state}; Path=/api/auth; Max-Age=600; HttpOnly; SameSite=Lax${
    isSecure ? "; Secure" : ""
  }`;

  const authUrl = getGoogleAuthorizationUrl(clientId, redirectUri, state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl,
      "Set-Cookie": stateCookie,
    },
  });
});

// Google OAuth Callback
authRoutes.get("/google/callback", async (c) => {
  const code = c.req.query("code");
  const returnedState = c.req.query("state");
  const errorParam = c.req.query("error");

  const appBaseUrl = c.env.APP_BASE_URL || "http://localhost:5173";

  if (errorParam || !code || !returnedState) {
    return c.redirect(`${appBaseUrl}/?error=oauth_cancelled`);
  }

  const cookieHeader = c.req.header("Cookie") || null;
  const cookies = parseCookies(cookieHeader);
  const originalState = cookies["oauth_state"];

  if (!originalState || originalState !== returnedState) {
    return c.redirect(`${appBaseUrl}/?error=invalid_state`);
  }

  try {
    const reqUrl = new URL(c.req.url);
    const redirectUri = `${reqUrl.origin}/api/auth/google/callback`;

    // 1. Exchange code for tokens
    const { access_token } = await exchangeCodeForTokens(
      code,
      c.env.GOOGLE_CLIENT_ID,
      c.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    // 2. Fetch profile
    const profile = await fetchGoogleUserProfile(access_token);

    if (!profile.email) {
      return c.redirect(`${appBaseUrl}/?error=missing_email`);
    }

    // 3. Create or update user in D1
    const user = await createOrUpdateGoogleUser(c.env.DB, {
      googleSub: profile.sub,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
    });

    // 4. Create new application session
    const { rawToken } = await createSession(c.env.DB, user.id);

    const isSecure = reqUrl.protocol === "https:";
    const sessionCookie = buildSessionCookie(rawToken, 2592000, isSecure);
    const clearStateCookie = `oauth_state=; Path=/api/auth; Max-Age=0; HttpOnly; SameSite=Lax${
      isSecure ? "; Secure" : ""
    }`;

    const headers = new Headers();
    headers.set("Location", `${appBaseUrl}/dashboard?token=${encodeURIComponent(rawToken)}`);
    headers.append("Set-Cookie", sessionCookie);
    headers.append("Set-Cookie", clearStateCookie);

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown OAuth error";
    return c.redirect(`${appBaseUrl}/?error=${encodeURIComponent(message)}`);
  }
});

// Get authenticated user info
authRoutes.get("/me", requireAuthMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({
    success: true,
    data: {
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        avatar_url: user?.avatar_url,
        is_admin: Boolean(user?.isAdmin),
      },
    },
  });
});

// Logout endpoint
authRoutes.post("/logout", async (c) => {
  const rawToken = extractAuthToken(c);

  if (rawToken && c.env.DB) {
    await deleteSessionByToken(c.env.DB, rawToken);
  }

  const reqUrl = new URL(c.req.url);
  const isSecure = reqUrl.protocol === "https:";
  const clearCookie = buildClearSessionCookie(isSecure);

  return new Response(
    JSON.stringify({ success: true, message: "Logged out successfully." }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": clearCookie,
      },
    }
  );
});

// Admin Email & Password Authentication Endpoint
authRoutes.post("/admin/login", async (c) => {
  try {
    const body = await c.req.json<{ email?: string; password?: string }>();
    const email = body?.email?.toLowerCase().trim();
    const password = body?.password;

    if (!email || !password) {
      return c.json(
        {
          success: false,
          error: { code: "MISSING_CREDENTIALS", message: "Both email and password are required." },
        },
        400
      );
    }

    // Expected Admin Password from Environment (or default)
    const expectedPassword = c.env.ADMIN_PASSWORD || "AdminMailVerify2026!";
    const isAdminEmail = checkIsAdmin(email, c.env.ADMIN_EMAILS);

    if (!isAdminEmail || password !== expectedPassword) {
      return c.json(
        {
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid administrator email or password." },
        },
        401
      );
    }

    // Create or retrieve local admin user record in D1
    const adminUser = await findOrCreateAdminUser(c.env.DB, email, "System Administrator");

    // Generate authenticated session token
    const { rawToken } = await createSession(c.env.DB, adminUser.id);

    const reqUrl = new URL(c.req.url);
    const isSecure = reqUrl.protocol === "https:";
    const sessionCookie = buildSessionCookie(rawToken, 2592000, isSecure);

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.append("Set-Cookie", sessionCookie);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          token: rawToken,
          user: {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name || "System Administrator",
            avatar_url: adminUser.avatar_url || null,
            is_admin: true,
          },
        },
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Admin login failed";
    return c.json({ success: false, error: { code: "ADMIN_LOGIN_ERROR", message } }, 500);
  }
});

export { authRoutes };
