import { Hono } from "hono";
import { AppContext } from "./env";
import { normalizeEmail } from "./verification/normalize";
import { checkSyntax } from "./verification/syntax";
import { checkDomain } from "./verification/domain";
import { checkMX } from "./verification/mx";
import { checkSPF } from "./verification/spf";
import { checkDMARC } from "./verification/dmarc";
import { checkDisposable } from "./verification/disposable";
import { checkRoleAccount } from "./verification/role";
import { isFreeEmailProvider } from "./verification/free-providers";
import { detectTypo } from "./verification/typos";
import { queryDNS } from "./verification/dns";
import { CacheService } from "./cache/cache";

export const checkRoutes = new Hono<AppContext>();

// Helper to extract email or domain from query or body
async function extractTarget(c: any): Promise<{ email?: string; domain?: string }> {
  const queryEmail = c.req.query("email");
  const queryDomain = c.req.query("domain");

  if (queryEmail || queryDomain) {
    return { email: queryEmail, domain: queryDomain };
  }

  if (c.req.method === "POST") {
    try {
      const body = await c.req.json();
      return {
        email: body.email || body.target,
        domain: body.domain || body.target,
      };
    } catch {
      // Ignore JSON parse error
    }
  }

  return {};
}

// 1. Syntax Check Endpoint
checkRoutes.all("/syntax", async (c) => {
  const { email } = await extractTarget(c);
  if (!email) {
    return c.json({ success: false, error: { code: "MISSING_PARAM", message: "Query parameter ?email= or JSON body { email } is required." } }, 400);
  }

  const { normalized, localPart, domain, isValidFormat } = normalizeEmail(email);
  const syntax = isValidFormat ? checkSyntax(normalized) : "FAIL";

  return c.json({
    success: true,
    data: {
      email,
      normalized_email: normalized,
      local_part: localPart,
      domain,
      syntax_status: syntax,
      is_valid_rfc: syntax === "PASS",
      length: {
        total: email.length,
        local: localPart.length,
        domain: domain.length,
      },
    },
  });
});

// 2. DNS & Host Resolution Endpoint
checkRoutes.all("/dns", async (c) => {
  const { email, domain: directDomain } = await extractTarget(c);
  let domain = directDomain;
  if (!domain && email) {
    domain = normalizeEmail(email).domain;
  }

  if (!domain) {
    return c.json({ success: false, error: { code: "MISSING_PARAM", message: "Parameter ?domain= or ?email= is required." } }, 400);
  }

  const cache = new CacheService(c.env.CACHE);
  const [domainStatus, aRecords, aaaaRecords] = await Promise.all([
    checkDomain(domain, cache),
    queryDNS(domain, "A", cache),
    queryDNS(domain, "AAAA", cache),
  ]);

  return c.json({
    success: true,
    data: {
      domain,
      status: domainStatus,
      resolves: domainStatus === "DOMAIN_EXISTS",
      ipv4_addresses: aRecords.map((r) => r.data),
      ipv6_addresses: aaaaRecords.map((r) => r.data),
    },
  });
});

// 3. MX Routing & Mail Exchanger Endpoint
checkRoutes.all("/mx", async (c) => {
  const { email, domain: directDomain } = await extractTarget(c);
  let domain = directDomain;
  if (!domain && email) {
    domain = normalizeEmail(email).domain;
  }

  if (!domain) {
    return c.json({ success: false, error: { code: "MISSING_PARAM", message: "Parameter ?domain= or ?email= is required." } }, 400);
  }

  const cache = new CacheService(c.env.CACHE);
  const [mxStatus, rawMx] = await Promise.all([
    checkMX(domain, cache),
    queryDNS(domain, "MX", cache),
  ]);

  const sortedMx = rawMx.map((r) => {
    const parts = r.data.split(" ");
    return {
      priority: parseInt(parts[0], 10) || 0,
      host: (parts[1] || r.data).replace(/\.$/, ""),
    };
  }).sort((a, b) => a.priority - b.priority);

  return c.json({
    success: true,
    data: {
      domain,
      status: mxStatus,
      has_mx_servers: mxStatus === "MX_FOUND",
      primary_mx: sortedMx.length > 0 ? sortedMx[0].host : null,
      records: sortedMx,
    },
  });
});

// 4. SPF Record Endpoint
checkRoutes.all("/spf", async (c) => {
  const { email, domain: directDomain } = await extractTarget(c);
  let domain = directDomain;
  if (!domain && email) {
    domain = normalizeEmail(email).domain;
  }

  if (!domain) {
    return c.json({ success: false, error: { code: "MISSING_PARAM", message: "Parameter ?domain= or ?email= is required." } }, 400);
  }

  const cache = new CacheService(c.env.CACHE);
  const [spfStatus, txtRecords] = await Promise.all([
    checkSPF(domain, cache),
    queryDNS(domain, "TXT", cache),
  ]);

  const rawSpf = txtRecords.find((r) => r.data.toLowerCase().includes("v=spf1"))?.data || null;

  return c.json({
    success: true,
    data: {
      domain,
      status: spfStatus,
      has_spf: spfStatus === "SPF_PRESENT",
      raw_record: rawSpf,
    },
  });
});

