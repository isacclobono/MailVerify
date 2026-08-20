export interface DoHAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

export interface DoHResponse {
  Status: number; // 0: NOERROR, 3: NXDOMAIN, etc.
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: Array<{ name: string; type: number }>;
  Answer?: DoHAnswer[];
  Authority?: DoHAnswer[];
}

const CLOUDFLARE_DOH_URL = "https://cloudflare-dns.com/dns-query";

/**
 * Queries DNS records over HTTPS using Cloudflare's public DNS JSON endpoint
 */
export async function queryDNS(domain: string, type: "A" | "AAAA" | "MX" | "TXT", timeoutMs = 3000): Promise<DoHResponse | null> {
  try {
    const url = new URL(CLOUDFLARE_DOH_URL);
    url.searchParams.set("name", domain);
    url.searchParams.set("type", type);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/dns-json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as DoHResponse;
    return data;
  } catch {
    return null;
  }
}
