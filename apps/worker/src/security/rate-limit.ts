import { Context } from "hono";
import { AppContext } from "../env";

interface RateLimitState {
  count: number;
  resetAt: number;
}

const inMemoryStore = new Map<string, RateLimitState>();

export const ANONYMOUS_CHECK_LIMIT = 5;
export const AUTHENTICATED_RATE_LIMIT = 30;

export async function checkRateLimit(
  c: Context<AppContext>
): Promise<{ allowed: boolean; remaining: number; reset: number; requireLogin: boolean }> {
  const user = c.get("user");
  const clientIp = c.req.header("CF-Connecting-IP") || c.req.header("x-forwarded-for") || "127.0.0.1";
  const now = Date.now();

  const isAnonymous = !user;
  const identifier = isAnonymous ? `anon_${clientIp}` : `usr_${user.id}`;
  const effectiveLimit = isAnonymous ? ANONYMOUS_CHECK_LIMIT : AUTHENTICATED_RATE_LIMIT;
  const windowSeconds = isAnonymous ? 86400 : 60; // 24 hours for anonymous, 1 minute for authenticated

  const key = `ratelimit:${identifier}`;
  const kv = c.env.CACHE;

  if (kv) {
    try {
      const state = (await kv.get(key, "json")) as RateLimitState | null;

      if (!state || now > state.resetAt) {
        const newState: RateLimitState = {
          count: 1,
          resetAt: now + windowSeconds * 1000,
        };
        await kv.put(key, JSON.stringify(newState), { expirationTtl: windowSeconds + 10 });
        return {
          allowed: true,
          remaining: Math.max(effectiveLimit - 1, 0),
          reset: newState.resetAt,
          requireLogin: false,
        };
      }

      if (state.count >= effectiveLimit) {
        return {
          allowed: false,
          remaining: 0,
          reset: state.resetAt,
          requireLogin: isAnonymous,
        };
      }

      state.count += 1;
      await kv.put(key, JSON.stringify(state), {
        expirationTtl: Math.max(Math.ceil((state.resetAt - now) / 1000), 10),
      });

      return {
        allowed: true,
        remaining: Math.max(effectiveLimit - state.count, 0),
        reset: state.resetAt,
        requireLogin: false,
      };
    } catch {
      // Fallback to in-memory store
    }
  }

  // In-memory fallback
  const current = inMemoryStore.get(key);
  if (!current || now > current.resetAt) {
    const newState: RateLimitState = {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    };
    inMemoryStore.set(key, newState);
    return {
      allowed: true,
      remaining: Math.max(effectiveLimit - 1, 0),
      reset: newState.resetAt,
      requireLogin: false,
    };
  }

  if (current.count >= effectiveLimit) {
    return {
      allowed: false,
      remaining: 0,
      reset: current.resetAt,
      requireLogin: isAnonymous,
    };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: Math.max(effectiveLimit - current.count, 0),
    reset: current.resetAt,
    requireLogin: false,
  };
}