// 5. DMARC Policy Endpoint
checkRoutes.all("/dmarc", async (c) => {
  const { email, domain: directDomain } = await extractTarget(c);
  let domain = directDomain;
  if (!domain && email) {
    domain = normalizeEmail(email).domain;
  }

  if (!domain) {
    return c.json({ success: false, error: { code: "MISSING_PARAM", message: "Parameter ?domain= or ?email= is required." } }, 400);
  }

  const cache = new CacheService(c.env.CACHE);
  const [dmarcStatus, txtRecords] = await Promise.all([
    checkDMARC(domain, cache),
    queryDNS(`_dmarc.${domain}`, "TXT", cache),
  ]);

  const rawDmarc = txtRecords.find((r) => r.data.toLowerCase().includes("v=dmarc1"))?.data || null;
  const policyMatch = rawDmarc ? rawDmarc.match(/p=([a-zA-Z]+)/i) : null;
  const policy = policyMatch ? policyMatch[1].toLowerCase() : null;

  return c.json({
    success: true,
    data: {
      domain,
      status: dmarcStatus,
      has_dmarc: dmarcStatus === "DMARC_PRESENT",
      enforced_policy: policy,
      raw_record: rawDmarc,
    },
  });
});

// 6. Security Combined (SPF + DMARC)
checkRoutes.all("/security", async (c) => {
  const { email, domain: directDomain } = await extractTarget(c);
  let domain = directDomain;
  if (!domain && email) {
    domain = normalizeEmail(email).domain;
  }

  if (!domain) {
    return c.json({ success: false, error: { code: "MISSING_PARAM", message: "Parameter ?domain= or ?email= is required." } }, 400);
  }

  const cache = new CacheService(c.env.CACHE);
  const [spf, dmarc] = await Promise.all([
    checkSPF(domain, cache),
    checkDMARC(domain, cache),
  ]);

  return c.json({
    success: true,
    data: {
      domain,
      spf_status: spf,
      dmarc_status: dmarc,
      is_secure: spf === "SPF_PRESENT" && dmarc === "DMARC_PRESENT",
    },
  });
});

// 7. Disposable & Burner Detection Endpoint
checkRoutes.all("/disposable", async (c) => {
  const { email, domain: directDomain } = await extractTarget(c);
  let domain = directDomain;
  if (!domain && email) {
    domain = normalizeEmail(email).domain;
  }

  if (!domain) {
    return c.json({ success: false, error: { code: "MISSING_PARAM", message: "Parameter ?domain= or ?email= is required." } }, 400);
  }

  const cache = new CacheService(c.env.CACHE);
  const status = await checkDisposable(domain, cache);

  return c.json({
    success: true,
    data: {
      domain,
      status,
      is_disposable: status === "DISPOSABLE",
    },
  });
});

// 8. Role & Consumer Provider Classification Endpoint
checkRoutes.all("/provider", async (c) => {
  const { email, domain: directDomain } = await extractTarget(c);
  let domain = directDomain;
  let localPart = "";

  if (email) {
    const norm = normalizeEmail(email);
    domain = norm.domain;
    localPart = norm.localPart;
  }

  if (!domain) {
    return c.json({ success: false, error: { code: "MISSING_PARAM", message: "Parameter ?email= or ?domain= is required." } }, 400);
  }

  const isFree = isFreeEmailProvider(domain);
  const roleCheck = localPart ? checkRoleAccount(localPart) : "UNKNOWN";

  return c.json({
    success: true,
    data: {
      domain,
      local_part: localPart || null,
      provider_class: isFree ? "FREE_CONSUMER" : "BUSINESS_CORPORATE",
      is_free_mailbox: isFree,
      is_role_account: roleCheck === "ROLE_ACCOUNT",
      role_status: roleCheck,
    },
  });
});

// 9. Typo-Squatting & Suggestion Endpoint
checkRoutes.all("/typo", async (c) => {
  const { email, domain: directDomain } = await extractTarget(c);
  let domain = directDomain || "";
  let localPart = "";

  if (email) {
    const norm = normalizeEmail(email);
    domain = norm.domain;
    localPart = norm.localPart;
  }

  if (!domain) {
    return c.json({ success: false, error: { code: "MISSING_PARAM", message: "Parameter ?email= or ?domain= is required." } }, 400);
  }

  const typoInfo = detectTypo(domain, localPart);

  return c.json({
    success: true,
    data: {
      original_domain: domain,
      has_typo: typoInfo.hasTypo,
      suggested_domain: typoInfo.suggestedDomain,
      suggested_email: typoInfo.suggestedEmail,
    },
  });
});
