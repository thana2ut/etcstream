import registry from "./asset-registry-v20.json";

// V19/V20 Celestial Spirit Economy — presentation map only.
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

export type CosmeticSlot = "profileAvatar" | "swordSkin" | "profileFrame" | "profileCompanion" | "residenceDecor" | "portraitOutfit";
export const SLOT_LABELS: Record<CosmeticSlot, string> = {
  swordSkin: "กระบี่",
  profileAvatar: "โปรไฟล์เซียน",
  profileFrame: "กรอบโปรไฟล์",
  profileCompanion: "สัตว์วิญญาณ",
  residenceDecor: "ของประดับและตำหนัก",
  portraitOutfit: "ของสะสมรุ่นก่อน (อาภรณ์)",
};
// Honest description of where each slot is actually rendered today (no 3D claims).
export const SLOT_CONTEXT: Record<CosmeticSlot, string> = {
  profileAvatar: "ภาพโปรไฟล์ทรงกลมบนปุ่มโปรไฟล์ หน้าโปรไฟล์ และรายชื่อสหาย (ภาพนิ่ง ไม่ใช่ชุดในฉาก 3 มิติ)",
  swordSkin: "จัดแสดงบนหน้าโปรไฟล์และถุงเฉียนคุน (ภาพประกอบ ไม่ใช่กระบี่ในฉาก 3 มิติ)",
  profileFrame: "ครอบภาพโปรไฟล์บนหน้าโปรไฟล์ ปุ่มโปรไฟล์ และรายชื่อสหาย",
  profileCompanion: "ปรากฏข้างภาพโปรไฟล์ ไม่ปรากฏในฉากเล่น",
  residenceDecor: "จัดแสดงในแผงตำหนักบนหน้าโปรไฟล์ (ยังไม่มีการวางในฉาก 3 มิติ)",
  portraitOutfit: "ของรุ่น V19 ที่เคยซื้อไว้ ยังเก็บและสวมได้ แต่ปิดขายแล้ว",
};
/** Market categories for NEW sales (V20). portraitOutfit is legacy-only and shown just to its owners. */
export const MARKET_SLOTS: CosmeticSlot[] = ["swordSkin", "profileAvatar", "profileFrame", "profileCompanion", "residenceDecor"];
export const COSMETIC_SLOTS = [...MARKET_SLOTS, "portraitOutfit"] as CosmeticSlot[];

// V20 catalog generated from the owner's checked registry (SHA-256 verified on intake; see tests/economy-v20-assets.test.mjs).
const categorySlot: Record<string, CosmeticSlot> = { avatar: "profileAvatar", frame: "profileFrame", sword: "swordSkin", pet: "profileCompanion", decor: "residenceDecor" };
/** Accepts V19 legacy (sword_cloud) and V20 (AV-001, PET-005) SKUs; must match the etc_catalog sku check. */
export const SKU_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{2,40}$/;
export type CatalogSeed = { sku: string; name: string; slot: CosmeticSlot; price: number; asset: string; sha256: string };
export const CATALOG_SEED: CatalogSeed[] = registry.items.map((i) => ({
  sku: i.sku, name: i.thai_name, slot: categorySlot[i.category], price: i.price_spirit_stones,
  asset: "/" + i.recommended_destination.replace(/^public\//, ""), sha256: i.sha256,
}));

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
