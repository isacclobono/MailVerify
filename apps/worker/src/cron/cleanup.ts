import { deleteOldVerifications } from "../db/verifications";
import { deleteExpiredSessions } from "../db/sessions";
import { deleteOldBulkJobs } from "../db/jobs";

export async function runRetentionCleanup(db: D1Database): Promise<{
  verificationsDeleted: number;
  sessionsDeleted: number;
  jobsDeleted: number;
}> {
  if (!db) {
    return { verificationsDeleted: 0, sessionsDeleted: 0, jobsDeleted: 0 };
  }

  try {
    const [verificationsDeleted, sessionsDeleted, jobsDeleted] = await Promise.all([
      deleteOldVerifications(db, 5),
      deleteExpiredSessions(db),
      deleteOldBulkJobs(db, 5),
    ]);

    console.log(
      JSON.stringify({
        event: "retention_cleanup",
        verificationsDeleted,
        sessionsDeleted,
        jobsDeleted,
        timestamp: new Date().toISOString(),
      })
    );

    return { verificationsDeleted, sessionsDeleted, jobsDeleted };
  } catch (err) {
    console.error("Error during retention cleanup cron:", err);
    return { verificationsDeleted: 0, sessionsDeleted: 0, jobsDeleted: 0 };
  }
}
