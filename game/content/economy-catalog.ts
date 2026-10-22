import registry from "./asset-registry-v20.json";
import coverRegistry from "./profile-cover-registry-v23.json";
import nameplateRegistry from "./nameplate-registry-v24.json";
import sealRegistry from "./spirit-seal-registry-v25.json";

// V19/V20 Celestial Spirit Economy — presentation map only.
// Prices, enabled flags and ownership are authoritative in Supabase (etc_catalog / etc_economy RPC);
// the numbers here are the INITIAL catalog seed mirrored by the migration and used for tests.

export const ECONOMY_ASSET_ROOT = "/arena/economy";
export const economyAsset = (path: string) => `${ECONOMY_ASSET_ROOT}/${path}`;

export const ECONOMY_ASSETS = {
  spiritStone: economyAsset("currencies/spirit-stone-v2.webp"),
  spiritStoneGlow: economyAsset("animations/spirit-stone-glow.gif"),
  spiritStoneGlowStatic: economyAsset("animations/spirit-stone-glow-fallback.png"),
  rewardAcquired: economyAsset("animations/reward-acquired.gif"),
  rewardAcquiredStatic: economyAsset("animations/reward-acquired-fallback.png"),
  marketBackdrop: economyAsset("backgrounds/celestial-market-backdrop.png"),
  questScroll: economyAsset("shop/misc/quest-scroll.png"),
} as const;

/** V22 free starter look (owned + equipped for new players; per-layer fallback everywhere). */
export const STARTER_ASSETS = { avatar: "/arena/profile/default-player-avatar.png", frame: "/arena/profile/default-player-frame.png" } as const;
export const STARTER_LABELS = { avatar: "โปรไฟล์ผู้ฝึกเริ่มต้น", frame: "กรอบผู้ฝึกเริ่มต้น", availability: "ได้รับฟรีเมื่อเริ่มเล่น", equipped: "กำลังใช้งาน" } as const;

export type CosmeticSlot = "profileAvatar" | "swordSkin" | "profileFrame" | "profileCompanion" | "residenceDecor" | "portraitOutfit" | "profileCover" | "profileNameplate" | "spiritSeal";
export const SLOT_LABELS: Record<CosmeticSlot, string> = {
  swordSkin: "กระบี่",
  profileAvatar: "โปรไฟล์เซียน",
  profileFrame: "กรอบโปรไฟล์",
  profileCompanion: "สัตว์วิญญาณ",
  residenceDecor: "ของประดับและตำหนัก",
  portraitOutfit: "ของสะสมรุ่นก่อน (อาภรณ์)",
  profileCover: "ปกโปรไฟล์เซียน",
  profileNameplate: "ปกแถบชื่อเซียน",
  spiritSeal: "ตราประทับเซียน",
};
// Honest description of where each slot is actually rendered today (no 3D claims).
export const SLOT_CONTEXT: Record<CosmeticSlot, string> = {
  profileAvatar: "ภาพโปรไฟล์ทรงกลมบนปุ่มโปรไฟล์ หน้าโปรไฟล์ และรายชื่อสหาย (ภาพนิ่ง ไม่ใช่ชุดในฉาก 3 มิติ)",
  swordSkin: "จัดแสดงบนหน้าโปรไฟล์และถุงเฉียนคุน (ภาพประกอบ ไม่ใช่กระบี่ในฉาก 3 มิติ)",
  profileFrame: "ครอบภาพโปรไฟล์บนหน้าโปรไฟล์ ปุ่มโปรไฟล์ และรายชื่อสหาย",
  profileCompanion: "ปรากฏข้างภาพโปรไฟล์ ไม่ปรากฏในฉากเล่น",
  residenceDecor: "จัดแสดงในแผงตำหนักบนหน้าโปรไฟล์ (ยังไม่มีการวางในฉาก 3 มิติ)",
  portraitOutfit: "ของรุ่น V19 ที่เคยซื้อไว้ ยังเก็บและสวมได้ แต่ปิดขายแล้ว",
  profileCover: "ภาพพื้นหลังการ์ดโปรไฟล์ใบใหญ่ (หน้าโปรไฟล์ของข้าและที่สหายเข้าชม) ไม่ใช่กรอบรูปวงกลม",
  profileNameplate: "พื้นหลังแถบชื่อเล็กที่ปุ่มโปรไฟล์ด้านบนเกม (รูปวงกลมและกรอบยังเป็นของเดิม)",
  spiritSeal: "จัดแสดงเป็นช่องที่ 6 ในตู้โชว์ของสะสมบนหน้าโปรไฟล์ ไม่ใช่กรอบ ปก หรือตราแรงก์ และไม่มีผลต่อการเล่น",
};
/** Market categories for NEW sales (V20). portraitOutfit is legacy-only and shown just to its owners. */
export const MARKET_SLOTS: CosmeticSlot[] = ["swordSkin", "profileAvatar", "profileFrame", "profileCover", "profileNameplate", "spiritSeal", "profileCompanion", "residenceDecor"];
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

/** V23 profile covers (3:1, 2172x724). Empty profileCover slot = free default navy card. */
export const COVER_ASPECT = 2172 / 724;
export const DEFAULT_COVER_LABEL = "ปกเริ่มต้น (ฟรี)";
export const COVER_SEED: CatalogSeed[] = coverRegistry.mapping.map((c) => ({
  sku: c.id, name: c.name_th, slot: "profileCover" as CosmeticSlot, price: c.price_spirit_stones, asset: c.recommended_web_path, sha256: c.sha256,
}));

/** V24 compact nameplates (~939x165) for the header profile pill. Empty slot = free default background. */
export const DEFAULT_NAMEPLATE_LABEL = "พื้นหลังปกติ (ฟรี)";
export const NAMEPLATE_SEED: CatalogSeed[] = nameplateRegistry.items.map((n) => ({
  sku: n.id, name: n.name_th, slot: "profileNameplate" as CosmeticSlot, price: n.price, asset: n.web_path, sha256: n.sha256,
}));
/** Wide banner cosmetics get wide thumbnails and a free "default" choice instead of an unequip button. */
export const BANNER_SLOTS: CosmeticSlot[] = ["profileCover", "profileNameplate"];

/** V25 spirit seals (1254x1254 RGBA): showcase-only; rarity is descriptive, never a gameplay stat. */
export const SEAL_SEED: CatalogSeed[] = sealRegistry.items.map((x) => ({
  sku: x.id, name: x.name_th, slot: "spiritSeal" as CosmeticSlot, price: x.price, asset: x.web_path, sha256: x.sha256,
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
