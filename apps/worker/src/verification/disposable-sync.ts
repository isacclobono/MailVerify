import { Env } from "../env";

export interface DisposableSyncStats {
  success: boolean;
  total_domains_collected: number;
  sources_synced: number;
  duration_ms: number;
  timestamp: string;
  error?: string;
}

// Live edge sources to query during scheduled cron sync
const LIVE_EDGE_SOURCES = [
  "https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains_strict.txt",
  "https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf",
  "https://stefanpejcic.github.io/disposable-email-domains/domains.txt",
  "https://raw.githubusercontent.com/7c/fakefilter/main/txt/data.txt",
  "https://raw.githubusercontent.com/wesbos/burner-email-providers/master/emails.txt"
];

const STRICT_ALLOWLIST = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "mail.com",
  "gmx.com",
  "fastmail.com",
  "tutanota.com",
  "stripe.com",
  "apple.com",
  "microsoft.com",
  "github.com",
  "cloudflare.com",
]);

const DOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;

function cleanDomain(raw: string): string | null {
  if (!raw) return null;
  let d = raw.trim().toLowerCase();
  d = d.split("#")[0].split("//")[0].split(";")[0].trim();
  d = d.replace(/^https?:\/\//, "");
  d = d.replace(/^\*?\./, "");
  d = d.replace(/^@/, "");
  d = d.replace(/\/.*$/, "");

  if (!d || d.length < 4 || d.length > 253) return null;
  if (!DOMAIN_REGEX.test(d)) return null;
  if (STRICT_ALLOWLIST.has(d)) return null;

  return d;
}

/**
 * Executes a multi-source synchronization of disposable domains and stores active chunks in KV
 */
export async function syncDisposableDatabase(env: Env): Promise<DisposableSyncStats> {
  const startTime = Date.now();
  const collectedSet = new Set<string>();
  let successfulSources = 0;

  for (const url of LIVE_EDGE_SOURCES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        successfulSources++;
        const text = await res.text();
        const lines = text.split(/\r?\n/);
        for (const line of lines) {
          const cd = cleanDomain(line);
          if (cd) collectedSet.add(cd);
        }
      }
    } catch {
      // Continue to next source on error
    }
  }

  const allDomains = Array.from(collectedSet);

  // Store metadata and index in KV
  try {
    const meta = {
      total: allDomains.length,
      updated_at: new Date().toISOString(),
      sources_synced: successfulSources,
    };

    // Store metadata header
    await env.CACHE.put("disposable:meta", JSON.stringify(meta), { expirationTtl: 604800 }); // 7 days

    // Store quick bloom/chunk index in KV
    const chunkSample = allDomains.slice(0, 10000);
    await env.CACHE.put("disposable:online_feed_v1", JSON.stringify(chunkSample), { expirationTtl: 604800 });
  } catch (err) {
    return {
      success: false,
      total_domains_collected: allDomains.length,
      sources_synced: successfulSources,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : "KV sync failed",
    };
  }

  return {
    success: true,
    total_domains_collected: allDomains.length,
    sources_synced: successfulSources,
    duration_ms: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };
}
