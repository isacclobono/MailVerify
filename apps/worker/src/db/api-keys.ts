import { User } from "./users";
import { hashSessionToken } from "./sessions";

export interface ApiKeyRecord {
  id: string;
  user_id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  is_active: number;
}

export const FREE_TIER_MONTHLY_LIMIT = 200;

export function getCurrentMonthYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function generateRawApiKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const randomHex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `mv_live_${randomHex}`;
}

export async function createApiKey(
  db: D1Database,
  userId: string,
  name = "Default API Key"
): Promise<{ keyId: string; rawKey: string; keyPrefix: string; name: string; createdAt: string }> {
  const rawKey = generateRawApiKey();
  const keyHash = await hashSessionToken(rawKey);
  const keyPrefix = `${rawKey.substring(0, 15)}...${rawKey.substring(rawKey.length - 4)}`;
  const keyId = `key_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  await db
    .prepare(
      "INSERT INTO api_keys (id, user_id, key_hash, key_prefix, name, created_at, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)"
    )
    .bind(keyId, userId, keyHash, keyPrefix, name, now)
    .run();

  return {
    keyId,
    rawKey,
    keyPrefix,
    name,
    createdAt: now,
  };
}

export async function listApiKeysByUser(
  db: D1Database,
  userId: string
): Promise<Array<Omit<ApiKeyRecord, "key_hash">>> {
  const results = await db
    .prepare(
      "SELECT id, user_id, key_prefix, name, created_at, last_used_at, is_active FROM api_keys WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC"
    )
    .bind(userId)
    .all<Omit<ApiKeyRecord, "key_hash">>();

  return results.results || [];
}

export async function deleteApiKey(
  db: D1Database,
  keyId: string,
  userId: string
): Promise<boolean> {
  const res = await db
    .prepare("DELETE FROM api_keys WHERE id = ? AND user_id = ?")
    .bind(keyId, userId)
    .run();

  return (res.meta?.changes ?? 0) > 0;
}

export async function findUserByApiKey(
  db: D1Database,
  rawKey: string
): Promise<{ user: User; apiKey: ApiKeyRecord } | null> {
  const keyHash = await hashSessionToken(rawKey);
  const now = new Date().toISOString();

  const query = `
    SELECT 
      k.id as k_id, k.user_id as k_user_id, k.key_hash, k.key_prefix, k.name as k_name, k.created_at as k_created_at, k.last_used_at, k.is_active,
      u.id as u_id, u.google_sub, u.email, u.name as u_name, u.avatar_url, u.created_at as u_created_at, u.updated_at as u_updated_at
    FROM api_keys k
    JOIN users u ON k.user_id = u.id
    WHERE k.key_hash = ? AND k.is_active = 1
    LIMIT 1
  `;

  interface Row {
    k_id: string;
    k_user_id: string;
    key_hash: string;
    key_prefix: string;
    k_name: string;
    k_created_at: string;
    last_used_at: string | null;
    is_active: number;
    u_id: string;
    google_sub: string | null;
    email: string;
    u_name: string | null;
    avatar_url: string | null;
    u_created_at: string;
    u_updated_at: string;
  }

  const row = await db.prepare(query).bind(keyHash).first<Row>();
  if (!row) return null;

  // Update last_used_at timestamp asynchronously
  db.prepare("UPDATE api_keys SET last_used_at = ? WHERE id = ?")
    .bind(now, row.k_id)
    .run()
    .catch(() => {});

  return {
    user: {
      id: row.u_id,
      google_sub: row.google_sub,
      email: row.email,
      name: row.u_name,
      avatar_url: row.avatar_url,
      created_at: row.u_created_at,
      updated_at: row.u_updated_at,
    },
    apiKey: {
      id: row.k_id,
      user_id: row.k_user_id,
      key_hash: row.key_hash,
      key_prefix: row.key_prefix,
      name: row.k_name,
      created_at: row.k_created_at,
      last_used_at: now,
      is_active: row.is_active,
    },
  };
}

export async function getMonthlyUsage(
  db: D1Database,
  userId: string
): Promise<{ monthYear: string; callCount: number; limit: number; remaining: number }> {
  const monthYear = getCurrentMonthYear();
  const row = await db
    .prepare("SELECT call_count FROM api_usage WHERE user_id = ? AND month_year = ?")
    .bind(userId, monthYear)
    .first<{ call_count: number }>();

  const callCount = row ? row.call_count : 0;
  const remaining = Math.max(0, FREE_TIER_MONTHLY_LIMIT - callCount);

  return {
    monthYear,
    callCount,
    limit: FREE_TIER_MONTHLY_LIMIT,
    remaining,
  };
}

export async function incrementMonthlyUsage(
  db: D1Database,
  userId: string,
  count = 1
): Promise<{ allowed: boolean; callCount: number; limit: number; remaining: number }> {
  const monthYear = getCurrentMonthYear();
  const now = new Date().toISOString();
  const usageId = `usg_${crypto.randomUUID()}`;

  // Upsert usage record
  await db
    .prepare(`
      INSERT INTO api_usage (id, user_id, month_year, call_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, month_year) DO UPDATE SET
        call_count = call_count + ?,
        updated_at = ?
    `)
    .bind(usageId, userId, monthYear, count, now, now, count, now)
    .run();

  const usage = await getMonthlyUsage(db, userId);

  return {
    allowed: usage.callCount <= FREE_TIER_MONTHLY_LIMIT,
    callCount: usage.callCount,
    limit: FREE_TIER_MONTHLY_LIMIT,
    remaining: usage.remaining,
  };
}
