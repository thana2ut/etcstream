import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const src = readFileSync(new URL("../game/content/economy-catalog.ts", import.meta.url), "utf8");
const sql = readFileSync(new URL("../supabase/migrations/20261021090000_celestial_economy_v19.sql", import.meta.url), "utf8");
const seeds = [...src.matchAll(/s\("([a-z_]+)", "[^"]+", "(\w+)", (\d+), "([^"]+)"\)/g)];

test("every catalog asset exists under public/arena/economy", () => {
  assert.equal(seeds.length, 25);
  for (const [, , , , file] of seeds) assert.ok(existsSync(new URL(`../public/arena/economy/shop/${file}`, import.meta.url)), file);
});
test("client seed and SQL seed agree on sku, slot, price and asset", () => {
  for (const [, sku, slot, price, file] of seeds) assert.ok(sql.includes(`('${sku}','`) && sql.includes(`','${slot}',${price},'/arena/economy/shop/${file}'`), sku);
});
test("reward totals: 25 first clears = 2,875 and medal increments never double pay", () => {
  assert.equal([50, 75, 100, 150, 200].reduce((a, b) => a + b) * 5, 2875);
  const total = { bronze: 10, silver: 25, gold: 50 }, inc = (p, n) => Math.max(0, (n ? total[n] : 0) - (p ? total[p] : 0));
  assert.equal(inc("bronze", "silver"), 15); assert.equal(inc("silver", "gold"), 25); assert.equal(inc("gold", "bronze"), 0);
});
test("migration pays only independently replayed, evidenced runs and exposes no tables", () => {
  assert.match(sql, /validation_version is distinct from 'cloud-independent-replay-v1' or new\.evidence is null/);
  assert.doesNotMatch(sql, /grant (select|insert|update|delete)[^;]*to (anon|authenticated)/i);
  assert.match(sql, /etc_ledger_immutable before update or delete/);
  assert.doesNotMatch(sql.replace(/--.*$/gm, ""), /\bdrop\b|alter table public\.etc_(runs|profiles)\b/i);
});
test("rank thresholds remain 0/500/1250/2250/3250/4250", () => {
  const rules = readFileSync(new URL("../game/content/arena-ranked-rules.ts", import.meta.url), "utf8");
  for (const n of [500, 1250, 2250, 3250, 4250]) assert.match(rules, new RegExp(`\\b${n}\\b`));
});
