# ☁️ Cloudflare Zero-Cost Free Tier Architecture

This document explains how this email verifier runs 100% free of charge on Cloudflare.

---

## 1. Cloudflare Free Limits Breakdown

| Product | Free Tier Quota | How We Optimize Within Quota |
| :--- | :--- | :--- |
| **Cloudflare Workers** | 100,000 requests / day<br>10ms CPU time per request | Our verification pipeline resolves DNS asynchronously and finishes well under 5-10ms CPU time. |
| **Cloudflare D1** | 5 Million read rows / day<br>100,000 write rows / day<br>500MB storage | Indexed lookups, parameterized queries, and automatic 5-day retention purging keep rows minimal. |
| **Cloudflare KV** | 100,000 read operations / day<br>1,000 write operations / day<br>1 GB storage | Caches domain MX, SPF, DMARC, and disposable status with 24-hour TTL. |
| **Cloudflare Cron Triggers** | Free | Scheduled daily at midnight (`0 0 * * *`) to purge verification records older than 5 days. |
| **Cloudflare Pages** | Unlimited bandwidth<br>Unlimited requests<br>1 build concurrent | Static assets for React Vite frontend with global CDN caching. |

---

## 2. Preventing Unintended Billing

1. **No Paid Add-ons**: We do not use Cloudflare Queues paid plans, Socket connections, or Vectorize.
2. **DNS-over-HTTPS (DoH)**: All DNS lookups (MX, SPF, DMARC, A records) are performed through Cloudflare's public `https://cloudflare-dns.com/dns-query` endpoint, which is completely free and unmetered.
3. **Internal Disposable List**: Disposable domain lookups use a built-in static set with KV cache fallback, avoiding expensive external paid APIs.
4. **Graceful Fallbacks**: If KV is exhausted or unavailable, the application falls back smoothly to direct DNS queries without crashing or incurring charges.
