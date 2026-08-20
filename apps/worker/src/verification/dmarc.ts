import { DMARCCheck } from "./types";
import { queryDNS } from "./dns";
import { CacheService } from "../cache/cache";

export async function checkDMARC(domain: string, cache?: CacheService): Promise<DMARCCheck> {
  const cacheKey = `dmarc:${domain}`;
  if (cache) {
    const cached = await cache.get<DMARCCheck>(cacheKey);
    if (cached) return cached;
  }

  const dmarcHost = `_dmarc.${domain}`;
  const txtRecord = await queryDNS(dmarcHost, "TXT");

  let result: DMARCCheck = "UNKNOWN";

  if (!txtRecord) {
    result = "UNKNOWN";
  } else if (txtRecord.Status === 0 && txtRecord.Answer && txtRecord.Answer.length > 0) {
    const dmarcEntries = txtRecord.Answer.filter((ans) => {
      const cleaned = ans.data.replace(/"/g, "").trim();
      return cleaned.startsWith("v=DMARC1") || cleaned.startsWith("v=dmarc1");
    });

    if (dmarcEntries.length === 1) {
      result = "DMARC_PRESENT";
    } else if (dmarcEntries.length > 1) {
      result = "DMARC_INVALID";
    } else {
      result = "DMARC_MISSING";
    }
  } else if (txtRecord.Status === 3 || (txtRecord.Status === 0 && (!txtRecord.Answer || txtRecord.Answer.length === 0))) {
    result = "DMARC_MISSING";
  }

  if (cache && result !== "UNKNOWN") {
    await cache.set(cacheKey, result, 86400);
  }

  return result;
}
