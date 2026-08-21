export interface BulkJob {
  id: string;
  user_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  total: number;
  processed: number;
  successful: number;
  failed: number;
  created_at: string;
  completed_at: string | null;
}

export async function createBulkJob(
  db: D1Database,
  userId: string,
  total: number
): Promise<BulkJob> {
  const id = `job_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO bulk_jobs 
       (id, user_id, status, total, processed, successful, failed, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, userId, "pending", total, 0, 0, 0, now)
    .run();

  return {
    id,
    user_id: userId,
    status: "pending",
    total,
    processed: 0,
    successful: 0,
    failed: 0,
    created_at: now,
    completed_at: null,
  };
}

export async function updateBulkJobProgress(
  db: D1Database,
  jobId: string,
  processed: number,
  successful: number,
  failed: number,
  status: "processing" | "completed" | "failed"
): Promise<void> {
  const completedAt = status === "completed" || status === "failed" ? new Date().toISOString() : null;

  await db
    .prepare(
      `UPDATE bulk_jobs 
       SET processed = ?, successful = ?, failed = ?, status = ?, completed_at = ? 
       WHERE id = ?`
    )
    .bind(processed, successful, failed, status, completedAt, jobId)
    .run();
}

export async function getBulkJobById(
  db: D1Database,
  jobId: string,
  userId: string
): Promise<BulkJob | null> {
  const job = await db
    .prepare("SELECT * FROM bulk_jobs WHERE id = ? AND user_id = ?")
    .bind(jobId, userId)
    .first<BulkJob>();
  return job || null;
}

export async function getUserBulkJobs(
  db: D1Database,
  userId: string,
  limit = 20
): Promise<BulkJob[]> {
  const { results } = await db
    .prepare("SELECT * FROM bulk_jobs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?")
    .bind(userId, limit)
    .all<BulkJob>();
  return results || [];
}

export async function deleteOldBulkJobs(db: D1Database, retentionDays = 5): Promise<number> {
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
  const result = await db
    .prepare("DELETE FROM bulk_jobs WHERE created_at < ?")
    .bind(cutoffDate)
    .run();
  return result.meta.changes || 0;
}

export async function countTotalBulkJobs(db: D1Database): Promise<number> {
  const result = await db
    .prepare("SELECT COUNT(*) as count FROM bulk_jobs")
    .first<{ count: number }>();
  return result?.count || 0;
}

