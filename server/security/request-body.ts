import "server-only";
import { ArenaError } from "@/server/arena/db";

/** Bound actual streamed bytes, including requests without Content-Length. */
export async function boundedBody(request: Request, maximum: number): Promise<Buffer> {
  const declared = request.headers.get("content-length");
  if (declared !== null && (!/^\d+$/.test(declared) || !Number.isSafeInteger(Number(declared)))) {
    throw new ArenaError(400, "ขนาดข้อมูลคำขอไม่ถูกต้อง");
  }
  if (declared !== null && Number(declared) > maximum) throw new ArenaError(413, "ข้อมูลมีขนาดใหญ่เกินไป");
  const reader = request.body?.getReader();
  if (!reader) throw new ArenaError(400, "ไม่พบข้อมูลคำขอ");
  // One bounded allocation also avoids millions of tiny chunk objects consuming memory.
  const bytes = Buffer.allocUnsafe(maximum);
  let length = 0;
  const deadline = Date.now() + 15_000;
  try {
    while (true) {
      if (Date.now() >= deadline) throw new ArenaError(408, "ส่งข้อมูลนานเกินไป กรุณาลองใหม่");
      let timer: ReturnType<typeof setTimeout> | undefined;
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new ArenaError(408, "ส่งข้อมูลนานเกินไป กรุณาลองใหม่")), Math.max(0, deadline - Date.now()));
      });
      const next = await Promise.race([reader.read(), timeout]).finally(() => clearTimeout(timer));
      if (next.done) break;
      if (length + next.value.byteLength > maximum) throw new ArenaError(413, "ข้อมูลมีขนาดใหญ่เกินไป");
      bytes.set(next.value, length);
      length += next.value.byteLength;
    }
    return bytes.subarray(0, length);
  } catch (error) {
    void reader.cancel().catch(() => {});
    if (error instanceof ArenaError) throw error;
    throw new ArenaError(400, "อ่านข้อมูลคำขอไม่สำเร็จ กรุณาลองใหม่");
  } finally {
    reader.releaseLock();
  }
}
