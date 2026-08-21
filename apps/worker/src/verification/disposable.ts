import { CacheService } from "../cache/cache";

// Core high-traffic disposable & temporary email domains
const POPULAR_DISPOSABLE_DOMAINS = new Set<string>([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.biz",
  "guerrillamail.de",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "guerrillamail.info",
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "10minutemail.co.uk",
  "10minutemail.be",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.ru",
  "tempmail.net",
  "tempmailaddress.com",
  "temp-mail.io",
  "tempmail.plus",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "cool.fr.nf",
  "jetable.fr.nf",
  "nospam.ze.tc",
  "nomail.xl.cx",
  "mega.zik.dj",
  "speed.1s.fr",
  "courriel.fr.nf",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "monmail.fr.nf",
  "trashmail.com",
  "trashmail.net",
  "trashmail.org",
  "trashmail.me",
  "dispostable.com",
  "getairmail.com",
  "fakemailgenerator.com",
  "throwawaymail.com",
  "burnermail.io",
  "maildrop.cc",
  "inboxkitten.com",
  "generator.email",
  "crazymailing.com",
  "emailondeck.com",
  "mohmal.com",
  "mytemp.email",
  "getnada.com",
  "abcvg.com",
  "boximail.com",
  "clrmail.com",
  "dropmail.me",
  "fakemail.net",
  "givmail.com",
  "hidemail.de",
  "incognitomail.org",
  "jourrapide.com",
  "kuku.lu",
  "lookmail.net",
  "mailsac.com",
  "nada.ltd",
  "omniex.org",
  "pookmail.com",
  "quickinbox.com",
  "rhyta.com",
  "safetymail.info",
  "teleworm.us",
  "univmail.net",
  "vmani.com",
  "walkmail.net",
  "xoxy.net",
  "ymail.net",
  "zippymail.info",
]);

// Known disposable MX mail exchanger signatures
const DISPOSABLE_MX_PATTERNS = [
  "mailinator.com",
  "guerrillamail",
  "yopmail",
  "trashmail",
  "sharklasers",
  "dispostable",
  "inboxkitten",
  "maildrop",
  "getnada",
];

const ONLINE_DISPOSABLE_CACHE_KEY = "disposable:online_feed_v1";

/**
 * Checks if a domain or its mail exchanger is a known disposable/temporary burner provider.
 */
export async function checkDisposable(
  domain: string,
  cache?: CacheService,
  mxHostnames?: string[]
): Promise<"DISPOSABLE" | "NOT_DISPOSABLE" | "UNKNOWN"> {
  if (!domain) return "UNKNOWN";
  const d = domain.toLowerCase().trim();

  // 1. In-memory Set check (0ms instant lookup)
  if (POPULAR_DISPOSABLE_DOMAINS.has(d)) {
    return "DISPOSABLE";
  }

  // 2. Check MX hostname patterns if provided
  if (mxHostnames && mxHostnames.length > 0) {
    for (const mx of mxHostnames) {
      const lowerMx = mx.toLowerCase();
      if (DISPOSABLE_MX_PATTERNS.some((pattern) => lowerMx.includes(pattern))) {
        return "DISPOSABLE";
      }
    }
  }

  // 3. Check KV Edge cache for online synchronized feed
  if (cache) {
    try {
      const cachedStatus = await cache.get<string>(`disposable:domain:${d}`);
      if (cachedStatus === "DISPOSABLE") {
        return "DISPOSABLE";
      }

      // Check online feed lookup if present in cache
      const onlineSet = await cache.get<string[]>(ONLINE_DISPOSABLE_CACHE_KEY);
      if (onlineSet && Array.isArray(onlineSet) && onlineSet.includes(d)) {
        await cache.set(`disposable:domain:${d}`, "DISPOSABLE", 86400);
        return "DISPOSABLE";
      }
    } catch {
      // Fallback gracefully on cache read error
    }
  }

  return "NOT_DISPOSABLE";
}
