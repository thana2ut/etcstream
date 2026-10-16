// Regenerates the static chapter/stage text in game/content/mission-catalog.ts from game/training/sim (stages + rooms).
// The catalog must stay import-free (it is loaded in isolation by the hall, the router guard and tests).
// Usage: node scripts/generate-mission-catalog.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import Module from "node:module";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Data-only loader: catalog generation must never import the gameplay solver/test harness.
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  return resolveFilename.call(this, request.startsWith("@/") ? path.join(root, request.slice(2)) : request, parent, ...rest);
};
Module._extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const require = createRequire(import.meta.url);
const { STAGES } = require("../game/training/sim/stages.ts");
const { ROOMS } = require("../game/training/sim/rooms.ts");

const file = path.join(root, "game/content/mission-catalog.ts");
const src = fs.readFileSync(file, "utf8");
const begin = src.indexOf("/* <generated:stages> */"), end = src.indexOf("/* </generated:stages> */");
if (begin < 0 || end < 0) throw new Error("generated markers missing");
const data = Object.fromEntries(Object.keys(ROOMS).map((room) => [room, {
  title: ROOMS[room].title, subtitle: ROOMS[room].subtitle,
  levels: STAGES.filter((s) => s.room === room).map((s) => ({ level: s.level, title: `${s.id} · ${s.title.split(" · ")[0]}`, flavor: `${s.subtitle} · ${s.minutes}`, objective: s.ticket })),
}]));
const body = `/* <generated:stages> */\nconst GENERATED: Record<"xs" | "s" | "m" | "l" | "xl", { title: string; subtitle: string; levels: MissionDifficulty[] }> = ${JSON.stringify(data, null, 2)};\n`;
fs.writeFileSync(file, src.slice(0, begin) + body + src.slice(end));
console.log("mission-catalog.ts regenerated");
