export interface User {
  id: string;
  google_sub: string | null;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function findUserById(db: D1Database, id: string): Promise<User | null> {
  const result = await db
    .prepare("SELECT * FROM users WHERE id = ?")
    .bind(id)
    .first<User>();
  return result || null;
}

export async function findUserByGoogleSub(db: D1Database, googleSub: string): Promise<User | null> {
  const result = await db
    .prepare("SELECT * FROM users WHERE google_sub = ?")
    .bind(googleSub)
    .first<User>();
  return result || null;
}

export async function findUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const result = await db
    .prepare("SELECT * FROM users WHERE email = ?")
    .bind(email.toLowerCase())
    .first<User>();
  return result || null;
}

export async function createOrUpdateGoogleUser(
  db: D1Database,
  userData: { googleSub: string; email: string; name?: string; avatarUrl?: string }
): Promise<User> {
  const now = new Date().toISOString();
  const existing = await findUserByGoogleSub(db, userData.googleSub);

  if (existing) {
    await db
      .prepare(
        "UPDATE users SET email = ?, name = ?, avatar_url = ?, updated_at = ? WHERE id = ?"
      )
      .bind(
        userData.email.toLowerCase(),
        userData.name || null,
        userData.avatarUrl || null,
        now,
        existing.id
      )
      .run();

    return {
      ...existing,
      email: userData.email.toLowerCase(),
      name: userData.name || null,
      avatar_url: userData.avatarUrl || null,
      updated_at: now,
    };
  }

  // Check if a user with this email exists without google_sub
  const existingByEmail = await findUserByEmail(db, userData.email);
  if (existingByEmail) {
    await db
      .prepare(
        "UPDATE users SET google_sub = ?, name = ?, avatar_url = ?, updated_at = ? WHERE id = ?"
      )
      .bind(
        userData.googleSub,
        userData.name || existingByEmail.name,
        userData.avatarUrl || existingByEmail.avatar_url,
        now,
        existingByEmail.id
      )
      .run();

    return {
      ...existingByEmail,
      google_sub: userData.googleSub,
      updated_at: now,
    };
  }

  const newId = `usr_${crypto.randomUUID()}`;
  await db
    .prepare(
      "INSERT INTO users (id, google_sub, email, name, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      newId,
      userData.googleSub,
      userData.email.toLowerCase(),
      userData.name || null,
      userData.avatarUrl || null,
      now,
      now
    )
    .run();

  return {
    id: newId,
    google_sub: userData.googleSub,
    email: userData.email.toLowerCase(),
    name: userData.name || null,
    avatar_url: userData.avatarUrl || null,
    created_at: now,
    updated_at: now,
  };
}

export async function deleteUser(db: D1Database, userId: string): Promise<boolean> {
  const result = await db
    .prepare("DELETE FROM users WHERE id = ?")
    .bind(userId)
    .run();
  return result.success;
}

export async function listAllUsers(
  db: D1Database,
  limit = 50,
  offset = 0
): Promise<User[]> {
  const { results } = await db
    .prepare("SELECT id, google_sub, email, name, avatar_url, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?")
    .bind(limit, offset)
    .all<User>();
  return results || [];
}

export async function countTotalUsers(db: D1Database): Promise<number> {
  const result = await db
    .prepare("SELECT COUNT(*) as count FROM users")
    .first<{ count: number }>();
  return result?.count || 0;
}

