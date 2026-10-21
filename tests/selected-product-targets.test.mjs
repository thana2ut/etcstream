import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SCENARIOS} from './helpers/solver.mjs';
const targets=JSON.parse(fs.readFileSync(new URL('../game/content/selected-product-targets.json',import.meta.url),'utf8'));
test('owner-authorized visual targets cover precisely the 27 active generic profiles without rebinding confirmed equipment',()=>{
  const active=[...new Set(Object.values(SCENARIOS).filter(s=>s.stage).flatMap(s=>s.devices.filter(d=>d.generic).map(d=>d.modelId)))].sort();
  assert.equal(active.length,27); assert.deepEqual(Object.keys(targets.profiles).sort(),active);
  for(const id of active) {const p=targets.products[targets.profiles[id]]; assert.ok(p?.name&&p?.compatibility); assert.ok(p.url.startsWith('https://'));}
  for(const id of ['samsung-u8000f','comica-wm100-plus','shure-sm58','yamaha-hs5']) assert.equal(targets.profiles[id],undefined);
});
test('composite or logical targets explicitly preserve non-factory service ports and software links',()=>{
  assert.equal(targets.products['yamaha-mg12xu-bundle'].integration,'requires-visible-service-adapter');
  assert.match(targets.products['contour-shuttleprov2'].compatibility,/ไม่ใช่รูเสียบจริง/);
  assert.match(targets.products['dell3660-decklink'].compatibility,/ไม่สร้างช่อง CONTROL กายภาพปลอม/);
  assert.match(targets.products['sennheiser-em100g4'].compatibility,/ไม่ใช่ EK/);
});
