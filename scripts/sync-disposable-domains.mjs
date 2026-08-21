/**
 * MailVerify - Multi-Source Disposable & Burner Domain Aggregator
 * 
 * Pipeline:
 * 1. Fetch from 10+ authoritative open-source disposable domain lists
 * 2. Parse TXT, JSON, CSV, and Conf formats
 * 3. Normalize: lowercase, trim, strip comments/subdomains
 * 4. Deduplicate across all feeds
 * 5. Strict False Positive Filtering (Allowlist protection)
 * 6. Generate optimized TypeScript lookup sets for Cloudflare Workers
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Authoritative Multi-Source Feed URLs
const SOURCES = [
  {
    name: "disposable/domains_strict.txt",
    url: "https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains_strict.txt",
    type: "txt",
  },
  {
    name: "disposable/domains.txt",
    url: "https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains.txt",
    type: "txt",
  },
  {
    name: "disposable-email-domains/blocklist.conf",
    url: "https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf",
    type: "txt",
  },
  {
    name: "Validemailchecker/domains.txt",
    url: "https://raw.githubusercontent.com/Validemailchecker/disposable-email-domains/main/data/domains.txt",
    type: "txt",
  },
  {
    name: "stefanpejcic/domains.txt",
    url: "https://stefanpejcic.github.io/disposable-email-domains/domains.txt",
    type: "txt",
  },
  {
    name: "7c/fakefilter/data.txt",
    url: "https://raw.githubusercontent.com/7c/fakefilter/main/txt/data.txt",
    type: "txt",
  },
  {
    name: "wesbos/burner-email-providers/emails.txt",
    url: "https://raw.githubusercontent.com/wesbos/burner-email-providers/master/emails.txt",
    type: "txt",
  },
  {
    name: "Propaganistas/Laravel-Disposable-Email/domains.json",
    url: "https://raw.githubusercontent.com/Propaganistas/Laravel-Disposable-Email/master/domains.json",
    type: "json",
  },
  {
    name: "disposable.github.io/domains.txt",
    url: "https://disposable.github.io/disposable-email-domains/domains.txt",
    type: "txt",
  }
];

// 2. Strict Allowlist (False-Positive Protection)
// NEVER flag major reputable corporate or consumer email services as disposable
const STRICT_ALLOWLIST = new Set([
  // Google
  "gmail.com",
  "googlemail.com",
  "google.com",
  // Microsoft
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "passport.com",
  "microsoft.com",
  "office365.com",
  // Yahoo
  "yahoo.com",
  "ymail.com",
  "rocketmail.com",
  "yahoo.co.uk",
  "yahoo.fr",
  "yahoo.de",
  "yahoo.co.jp",
  "yahoo.com.br",
  "yahoo.co.in",
  "yahoo.ca",
  // Apple
  "icloud.com",
  "me.com",
  "mac.com",
  "apple.com",
  // Proton & Privacy
  "proton.me",
  "protonmail.com",
  "protonmail.ch",
  "tutanota.com",
  "tuta.com",
  "tuta.io",
  "fastmail.com",
  "fastmail.fm",
  // Major ESPs & Telecoms
  "aol.com",
  "aim.com",
  "zoho.com",
  "zohomail.com",
  "mail.com",
  "email.com",
  "gmx.com",
  "gmx.net",
  "gmx.de",
  "yandex.com",
  "yandex.ru",
  "mail.ru",
  "rambler.ru",
  "comcast.net",
  "sbcglobal.net",
  "att.net",
  "verizon.net",
  "cox.net",
  "charter.net",
  "shaw.ca",
  "bell.net",
  "btinternet.com",
  "virginmedia.com",
  "orange.fr",
  "wanadoo.fr",
  "free.fr",
  "laposte.net",
  "t-online.de",
  "web.de",
  "libero.it",
  "virgilio.it",
  "naver.com",
  "daum.net",
  "hanmail.net",
  "qq.com",
  "163.com",
  "126.com",
  "sina.com",
  "aliyun.com",
  // Major Tech Companies
  "github.com",
  "gitlab.com",
  "stripe.com",
  "cloudflare.com",
  "amazon.com",
  "aws.amazon.com",
  "salesforce.com",
  "dropbox.com",
  "slack.com",
  "zoom.us",
  "atlassian.com",
  "zendesk.com",
  "shopify.com",
  "sk-builds.workers.dev"
]);

// Valid domain regex (RFC 1035 / RFC 1123)
const DOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;

function cleanDomain(raw) {
  if (!raw || typeof raw !== "string") return null;
  let d = raw.trim().toLowerCase();

  // Strip comments (#, //, ;)
  d = d.split("#")[0].split("//")[0].split(";")[0].trim();

  // Strip leading @, http://, https://, or *.
  d = d.replace(/^https?:\/\//, "");
  d = d.replace(/^\*?\./, "");
  d = d.replace(/^@/, "");
  d = d.replace(/\/.*$/, ""); // Strip trailing path if URL

  if (!d || d.length < 4 || d.length > 253) return null;
  if (!DOMAIN_REGEX.test(d)) return null;
  if (STRICT_ALLOWLIST.has(d)) return null;

  return d;
}

async function fetchSource(source) {
  console.log(`[+] Fetching source: ${source.name} (${source.url})...`);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(source.url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[!] Warning: ${source.name} returned status ${res.status}`);
      return [];
    }

    const text = await res.text();
    const domains = [];

    if (source.type === "json") {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const cd = cleanDomain(typeof item === "string" ? item : item?.domain || item?.name);
            if (cd) domains.push(cd);
          }
        } else if (typeof parsed === "object" && parsed !== null) {
          for (const key of Object.keys(parsed)) {
            const cd = cleanDomain(key);
            if (cd) domains.push(cd);
          }
        }
      } catch (err) {
        console.warn(`[!] JSON parse error on ${source.name}:`, err.message);
      }
    } else {
      // Plain TXT / CSV / Conf
      const lines = text.split(/\r?\n/);
      for (const line of lines) {
        const cd = cleanDomain(line);
        if (cd) domains.push(cd);
      }
    }

    console.log(`    -> Collected ${domains.length} domains from ${source.name}`);
    return domains;
  } catch (err) {
    console.warn(`[!] Failed to fetch ${source.name}:`, err.message);
    return [];
  }
}

async function main() {
  console.log("==========================================================");
  console.log(" MailVerify Multi-Source Disposable Domain Aggregator");
  console.log("==========================================================");

  const aggregatedSet = new Set();
  const sourceStats = {};

  const fetchPromises = SOURCES.map(async (source) => {
    const list = await fetchSource(source);
    sourceStats[source.name] = list.length;
    for (const d of list) {
      if (!STRICT_ALLOWLIST.has(d)) {
        aggregatedSet.add(d);
      }
    }
  });

  await Promise.all(fetchPromises);

  const sortedDomains = Array.from(aggregatedSet).sort();
  console.log("----------------------------------------------------------");
  console.log(` Total Unique Deduplicated Disposable Domains: ${sortedDomains.length.toLocaleString()}`);
  console.log("----------------------------------------------------------");

  // Output 1: Generate apps/worker/src/data/disposable-domains.ts
  const outputDir = path.resolve(__dirname, "../apps/worker/src/data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const tsContent = `/**
 * AUTO-GENERATED MULTI-SOURCE DISPOSABLE EMAIL DOMAIN DATABASE
 * Generated at: ${new Date().toISOString()}
 * Total Unique Domains: ${sortedDomains.length}
 * Sources: ${SOURCES.map(s => s.name).join(", ")}
 */

export const DISPOSABLE_DOMAIN_METADATA = {
  total: ${sortedDomains.length},
  updated_at: "${new Date().toISOString()}",
  sources_count: ${SOURCES.length},
};

// Compact compressed array for fast binary search and runtime memory sets
export const COMPILED_DISPOSABLE_DOMAINS: string[] = ${JSON.stringify(sortedDomains, null, 2)};
`;

  const outputPath = path.join(outputDir, "disposable-domains.ts");
  fs.writeFileSync(outputPath, tsContent, "utf-8");
  console.log(`[✓] Successfully compiled database to: ${outputPath}`);

  // Output 2: Save raw JSON artifact
  const jsonPath = path.join(outputDir, "disposable-domains.json");
  fs.writeFileSync(jsonPath, JSON.stringify(sortedDomains), "utf-8");
  console.log(`[✓] Exported JSON artifact to: ${jsonPath}`);
}

main().catch(console.error);
