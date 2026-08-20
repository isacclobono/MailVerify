import { DisposableCheck } from "./types";
import { CacheService } from "../cache/cache";

const CURATED_DISPOSABLE_DOMAINS = new Set<string>([
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "10minutemail.com",
  "10minutemail.net",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "trashmail.com",
  "trashmail.net",
  "dispostable.com",
  "getnada.com",
  "burnermail.io",
  "fakeinbox.com",
  "throwawaymail.com",
  "inboxkitten.com",
  "fakemailgenerator.com",
  "dropmail.me",
  "crazymailing.com",
  "nada.ltd",
  "mohmal.com",
  "emailondeck.com",
  "mytemp.email",
  "generator.email",
  "tempr.email",
  "disposablemail.com",
  "maildrop.cc",
  "harakirimail.com",
]);

export async function checkDisposable(domain: string, cache?: CacheService): Promise<DisposableCheck> {
  const normalizedDomain = domain.toLowerCase();

  // 1. Direct check against curated set
  if (CURATED_DISPOSABLE_DOMAINS.has(normalizedDomain)) {
    return "DISPOSABLE";
  }

  // 2. Check in KV if custom list is maintained
  if (cache) {
    const cached = await cache.get<string>(`disposable:${normalizedDomain}`);
    if (cached === "DISPOSABLE") {
      return "DISPOSABLE";
    }
  }

  return "NOT_DISPOSABLE";
}
