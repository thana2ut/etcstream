// Regenerates the static chapter/stage text in game/content/mission-catalog.ts from game/training/sim (stages + rooms).
// The catalog must stay import-free (it is loaded in isolation by the hall, the router guard and tests).
// Usage: node scripts/generate-mission-catalog.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SCENARIOS } from "../tests/helpers/solver.mjs";
import { createRequire } from "node:module";

void SCENARIOS; // loads the TypeScript loader hooks
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "tests", "x.mjs"));
const { STAGES } = require("../game/training/sim/stages.ts");
const { ROOMS } = require("../game/training/sim/rooms.ts");

const file = path.join(root, "game/content/mission-catalog.ts");
const src = fs.readFileSync(file, "utf8");
const begin = src.indexOf("/* <generated:stages> */"), end = src.indexOf("/* </generated:stages> */");
if (begin < 0 || end < 0) throw new Error("generated markers missing");
const data = Object.fromEntries(Object.keys(ROOMS).map((room) => [room, {
  title: ROOMS[room].title, subtitle: ROOMS[room].subtitle,
  levels: STAGES.filter((s) => s.room === room).map((s) => ({ level: s.level, title: `${s.id} · ${s.title}`, flavor: `${s.subtitle} · ${s.minutes}`, objective: s.ticket })),
}]));
const body = `/* <generated:stages> */\nconst GENERATED: Record<"xs" | "s" | "m" | "l" | "xl", { title: string; subtitle: string; levels: MissionDifficulty[] }> = ${JSON.stringify(data, null, 2)};\n`;
fs.writeFileSync(file, src.slice(0, begin) + body + src.slice(end));
console.log("mission-catalog.ts regenerated");
