import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { trustedClient } from "@/server/online/supabase";

const sampled = new Map<string, number>();
let windowStart = 0, windowCount = 0;
const clean = (value: string | null, max: number) => (value || "").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max);
function geo(value: string | null) {
  try { return clean(decodeURIComponent(value || ""), 100); } catch { return ""; }
}

/** Only Vercel-provided network metadata; never read credentials, query strings, or request bodies. */
export function adminSecurityDetails(request: Request, status: number) {
  const hosted = process.env.VERCEL === "1";
  const candidate = hosted ? request.headers.get("x-vercel-forwarded-for")?.trim() : "";
  const path = new URL(request.url).pathname.slice(0, 200);
  return {
    version: 1, status, method: request.method, path,
    kind: status === 401 ? (path.endsWith("/login") ? "login-failed" : "authentication-required") : status === 429 ? "rate-limited" : "request-blocked",
    ip: candidate && isIP(candidate) ? candidate : null,
    country: hosted ? clean(request.headers.get("x-vercel-ip-country"), 8) : "",
    region: hosted ? geo(request.headers.get("x-vercel-ip-country-region")) : "",
    city: hosted ? geo(request.headers.get("x-vercel-ip-city")) : "",
    browser: clean(request.headers.get("user-agent"), 240),
    requestId: hosted ? clean(request.headers.get("x-vercel-id"), 160) : "",
  };
}

export async function recordAdminSecurityEvent(request: Request, status: number) {
  if (process.env.VERCEL !== "1" && process.env.ARENA_BACKEND !== "supabase") return;
  if (![401, 403, 413, 414, 429].includes(status)) return;
  const now = Date.now(), details = adminSecurityDetails(request, status);
  // Supplemental, bounded sampling prevents a flood from turning into unbounded audit writes.
  if (now - windowStart >= 60_000) { windowStart = now; windowCount = 0; }
  for (const [key, until] of sampled) if (until <= now) sampled.delete(key);
  const key = createHash("sha256").update(`${details.ip || "unknown"}:${status}:${details.kind}`).digest("hex");
  if (sampled.has(key) || windowCount >= 120 || sampled.size >= 1024) return;
  sampled.set(key, now + 60_000); windowCount++;
  try {
    const { error } = await trustedClient().from("etc_admin_audit").insert({ actor: "security-monitor", action: "security-admin-denied", target: details.path, reason: JSON.stringify(details) }).abortSignal(AbortSignal.timeout(3000));
    if (error) console.error("Admin security event could not be persisted", error.code);
  } catch { console.error("Admin security event could not be persisted"); }
}

/** Caller must validate the main admin session before reading this private audit stream. */
export async function adminSecurityReport() {
  const since = new Date(Date.now() - 7 * 86400_000).toISOString();
  const { data, error } = await trustedClient().from("etc_admin_audit").select("id,created,reason").eq("action", "security-admin-denied").gte("created", since).order("created", { ascending: false }).limit(100);
  if (error) throw new Error("ADMIN_SECURITY_AUDIT_UNAVAILABLE");
  const events = (data || []).flatMap((row) => {
    try {
      const value = JSON.parse(row.reason) as ReturnType<typeof adminSecurityDetails>;
      if (value.version !== 1) return [];
      return [{ id: row.id, created: row.created, ...value }];
    } catch { return []; }
  });
  return { available: true, events, since, checkedAt: new Date().toISOString(), sampled: true };
}
