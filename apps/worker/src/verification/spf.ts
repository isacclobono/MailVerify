import { SPFCheck } from "./types";
import { queryDNS } from "./dns";
import { CacheService } from "../cache/cache";

export async function checkSPF(domain: string, cache?: CacheService): Promise<SPFCheck> {
  const cacheKey = `spf:${domain}`;
  if (cache) {
    const cached = await cache.get<SPFCheck>(cacheKey);
    if (cached) return cached;
  }

  const txtRecord = await queryDNS(domain, "TXT");

  let result: SPFCheck = "UNKNOWN";

  if (!txtRecord) {
    result = "UNKNOWN";
  } else if (txtRecord.Status === 0 && txtRecord.Answer && txtRecord.Answer.length > 0) {
    const spfEntries = txtRecord.Answer.filter((ans) => {
      const cleaned = ans.data.replace(/"/g, "").trim();
      return cleaned.startsWith("v=spf1");
    });

    if (spfEntries.length === 1) {
      result = "SPF_PRESENT";
    } else if (spfEntries.length > 1) {
      // Multiple SPF records is invalid according to RFC 7208 section 3.2
      result = "SPF_INVALID";
    } else {
      result = "SPF_MISSING";
    }
  } else if (txtRecord.Status === 3 || (txtRecord.Status === 0 && (!txtRecord.Answer || txtRecord.Answer.length === 0))) {
    result = "SPF_MISSING";
  }

  if (cache && result !== "UNKNOWN") {
    await cache.set(cacheKey, result, 86400);
  }

  return result;
}
