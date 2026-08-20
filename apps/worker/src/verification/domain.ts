import { DomainCheck } from "./types";
import { queryDNS } from "./dns";
import { CacheService } from "../cache/cache";

export async function checkDomain(domain: string, cache?: CacheService): Promise<DomainCheck> {
  const cacheKey = `dns:${domain}`;
  if (cache) {
    const cached = await cache.get<DomainCheck>(cacheKey);
    if (cached) return cached;
  }

  // Check A or AAAA records or MX records for domain existence
  const [aRecord, mxRecord] = await Promise.all([
    queryDNS(domain, "A"),
    queryDNS(domain, "MX"),
  ]);

  let result: DomainCheck = "UNKNOWN";

  if (!aRecord && !mxRecord) {
    result = "UNKNOWN";
  } else if (
    (aRecord && aRecord.Status === 0 && (aRecord.Answer?.length || 0) > 0) ||
    (mxRecord && mxRecord.Status === 0 && (mxRecord.Answer?.length || 0) > 0)
  ) {
    result = "DOMAIN_EXISTS";
  } else if (aRecord?.Status === 3 && mxRecord?.Status === 3) {
    // 3 is NXDOMAIN
    result = "DOMAIN_NOT_FOUND";
  } else {
    // If not found in A, check AAAA
    const aaaaRecord = await queryDNS(domain, "AAAA");
    if (aaaaRecord && aaaaRecord.Status === 0 && (aaaaRecord.Answer?.length || 0) > 0) {
      result = "DOMAIN_EXISTS";
    } else if (aaaaRecord?.Status === 3 && aRecord?.Status === 3) {
      result = "DOMAIN_NOT_FOUND";
    }
  }

  if (cache && result !== "UNKNOWN") {
    await cache.set(cacheKey, result, 86400); // 24hr TTL
  }

  return result;
}
