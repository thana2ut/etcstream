import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";

type Bucket = { count: number; until: number };
// Supplemental per-process protection. Persistent identity/login budgets remain in the database.
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 4096;

function reply(status: number, message: string, retry?: number) {
  return Response.json({ error: message }, { status, headers: {
    "Cache-Control": "private, no-store",
    "Cross-Origin-Resource-Policy": "same-origin",
    ...(retry ? { "Retry-After": String(retry) } : {}),
  } });
}

export function guardApiRequest(request: Request): Response | null {
  const fetchSite = request.headers.get("sec-fetch-site");
  const sameSiteOrigin = fetchSite === "same-site" && request.headers.get("origin") === new URL(request.url).origin;
  if (fetchSite === "cross-site" || (fetchSite === "same-site" && !sameSiteOrigin)) {
    return reply(403, "ไม่อนุญาตคำขอจากเว็บไซต์อื่น");
  }
  const url = new URL(request.url);
  if (url.pathname.length > 512 || url.search.length > 4096) return reply(414, "ที่อยู่คำขอยาวเกินไป");
  // Vercel overwrites this header. Do not trust arbitrary X-Forwarded-For on other hosts.
  const forwarded = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.trim() : undefined;
  const identity = forwarded && isIP(forwarded) ? forwarded : "shared";
  const sensitive = /\/(login|pin-join|owner-claim|register|recovery\/redeem)$/.test(url.pathname);
  const key = createHash("sha256").update(`${identity}:${sensitive ? "identity" : "api"}`).digest("hex");
  const now = Date.now();
  for (const [id, bucket] of buckets) if (bucket.until <= now) buckets.delete(id);
  let bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size >= MAX_BUCKETS) return reply(429, "มีคำขอจำนวนมาก กรุณารอสักครู่แล้วลองใหม่", 60);
    bucket = { count: 0, until: now + 60_000 };
    buckets.set(key, bucket);
  }
  // Shared fallback is deliberately larger for self-hosted installations behind a proxy.
  const maximum = sensitive ? (identity === "shared" ? 120 : 20) : (identity === "shared" ? 6000 : 1200);
  if (++bucket.count > maximum) return reply(429, "ทำรายการบ่อยเกินไป กรุณารอสักครู่", Math.max(1, Math.ceil((bucket.until - now) / 1000)));
  return null;
}
