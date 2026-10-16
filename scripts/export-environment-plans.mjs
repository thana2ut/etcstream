

import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// Load the project's TypeScript source directly without adding a runtime dependency.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  const resolved = request.startsWith("@/") ? path.join(projectRoot, request.slice(2)) : request;
  return resolveFilename.call(this, resolved, parent, ...rest);
};
Module._extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  module._compile(output, filename);
};

const load = createRequire(import.meta.url);
const { LAYOUTS } = load("../game/training/venue-layouts.ts");
const { VENUE_SCENARIOS } = load("../game/training/venue-scenarios.ts");
const output = path.join(projectRoot, "art/review/venues/plans");
fs.mkdirSync(output, { recursive: true });
const escape = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const inventory = [];
for (const id of ["xs-5", "s-5", "m-5", "l-5", "xl-5"]) {
 const s = VENUE_SCENARIOS[id], L = LAYOUTS[s.layout], b = L.bounds;
 const x = (v) => 55 + (v - b.minX) * 24, z = (v) => 90 + (v - b.minZ) * 24;
 const routes = {
 classroom: [[7.395,2.827],[5.301,1.041],[3.612,-3.72],[-2.071,-3.028],[-4.95,-3.043]],
 studioMission: [[7.4,8],[1.4,7.974],[-2.257,6.013],[0.146,0.817],[-3.102,0.815]],
 auditorium: [[-10.665,11.07],[-8.49,11.871],[2.649,11.871],[2.65,8.289],[3.647,8.289],[3.647,-3.879]],
 outdoor: [[-14.58,14.31],[1.024,10.514],[1.4,12.27],[5.285,12.27],[2.95,12.27],[2.95,8],[1.102,8],[1.102,-6.047]],
 stadium: [[1.56,1.56],[-3.547,-2.154],[-5.491,-2.154],[-5.491,-9.2],[-16.357,-9.2],[-16.357,2.4],[-1.68,2.4],[-1.68,-0.277],[7.688,-0.277],[7.688,15.535]],
 };
 const door = s.layout === "stadium" ? [-1.3,-0.39] : s.layout === "auditorium" ? [L.spawn[0],b.maxZ] : s.layout === "outdoor" ? [L.spawn[0],b.maxZ] : [b.maxX,s.layout === "classroom" ? 4 : 7.6];
 const w = (b.maxX - b.minX) * 24 + 110, h = (b.maxZ - b.minZ) * 24 + 210;
 const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><style>text{font-family:Tahoma,sans-serif;font-size:10px;fill:#e2e8f0}.title{font-size:18px}.small{font-size:8px}</style><rect width="100%" height="100%" fill="#0f172a"/><text x="30" y="32" class="title">${escape(id)} • ${escape(L.job)}</text><text x="30" y="54">${s.layout === "stadium" ? "Pitch / local NORTH = +Z (bottom)" : "Stage / local NORTH = −Z (top)"} • metres • development plan</text><rect x="55" y="90" width="${(b.maxX-b.minX)*24}" height="${(b.maxZ-b.minZ)*24}" fill="#1e293b" stroke="#94a3b8"/>`];
 for(const f of L.furniture) parts.push(`<rect x="${x(f.center[0]-f.size[0]/2)}" y="${z(f.center[2]-f.size[2]/2)}" width="${f.size[0]*24}" height="${f.size[2]*24}" fill="${f.kind === "chairBlock" || f.kind === "studentDesk" ? "#475569" : "#854d0e"}" stroke="#cbd5e1" stroke-width="0.5"/><text class="small" x="${x(f.center[0])}" y="${z(f.center[2])}" text-anchor="middle">${escape(f.id)}</text>`);
 for(const r of s.requirements) {const a=s.ports[r.from[0]]?.position,c=s.ports[r.to[0]]?.position;if(a&&c)parts.push(`<path d="M${x(a[0])},${z(a[2])} L${x(c[0])},${z(c[2])}" fill="none" stroke="${r.group === "audio" ? "#fb923c" : "#38bdf8"}" stroke-width="0.6" opacity="0.35"/>`);}
 parts.push(`<polyline points="${routes[s.layout].map(p=>`${x(p[0])},${z(p[1])}`).join(" ")}" fill="none" stroke="#4ade80" stroke-width="2" stroke-dasharray="5 4"/><rect x="${x(door[0])-5}" y="${z(door[1])-5}" width="10" height="10" fill="#a3e635"/><text x="${x(door[0])-10}" y="${z(door[1])-9}" text-anchor="end">${s.layout === "outdoor" ? "ENTRY" : "DOOR"}</text>`);
 for(const d of s.devices) parts.push(`<circle cx="${x(d.position[0])}" cy="${z(d.position[2])}" r="${d.kind === "camera" ? 5 : 3}" fill="${d.kind === "camera" ? "#f472b6" : "#67e8f9"}"/><text class="small" x="${x(d.position[0])+5}" y="${z(d.position[2])-4}">${escape(d.id)}</text>`);
 parts.push(`<circle cx="${x(L.spawn[0])}" cy="${z(L.spawn[2])}" r="7" fill="#4ade80"/><text x="${x(L.spawn[0])+9}" y="${z(L.spawn[2])}">SPAWN</text><text x="30" y="${h-70}">Pink: cameras • cyan: operating gear • brown: furniture • green: spawn</text><text x="30" y="${h-50}">Lines: logical source → destination graph (not installed cable geometry)</text><text x="30" y="${h-30}">Green dashed: walked route checkpoints (schematic); A–J views captured in engine.</text></svg>`);
 fs.writeFileSync(path.join(output,`${s.layout}.svg`), parts.join("\n"));
 inventory.push({id,layout:s.layout,spawn:L.spawn,storage:L.equipment,devices:s.devices.map(d=>({id:d.id,size:d.size,position:d.position})),placeables:s.placeables.map(i=>({id:i.id,start:i.start})),routes:s.requirements.map(r=>({id:r.id,from:r.from,to:r.to})),actions:s.actions.map(a=>({id:a.id,needs:a.needs}))});
}
fs.writeFileSync(path.join(output,"inventory.json"), JSON.stringify(inventory,null,2));
console.log("Exported five canonical SVG plans and inventory.json");
