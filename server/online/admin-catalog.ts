import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { trustedClient, cloudConfig } from "./supabase";
import { cloudAdminSession } from "./admin";
import { checkOrigin } from "@/server/arena/auth";
import { ArenaError } from "@/server/arena/db";

// V27 live marketplace CMS. Every call is authorized by the single main /admin session (server-side) and writes
// only through etc_catalog_admin() (service role) or the server-only Storage upload below.
const MAX_BYTES = 4 * 1024 * 1024;
const MEDIA_PREFIX = "/storage/v1/object/public/catalog-media/items/";
const KINDS = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", gif: "image/gif" } as const;
type Kind = keyof typeof KINDS;

function reply(data: unknown, status = 200) { return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } }); }

/** Identify the format from the real bytes (not the filename/content-type) and read pixel dimensions. */
function inspectImage(b: Buffer): { kind: Kind; width: number; height: number } | null {
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47 && b.readUInt32BE(4) === 0x0d0a1a0a && b.toString("ascii", 12, 16) === "IHDR")
    return { kind: "png", width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  if (b.length > 10 && (b.toString("ascii", 0, 6) === "GIF87a" || b.toString("ascii", 0, 6) === "GIF89a"))
    return { kind: "gif", width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
  if (b.length > 30 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { kind: "webp", width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    if (chunk === "VP8 ") return { kind: "webp", width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L") { const bits = b.readUInt32LE(21); return { kind: "webp", width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }; }
    return null;
  }
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1], size = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { kind: "jpg", height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
      i += 2 + size;
    }
  }
  return null;
}

const errors: [RegExp, number, string][] = [
  [/INVALID_NAME/, 400, "ชื่อสินค้าต้องยาว 2–60 ตัวอักษร"],
  [/INVALID_SLOT/, 400, "หมวดหมู่นี้ไม่รองรับการขาย"],
  [/INVALID_PRICE/, 400, "ราคาต้องเป็นจำนวนเต็ม 1–1,000,000 หินวิญญาณ"],
  [/INVALID_TEXT/, 400, "คำอธิบายยาวเกิน 500 ตัวอักษร หรือระดับความหายากยาวเกินไป"],
  [/INVALID_STATUS/, 400, "สถานะไม่ถูกต้อง"],
  [/REASON_REQUIRED/, 400, "ต้องระบุเหตุผลอย่างน้อย 5 ตัวอักษรเมื่อซ่อนหรือยุติการขาย"],
  [/SLOT_LOCKED/, 409, "สินค้านี้มีผู้ครอบครองแล้ว จึงเปลี่ยนหมวดหมู่ไม่ได้ (ใช้ทำสำเนาเป็นสินค้าใหม่แทน)"],
  [/NOT_SELLABLE/, 409, "สินค้ารุ่นก่อนหรือของเริ่มต้นฟรี แก้ไขหรือเปิดขายไม่ได้"],
  [/ITEM_UNAVAILABLE/, 404, "ไม่พบสินค้านี้"],
  [/etc_catalog_asset_check/, 400, "ต้องอัปโหลดรูปสินค้าก่อนบันทึก"],
];

/** JSON catalog routes, called from cloudAdmin after its main-session check. */
export async function catalogAdmin(route: string, post: boolean, body: Record<string, unknown>) {
  const db = trustedClient();
  const call = async (operation: string, payload: Record<string, unknown> = {}) => {
    const r = await db.rpc("etc_catalog_admin", { operation, body: payload });
    if (r.error) {
      const hit = errors.find(([re]) => re.test(r.error!.message));
      throw new ArenaError(hit?.[1] ?? 503, hit?.[2] ?? "บันทึกแค็ตตาล็อกไม่สำเร็จ กรุณาลองใหม่");
    }
    return r.data;
  };
  if (route === "catalog/list" && !post) return reply(await call("list"));
  if (route === "catalog/save" && post) {
    const asset = String(body.asset || "");
    const { url } = cloudConfig();
    if (!asset.startsWith("/arena/") && !asset.startsWith(url + MEDIA_PREFIX)) throw new ArenaError(400, "ต้องอัปโหลดรูปสินค้าก่อนบันทึก");
    const r = await db.rpc("etc_trusted_budget", { k: "owner-catalog", maximum: 60, seconds: 60 }); if (r.error) throw new ArenaError(429, "บันทึกบ่อยเกินไป กรุณารอสักครู่");
    return reply(await call("save", {
      sku: typeof body.sku === "string" ? body.sku : "", name: String(body.name || "").normalize("NFC"), description: String(body.description || "").normalize("NFC"),
      slot: String(body.slot || ""), rarity: String(body.rarity || ""), price: Math.trunc(Number(body.price)), sort: Math.trunc(Number(body.sort) || 900),
      asset, status: String(body.status || "draft"),
    }));
  }
  if (route === "catalog/status" && post) return reply(await call("status", { sku: String(body.sku || ""), status: String(body.status || ""), reason: String(body.reason || "") }));
  throw new ArenaError(404, "ไม่พบรายการนี้");
}

/** Multipart image upload (server-authorized). Validates real bytes, stores under a server-generated immutable path. */
export async function catalogUpload(request: Request) {
  try {
    checkOrigin(request);
    if (!(await cloudAdminSession())) throw new ArenaError(401, "กรุณากรอกรหัสหลักเพื่อเข้าตำหนักอีกครั้ง");
    if (request.method !== "POST") throw new ArenaError(405, "ใช้วิธีส่งข้อมูลไม่ถูกต้อง");
    if (Number(request.headers.get("content-length") || 0) > MAX_BYTES + 64 * 1024) throw new ArenaError(413, "ไฟล์ใหญ่เกิน 4 MB");
    const db = trustedClient();
    const budget = await db.rpc("etc_trusted_budget", { k: "owner-upload", maximum: 30, seconds: 300 });
    if (budget.error) throw new ArenaError(429, "อัปโหลดบ่อยเกินไป กรุณารอสักครู่");
    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) throw new ArenaError(400, "ไม่พบไฟล์รูป");
    if (file.size === 0 || file.size > MAX_BYTES) throw new ArenaError(413, "ไฟล์ต้องมีขนาดไม่เกิน 4 MB");
    const bytes = Buffer.from(await file.arrayBuffer());
    const info = inspectImage(bytes);
    if (!info) throw new ArenaError(415, "รองรับเฉพาะ PNG, JPEG, WebP หรือ GIF ที่เป็นไฟล์รูปจริง");
    if (info.width < 64 || info.height < 64 || info.width > 4096 || info.height > 4096) throw new ArenaError(400, "ขนาดรูปต้องอยู่ระหว่าง 64–4096 พิกเซลต่อด้าน");
    const path = `items/${randomUUID()}.${info.kind}`;
    const up = await db.storage.from("catalog-media").upload(path, bytes, { contentType: KINDS[info.kind], upsert: false, cacheControl: "31536000" });
    if (up.error) throw new ArenaError(503, "อัปโหลดไปที่เก็บไฟล์ไม่สำเร็จ กรุณาลองใหม่");
    await db.from("etc_admin_audit").insert({ actor: "owner", action: "catalog-upload", target: path, reason: `อัปโหลดรูป ${info.width}x${info.height} ${info.kind}` });
    const { url } = cloudConfig();
    return reply({ ok: true, url: url + "/storage/v1/object/public/catalog-media/" + path, width: info.width, height: info.height, kind: info.kind });
  } catch (error) {
    if (!(error instanceof ArenaError)) console.error("Catalog upload failed", error instanceof Error ? error.name : "UnknownError");
    return reply({ error: error instanceof ArenaError ? error.message : "อัปโหลดไม่สำเร็จ" }, error instanceof ArenaError ? error.status : 503);
  }
}
