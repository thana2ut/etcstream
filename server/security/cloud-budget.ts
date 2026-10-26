import "server-only";
import { ArenaError } from "@/server/arena/db";
import type { trustedClient } from "@/server/online/supabase";

/** Use the existing shared database counter; never fail open on database errors. */
export async function consumeCloudBudget(db: Pick<ReturnType<typeof trustedClient>, "rpc">, key: string, maximum: number, seconds: number) {
  const result = await db.rpc("etc_trusted_budget", { k: key, maximum, seconds });
  if (!result.error) return;
  if (/\bRATE_LIMIT\b/.test(result.error.message)) throw new ArenaError(429, "ทำรายการบ่อยเกินไป กรุณารอสักครู่", "RATE_LIMIT");
  throw new ArenaError(503, "ยังตรวจสอบข้อจำกัดความปลอดภัยไม่ได้ กรุณาลองใหม่ภายหลัง");
}
