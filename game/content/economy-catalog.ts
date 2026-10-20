// V19 Celestial Spirit Economy — presentation map only.
// Prices, enabled flags and ownership are authoritative in Supabase (etc_catalog / etc_economy RPC);
// the numbers here are the INITIAL catalog seed mirrored by the migration and used for tests.

export const ECONOMY_ASSET_ROOT = "/arena/economy";
export const economyAsset = (path: string) => `${ECONOMY_ASSET_ROOT}/${path}`;

export const ECONOMY_ASSETS = {
  spiritStone: economyAsset("currencies/spirit-stone.png"),
  spiritStoneGlow: economyAsset("animations/spirit-stone-glow.gif"),
  spiritStoneGlowStatic: economyAsset("animations/spirit-stone-glow-fallback.png"),
  rewardAcquired: economyAsset("animations/reward-acquired.gif"),
  rewardAcquiredStatic: economyAsset("animations/reward-acquired-fallback.png"),
  marketBackdrop: economyAsset("backgrounds/celestial-market-backdrop.png"),
  questScroll: economyAsset("shop/misc/quest-scroll.png"),
} as const;

export type CosmeticSlot = "swordSkin" | "portraitOutfit" | "profileFrame" | "profileCompanion" | "residenceDecor";
export const SLOT_LABELS: Record<CosmeticSlot, string> = {
  swordSkin: "กระบี่",
  portraitOutfit: "อาภรณ์",
  profileFrame: "กรอบโปรไฟล์",
  profileCompanion: "สัตว์วิญญาณ",
  residenceDecor: "ของประดับตำหนัก",
};
// Honest description of where each slot is actually rendered today (no 3D claims).
export const SLOT_CONTEXT: Record<CosmeticSlot, string> = {
  swordSkin: "แสดงคู่กับการ์ดตัวตนในหอประลอง โปรไฟล์ และถุงเฉียนคุน (ภาพประกอบ ไม่ใช่กระบี่ในฉาก 3 มิติ)",
  portraitOutfit: "แสดงเป็นภาพอาภรณ์บนการ์ดตัวตน (ภาพประกอบ ไม่ใช่ชุดในฉาก 3 มิติ)",
  profileFrame: "ครอบรูปตัวตนบนหน้าหลัก โปรไฟล์ และรายชื่อสหาย",
  profileCompanion: "ปรากฏข้างการ์ดตัวตน ไม่ปรากฏในฉากเล่น",
  residenceDecor: "จัดแสดงในแผงตำหนักบนหน้าโปรไฟล์ (ยังไม่มีการวางในฉาก)",
};
export const COSMETIC_SLOTS = Object.keys(SLOT_LABELS) as CosmeticSlot[];

export type CatalogSeed = { sku: string; name: string; slot: CosmeticSlot; price: number; asset: string };
const s = (sku: string, name: string, slot: CosmeticSlot, price: number, file: string): CatalogSeed => ({ sku, name, slot, price, asset: economyAsset(`shop/${file}`) });
export const CATALOG_SEED: CatalogSeed[] = [
  s("sword_cloud", "กระบี่เมฆา", "swordSkin", 400, "swords/cloud-blade.png"),
  s("sword_thunder", "กระบี่อัสนี", "swordSkin", 650, "swords/thunder-blade.png"),
  s("sword_jade_dragon", "กระบี่มังกรหยก", "swordSkin", 1200, "swords/jade-dragon-blade.png"),
  s("sword_flame", "กระบี่เพลิงสวรรค์", "swordSkin", 980, "swords/flame-blade.png"),
  s("sword_frost", "กระบี่เหมันต์", "swordSkin", 1500, "swords/frost-blade.png"),
  s("robe_cloud", "อาภรณ์เมฆา", "portraitOutfit", 600, "robes/cloud-robe.png"),
  s("robe_vermilion", "อาภรณ์ชาด", "portraitOutfit", 780, "robes/vermilion-robe.png"),
  s("robe_night", "อาภรณ์รัตติกาล", "portraitOutfit", 900, "robes/night-robe.png"),
  s("robe_golden", "อาภรณ์สุริยัน", "portraitOutfit", 1200, "robes/golden-robe.png"),
  s("robe_jade", "อาภรณ์หยก", "portraitOutfit", 1450, "robes/jade-robe.png"),
  s("frame_moon", "กรอบจันทรา", "profileFrame", 120, "frames/moon-frame.png"),
  s("frame_gold", "กรอบสุริยัน", "profileFrame", 350, "frames/gold-frame.png"),
  s("frame_fire", "กรอบเพลิง", "profileFrame", 500, "frames/fire-frame.png"),
  s("frame_purple", "กรอบม่วงพิภพ", "profileFrame", 600, "frames/purple-frame.png"),
  s("frame_ice", "กรอบเหมันต์", "profileFrame", 650, "frames/ice-frame.png"),
  s("pet_crane", "กระเรียนเมฆา", "profileCompanion", 900, "companions/cloud-crane.png"),
  s("pet_fox", "จิ้งจอกหยก", "profileCompanion", 1100, "companions/jade-fox.png"),
  s("pet_dragon", "มังกรน้อย", "profileCompanion", 1800, "companions/azure-dragon.png"),
  s("pet_phoenix", "หงส์เพลิง", "profileCompanion", 2200, "companions/phoenix.png"),
  s("home_pavilion", "ศาลาเซียน", "residenceDecor", 500, "residence/jade-pavilion.png"),
  s("home_peach", "ต้นท้อเซียน", "residenceDecor", 300, "residence/peach-tree.png"),
  s("home_bridge", "สะพานหมอก", "residenceDecor", 450, "residence/cloud-bridge.png"),
  s("home_lantern", "โคมสวรรค์", "residenceDecor", 100, "residence/heaven-lantern.png"),
  s("home_banner", "แผ่นป้ายสำนัก", "residenceDecor", 150, "residence/celestial-banner.png"),
  s("home_pedestal", "แท่นกระบี่", "residenceDecor", 300, "residence/sword-pedestal.png"),
];

// Reward design (mirrors etc_reward_rules seed). Level = stage suffix 1..5 of canonical id xs|s|m|l|xl-N.
export const FIRST_CLEAR_REWARD = [50, 75, 100, 150, 200] as const;
export const MEDAL_TOTAL = { bronze: 10, silver: 25, gold: 50 } as const;
export const DAILY_DISTINCT_STAGES = 3;
export const DAILY_REWARD = 30;
export type Medal = keyof typeof MEDAL_TOTAL;
export const MEDAL_LABELS: Record<Medal, string> = { bronze: "เหรียญทองแดง", silver: "เหรียญเงิน", gold: "เหรียญทอง" };

export const stageLevel = (stage: string) => { const m = /^(xs|s|m|l|xl)-([1-5])$/.exec(stage); return m ? Number(m[2]) : null; };
export const firstClearFor = (stage: string) => { const level = stageLevel(stage); return level ? FIRST_CLEAR_REWARD[level - 1] : 0; };
/** Incremental medal payout: lifetime medal total for the stage never decreases and never double-pays. */
export const medalIncrement = (previous: Medal | null, next: Medal | null) =>
  Math.max(0, (next ? MEDAL_TOTAL[next] : 0) - (previous ? MEDAL_TOTAL[previous] : 0));
export const medalFor = (totalMs: number, t: { bronzeMs: number; silverMs: number; goldMs: number } | null): Medal | null =>
  !t ? null : totalMs <= t.goldMs ? "gold" : totalMs <= t.silverMs ? "silver" : totalMs <= t.bronzeMs ? "bronze" : null;
export const stones = (n: number) => n.toLocaleString("th-TH");
