export function validateNickname(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const nickname = value.trim();
  if (nickname.length < 2 || nickname.length > 20) return null;
  // Keep the existing Thai/English name UX while excluding markup and controls.
  if (!/^[\p{Script=Thai}A-Za-z0-9 ]+$/u.test(nickname)) return null;
  return nickname;
}

/** Reserved display names (same canonical form as the server/database). Using one requires the owner code. */
const RESERVED = new Set(["admin", "administrator", "แอดมิน", "แอดมิ้น", "ผู้ดูแล", "ผู้ดูแลระบบ", "ระบบ", "admin1", "admin2", "admin3"]);
export const isReservedNickname = (n: string) => RESERVED.has(n.normalize("NFKC").replace(/[​-‍⁠﻿­]/g, "").replace(/[\s\p{P}\p{S}]+/gu, "").toLowerCase());
/** Set only after the server verified the owner code in this browser. */
export const OWNER_NAME_KEY = "etc-owner-name-verified";
