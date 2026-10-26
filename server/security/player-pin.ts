import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

type Metadata = Record<string, unknown>;

function pinDigest(id: string, pin: string): string {
  // Auth metadata also appears in the player's JWT. A server-held key prevents offline
  // enumeration of the 10,000 PINs from a leaked digest; never store a plain PIN there.
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("ONLINE_CONFIGURATION_REQUIRED");
  return createHmac("sha256", key).update(`etcstream-player-pin-v1:${id}:${pin}`).digest("hex");
}

export function hasPlayerPin(metadata: Metadata): boolean {
  return (typeof metadata.pin_hash === "string" && /^[a-f0-9]{64}$/.test(metadata.pin_hash)) ||
    (typeof metadata.pin === "string" && /^[0-9]{4}$/.test(metadata.pin));
}

export function matchesPlayerPin(id: string, pin: string, metadata: Metadata): boolean {
  if (!/^[0-9]{4}$/.test(pin)) return false;
  if (typeof metadata.pin_hash === "string" && /^[a-f0-9]{64}$/.test(metadata.pin_hash)) {
    return timingSafeEqual(Buffer.from(metadata.pin_hash, "hex"), Buffer.from(pinDigest(id, pin), "hex"));
  }
  // Existing accounts upgrade only after proving their old PIN on a successful login.
  return typeof metadata.pin === "string" && /^[0-9]{4}$/.test(metadata.pin) &&
    timingSafeEqual(Buffer.from(metadata.pin), Buffer.from(pin));
}

export function playerPinMetadata(id: string, pin: string, metadata: Metadata): Metadata {
  if (!/^[0-9]{4}$/.test(pin)) throw new Error("INVALID_PIN");
  // Supabase merges metadata updates: explicitly null the legacy plaintext value.
  return { ...metadata, pin: null, pin_hash: pinDigest(id, pin) };
}
