import "server-only";
import { ArenaError } from "@/server/arena/db";

/** Bound later recursive command processing, even when JSON fits the byte limit. */
export function checkJsonShape(value: unknown): void {
  const pending = [{ value, depth: 0 }];
  let nodes = 0;
  while (pending.length) {
    const current = pending.pop()!;
    if (++nodes > 10000 || current.depth > 32) throw new ArenaError(400, "ข้อมูลซับซ้อนเกินไป กรุณาลดจำนวนรายการแล้วลองใหม่");
    if (current.value && typeof current.value === "object") {
      for (const child of Object.values(current.value)) {
        if (pending.length + nodes >= 10000) throw new ArenaError(400, "ข้อมูลมีรายการมากเกินไป กรุณาลดจำนวนรายการแล้วลองใหม่");
        pending.push({ value: child, depth: current.depth + 1 });
      }
    }
  }
}
