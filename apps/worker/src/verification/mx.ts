import { MXCheck } from "./types";
import { queryDNS } from "./dns";
import { CacheService } from "../cache/cache";

export async function checkMX(domain: string, cache?: CacheService): Promise<MXCheck> {
  const cacheKey = `mx:${domain}`;
  if (cache) {
    const cached = await cache.get<MXCheck>(cacheKey);
    if (cached) return cached;
  }

  const mxRecord = await queryDNS(domain, "MX");

  let result: MXCheck = "UNKNOWN";

  if (!mxRecord) {
    result = "UNKNOWN";
  } else if (mxRecord.Status === 0 && mxRecord.Answer && mxRecord.Answer.length > 0) {
    // Check for Null MX (RFC 7505: priority 0 and target ".")
    const isNullMx = mxRecord.Answer.some((ans) => {
      const parts = ans.data.trim().split(/\s+/);
      const target = parts[1] || parts[0];
      return target === "." || target === "0 .";
    });

    result = isNullMx ? "NO_MX" : "MX_FOUND";
  } else if (mxRecord.Status === 3 || (mxRecord.Status === 0 && (!mxRecord.Answer || mxRecord.Answer.length === 0))) {
    // If no MX, check fallback to A record (RFC 5321 implicit MX)
    const aRecord = await queryDNS(domain, "A");
    if (aRecord && aRecord.Status === 0 && (aRecord.Answer?.length || 0) > 0) {
      result = "MX_FOUND";
    } else {
      result = "NO_MX";
    }
  }

  if (cache && result !== "UNKNOWN") {
    await cache.set(cacheKey, result, 86400); // 24 hours TTL
  }

  return result;
}
