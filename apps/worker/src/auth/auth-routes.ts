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
  SESSION_COOKIE_NAME,
} from "./sessions";
import { createOrUpdateGoogleUser } from "../db/users";
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

export { authRoutes };
