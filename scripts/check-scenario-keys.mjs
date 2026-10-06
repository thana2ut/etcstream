// Static data check: duplicate labels / ids in a scenario become duplicate React keys in the intro list or HUD.
// Usage: node scripts/check-scenario-keys.mjs
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rf = Module._resolveFilename;
Module._resolveFilename = function (r, p, ...x) { return rf.call(this, r.startsWith("@/") ? path.join(root, r.slice(2)) : r, p, ...x); };
Module._extensions[".ts"] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, f);
const { SCENARIOS } = createRequire(import.meta.url)("../game/training/scenarios.ts");

let bad = 0;
for (const s of Object.values(SCENARIOS)) {
  const lists = [
    ["requirement label", s.requirements.map((r) => r.label)], ["requirement id", s.requirements.map((r) => r.id)],
    ["action id", s.actions.map((a) => a.id)], ["action label", s.actions.map((a) => a.label)],
    ["device id", s.devices.map((d) => d.id)], ["cable id", s.cables.map((c) => c.id)],
  ];
  for (const [what, list] of lists) {
    const dup = list.filter((v, i) => list.indexOf(v) !== i);
    if (dup.length) { bad++; console.log(`${s.id}: duplicate ${what}: ${[...new Set(dup)].join(", ")}`); }
  }
}
console.log(bad ? `${bad} problems` : "no duplicates");
process.exit(bad ? 1 : 0);
