import { verifyEmail } from "../verification/verifier";
import { VerificationResult } from "../verification/types";
import { updateBulkJobProgress } from "../db/jobs";
import { saveVerification } from "../db/verifications";
import { CacheService } from "../cache/cache";

export async function processBulkVerification(
  db: D1Database,
  jobId: string,
  userId: string,
  emails: string[],
  cache?: CacheService,
  concurrency = 5
): Promise<{ total: number; processed: number; successful: number; failed: number; results: VerificationResult[] }> {
  const results: VerificationResult[] = [];
  let processed = 0;
  let successful = 0;
  let failed = 0;

  await updateBulkJobProgress(db, jobId, 0, 0, 0, "processing");

  // Process in chunks to prevent subrequest storms
  for (let i = 0; i < emails.length; i += concurrency) {
    const chunk = emails.slice(i, i + concurrency);

    const chunkResults = await Promise.all(
      chunk.map(async (email) => {
        try {
          const res = await verifyEmail(email, cache);
          await saveVerification(db, res, userId);
          return { res, success: true };
        } catch {
          return { res: null, success: false };
        }
      })
    );

    for (const item of chunkResults) {
      processed++;
      if (item.success && item.res) {
        successful++;
        results.push(item.res);
      } else {
        failed++;
      }
    }

    // Update progress in DB
    await updateBulkJobProgress(db, jobId, processed, successful, failed, "processing");
  }

  await updateBulkJobProgress(db, jobId, processed, successful, failed, "completed");

  return {
    total: emails.length,
    processed,
    successful,
    failed,
    results,
  };
}
