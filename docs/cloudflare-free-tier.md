# ☁️ Cloudflare Zero-Cost Free Tier Architecture

This document explains how MailVerify runs 100% free of charge on Cloudflare while delivering production-grade performance.

---

## 1. Cloudflare Free Limits Breakdown

| Product | Free Tier Quota | How MailVerify Optimizes Within Quota |
| :--- | :--- | :--- |
| **Cloudflare Workers** | 100,000 requests / day<br>10ms CPU time per request | Asynchronous DNS-over-HTTPS resolution completes under 5-10ms CPU time. |
| **Cloudflare D1** | 5 Million read rows / day<br>100,000 write rows / day<br>500MB storage | Indexed lookups, parameterized queries, and automatic 5-day retention purging keep storage minimal. |
| **Cloudflare KV** | 100,000 read operations / day<br>1,000 write operations / day<br>1 GB storage | Caches domain MX, SPF, DMARC, and disposable status with 24-hour TTL. |
| **Cloudflare Cron Triggers** | Free | Scheduled daily at midnight (`0 0 * * *`) to purge expired verification logs older than 5 days. |
| **Cloudflare Pages / CDN** | Unlimited bandwidth<br>Unlimited requests<br>Global Edge CDN | Static assets for React Vite frontend with automatic global CDN caching and compression. |

---

## 2. Preventing Unintended Billing & Zero-Cost Guarantees

1. **No Paid Add-ons**: Does not rely on paid background Queues, raw TCP sockets, or Vector databases.
2. **DNS-over-HTTPS (DoH)**: All DNS lookups (MX, SPF, DMARC, A records) are performed via Cloudflare's public `https://cloudflare-dns.com/dns-query` endpoint, which is free and high-speed.
3. **Internal Disposable List**: Disposable domain lookups use a built-in static set with KV cache fallback, avoiding expensive external paid APIs.
4. **Graceful Fallbacks**: If KV cache hits a limit, the system falls back smoothly to direct DNS queries without crashing.
5. **Admin Access via Environment**: Admin authentication relies purely on email matching against `ADMIN_EMAILS`, requiring no paid identity services.
