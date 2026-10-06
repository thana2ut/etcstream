// Lists, per scenario, cables that cannot complete ANY required route (either orientation, adapters included).
// Usage: node scripts/check-usable-cables.mjs [scenarioId]
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rf = Module._resolveFilename;
Module._resolveFilename = function (r, p, ...x) { return rf.call(this, r.startsWith("@/") ? path.join(root, r.slice(2)) : r, p, ...x); };
Module._extensions[".ts"] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, f);
const load = createRequire(import.meta.url);
const { SCENARIOS } = load("../game/training/scenarios.ts");
const { plugFits } = load("../game/training/hdmi-training.ts");

const only = process.argv[2];
for (const s of Object.values(SCENARIOS)) {
  if (only && s.id !== only) continue;
  const ports = s.ports;
  const fits = (connector, portId) => ports[portId] && plugFits(connector, ports[portId]);
  // A plain lead is useful if its two ends can sit on the from/to ports of some required route.
  // An adapter (socketB) is useful if its plug end fits a route port and some other lead can plug into its socket.
  const useful = (c) => s.requirements.some((r) => r.from.some((f) => r.to.some((t) => {
    if (c.socketB) return fits(c.ends[0], f) || fits(c.ends[0], t);
    return (fits(c.ends[0], f) && fits(c.ends[1], t)) || (fits(c.ends[1], f) && fits(c.ends[0], t));
  })));
  const dead = s.cables.filter((c) => !c.fixedA && !useful(c));
  if (dead.length) console.log(`${s.id}: ${dead.map((c) => `${c.id} (${c.label})`).join(", ")}`);
}
