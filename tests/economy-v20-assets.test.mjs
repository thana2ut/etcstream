import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const registry = JSON.parse(readFileSync(new URL("../game/content/asset-registry-v20.json", import.meta.url), "utf8"));
const sql = readFileSync(new URL("../supabase/migrations/20261021120000_profile_social_v20.sql", import.meta.url), "utf8");
const slot = { avatar: "profileAvatar", frame: "profileFrame", sword: "swordSkin", pet: "profileCompanion", decor: "residenceDecor" };

test("registry: exactly 40 unique SKUs and files, 15/8/7/5/5 by category", () => {
  assert.equal(registry.items.length, 40);
  assert.equal(new Set(registry.items.map((i) => i.sku)).size, 40);
  assert.equal(new Set(registry.items.map((i) => i.zip_path)).size, 40);
  const n = (c) => registry.items.filter((i) => i.category === c).length;
  assert.deepEqual([n("avatar"), n("frame"), n("decor"), n("sword"), n("pet")], [15, 8, 7, 5, 5]);
});
test("every installed PNG is byte-identical to the owner original (SHA-256) — no swapped art", () => {
  for (const i of registry.items) {
    const buf = readFileSync(new URL(`../${i.recommended_destination}`, import.meta.url));
    assert.equal(buf.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${i.sku} PNG signature`);
    assert.equal(createHash("sha256").update(buf).digest("hex"), i.sha256, `${i.sku} checksum`);
    assert.deepEqual([buf.readUInt32BE(16), buf.readUInt32BE(20)], [i.width_px, i.height_px], `${i.sku} size`);
  }
});
test("server catalog seed matches registry name, slot, price and image path for all 40", () => {
  for (const i of registry.items) {
    const row = `('${i.sku}','${i.thai_name}','${slot[i.category]}',${i.price_spirit_stones},'/${i.recommended_destination.replace(/^public\//, "")}',`;
    assert.ok(sql.includes(row), i.sku);
  }
});
test("V20 migration keeps V19 purchases: no deletes, legacy items only closed to new sales", () => {
  const code = sql.replace(/--.*$/gm, "");
  assert.doesNotMatch(code, /\bdelete\s+from\s+public\.etc_(owned|ledger|wallets|equipped|friends)\b/i);
  assert.match(code, /set legacy = true, enabled = false/);
  assert.doesNotMatch(code, /grant (select|insert|update|delete)[^;]*to (anon|authenticated)/i);
});
