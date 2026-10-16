import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { load } from "./helpers/solver.mjs";
const { sceneText, SCENE_FONT, SCENE_TYPE } = load("../game/rendering/scene-font.ts");

test("shared display formatter preserves Thai marks, technical notation and provisional model identity", () => {
  for (const text of ["กำลัง", "ห้องฝึก", "เครื่อง", "อุปกรณ์", "HDMI IN 1", "HP 15.6-inch (ตามงานอ้างอิง)", "โปรไฟล์ฝึก", "รอยืนยัน"]) {
    assert.equal(sceneText(text), text);
  }
  assert.equal(sceneText("Computer (OBS)"), "คอมพิวเตอร์ (OBS)");
  assert.equal(sceneText("Camera"), "กล้อง");
  assert.equal(sceneText("Yamaha HS5"), "Yamaha HS5");
  for (const role of Object.values(SCENE_TYPE)) assert.ok(role.lineHeight >= 1.6);
});

test("the shared scene font retains Unicode mapping and Thai shaping tables", () => {
  const bytes = fs.readFileSync(new URL("../public" + SCENE_FONT, import.meta.url));
  const tables = new Set(Array.from({ length: bytes.readUInt16BE(4) }, (_, i) => bytes.toString("ascii", 12 + i * 16, 16 + i * 16)));
  for (const table of ["cmap", "GSUB", "GPOS", "head", "hhea", "OS/2"]) assert.ok(tables.has(table), table);
});
