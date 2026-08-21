import { VerificationResult, Verdict } from "../verification/types";

export interface VerificationRecord {
  id: string;
  user_id: string | null;
  email: string;
  normalized_email: string;
  verdict: Verdict;
  score: number;
  result_json: string;
  created_at: string;
}

export async function saveVerification(
  db: D1Database,
  result: VerificationResult,
  userId: string | null = null
): Promise<string> {
  const id = `ver_${crypto.randomUUID()}`;
  const resultJson = JSON.stringify(result);

  await db
    .prepare(
      `INSERT INTO verifications 
       (id, user_id, email, normalized_email, verdict, score, result_json, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      userId,
      result.email,
      result.normalized_email,
      result.verdict,
      result.score,
      resultJson,
      result.created_at
    )
    .run();

  return id;
}

export async function getUserVerifications(
  db: D1Database,
  userId: string,
  limit = 50,
  offset = 0
): Promise<VerificationResult[]> {
  const query = `
    SELECT id, email, normalized_email, verdict, score, result_json, created_at
    FROM verifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  const { results } = await db
    .prepare(query)
    .bind(userId, limit, offset)
    .all<VerificationRecord>();

  if (!results) return [];

  return results.map((row) => {
    try {
      const parsed = JSON.parse(row.result_json) as VerificationResult;
      return {
        ...parsed,
        id: row.id,
        email: row.email,
        normalized_email: row.normalized_email,
        verdict: row.verdict,
        score: row.score,
        created_at: row.created_at,
      };
    } catch {
      return {
        id: row.id,
        email: row.email,
        normalized_email: row.normalized_email,
        verdict: row.verdict,
        score: row.score,
        checks: {
          syntax: "PASS",
          domain: "UNKNOWN",
          mx: "UNKNOWN",
          spf: "UNKNOWN",
          dmarc: "UNKNOWN",
          disposable: "UNKNOWN",
          role: "UNKNOWN",
          catch_all: "UNKNOWN",
          smtp: "UNKNOWN",
        },
        created_at: row.created_at,
      };
    }
  });
}

export async function deleteOldVerifications(db: D1Database, retentionDays = 5): Promise<number> {
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
  const result = await db
    .prepare("DELETE FROM verifications WHERE created_at < ?")
    .bind(cutoffDate)
    .run();
  return result.meta.changes || 0;
}

export async function countTotalVerifications(db: D1Database): Promise<number> {
  const result = await db
    .prepare("SELECT COUNT(*) as count FROM verifications")
    .first<{ count: number }>();
  return result?.count || 0;
}

export async function getVerdictBreakdown(db: D1Database): Promise<Record<string, number>> {
  const { results } = await db
    .prepare("SELECT verdict, COUNT(*) as count FROM verifications GROUP BY verdict")
    .all<{ verdict: string; count: number }>();

  const breakdown: Record<string, number> = {};
  if (results) {
    for (const row of results) {
      breakdown[row.verdict] = row.count;
    }
  }
  return breakdown;
}

export async function listRecentVerifications(
  db: D1Database,
  limit = 50,
  offset = 0
): Promise<Array<Omit<VerificationRecord, "result_json">>> {
  const { results } = await db
    .prepare(
      "SELECT id, user_id, email, normalized_email, verdict, score, created_at FROM verifications ORDER BY created_at DESC LIMIT ? OFFSET ?"
    )
    .bind(limit, offset)
    .all<Omit<VerificationRecord, "result_json">>();
  return results || [];
}

