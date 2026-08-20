import { User } from "./users";

export interface Session {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

export async function hashSessionToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSession(
  db: D1Database,
  userId: string,
  ttlDays = 30
): Promise<{ session: Session; rawToken: string }> {
  const rawToken = generateSessionToken();
  const tokenHash = await hashSessionToken(rawToken);
  const sessionId = `ses_${crypto.randomUUID()}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
  const createdAt = now.toISOString();

  await db
    .prepare(
      "INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(sessionId, userId, tokenHash, expiresAt, createdAt)
    .run();

  return {
    session: {
      id: sessionId,
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_at: createdAt,
    },
    rawToken,
  };
}

export async function findSessionAndUserByToken(
  db: D1Database,
  rawToken: string
): Promise<{ session: Session; user: User } | null> {
  const tokenHash = await hashSessionToken(rawToken);
  const now = new Date().toISOString();

  interface JoinedResult {
    session_id: string;
    user_id: string;
    token_hash: string;
    expires_at: string;
    session_created_at: string;
    user_email: string;
    user_name: string | null;
    user_avatar_url: string | null;
    user_google_sub: string | null;
    user_created_at: string;
    user_updated_at: string;
  }

  const query = `
    SELECT 
      s.id AS session_id,
      s.user_id,
      s.token_hash,
      s.expires_at,
      s.created_at AS session_created_at,
      u.email AS user_email,
      u.name AS user_name,
      u.avatar_url AS user_avatar_url,
      u.google_sub AS user_google_sub,
      u.created_at AS user_created_at,
      u.updated_at AS user_updated_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `;

  const row = await db.prepare(query).bind(tokenHash, now).first<JoinedResult>();

  if (!row) return null;

  return {
    session: {
      id: row.session_id,
      user_id: row.user_id,
      token_hash: row.token_hash,
      expires_at: row.expires_at,
      created_at: row.session_created_at,
    },
    user: {
      id: row.user_id,
      email: row.user_email,
      name: row.user_name,
      avatar_url: row.user_avatar_url,
      google_sub: row.user_google_sub,
      created_at: row.user_created_at,
      updated_at: row.user_updated_at,
    },
  };
}

export async function deleteSessionByToken(db: D1Database, rawToken: string): Promise<boolean> {
  const tokenHash = await hashSessionToken(rawToken);
  const result = await db
    .prepare("DELETE FROM sessions WHERE token_hash = ?")
    .bind(tokenHash)
    .run();
  return result.success;
}

export async function deleteExpiredSessions(db: D1Database): Promise<number> {
  const now = new Date().toISOString();
  const result = await db
    .prepare("DELETE FROM sessions WHERE expires_at < ?")
    .bind(now)
    .run();
  return result.meta.changes || 0;
}
