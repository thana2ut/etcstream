import "server-only";
import { randomUUID } from "node:crypto";
import { SCENARIOS, type ScenarioId } from "@/game/training/scenarios";
import { getMissionBySlug, getDifficultyMeta } from "@/game/content/mission-catalog";
import { buildAdminLoadout } from "@/game/content/admin-loadout";
import type { AdminPreviewContext } from "@/game/security/admin-preview-types";
import { ArenaError } from "./db";
export function previewStart(entry: { expires: number; preview: { id: string; scenarioId: string; expires: number; chamber: "training" | "missions" } | null }, body: Record<string, unknown>): AdminPreviewContext {
  const chamber = body.chamber;
  let scenarioId: ScenarioId;
  let title: string;
  let venue: AdminPreviewContext["venue"] = "studio";
  if (chamber === "training") {
    if (body.sceneId !== "studio-full" && body.sceneId !== "hdmi-basic") throw new ArenaError(400, "ไม่พบฉากฝึกที่เลือก");
    scenarioId = body.sceneId; title = scenarioId === "studio-full" ? "ห้องฝึกอิสระ · ระบบสตูดิโอเต็ม" : "ตัวอย่างฝึก HDMI เดิม";
  } else if (chamber === "missions") {
    const mission = typeof body.slug === "string" ? getMissionBySlug(body.slug) : null;
    const level = Number(body.level);
    if (!mission || !Number.isInteger(level) || !getDifficultyMeta(mission, level)) throw new ArenaError(400, "สถานที่หรือระดับภารกิจไม่ถูกต้อง");
    const scale = { classroom: "xs", studio: "s", auditorium: "m", outdoor: "l", stadium: "xl" } as const;
    scenarioId = `${scale[mission.venueId]}-${level}` as ScenarioId;
    venue = mission.venueId; title = `${mission.title} · ระดับ ${level}`;
  } else throw new ArenaError(400, "กรุณาเลือกห้องฝึกหรือห้องภารกิจ");
  const scenario = SCENARIOS[scenarioId];
  if (!scenario) throw new ArenaError(400, "ไม่พบข้อมูลฉากจริง");
  const loadout = buildAdminLoadout(scenario);
  if (!loadout.ok) throw new ArenaError(409, loadout.issues.join(" · "));
  const id = randomUUID();
  const expires = Math.min(entry.expires, Date.now() + 30 * 60000);
  entry.preview = { id, scenarioId, chamber, expires };
  return { id, scenarioId, chamber, title, venue, expires, loadout: { leads: loadout.leads, bag: loadout.bag } };
}
