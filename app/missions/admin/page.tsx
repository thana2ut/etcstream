"use client";

import { useState, type FormEvent } from "react";
import { MissionHall } from "@/components/ui/mission-hall";
import { ActionButton } from "@/components/ui/action-buttons";
import { FantasyBackground } from "@/components/ui/fantasy-background";

/**
 * Unlisted admin view of the mission hall (typed directly as /missions/admin): every venue can be opened and played.
 * Gated by a password whose SHA-256 hash is compared in the browser — the plain password is not in the source.
 * This is a client-side convenience gate for a static site, not real access control (see SECURITY.md).
 */
const ADMIN_HASH = "c3678881a2f9caf11a327f081a549c3dccbb5a50d9127c6e3cd4b5986efe46bb";

/** Plain SHA-256 (FIPS 180-4) for non-secure origins (e.g. http://LAN-IP), where crypto.subtle is unavailable. */
function sha256Fallback(bytes: Uint8Array): string {
  const K = Uint32Array.from([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
  const h = Uint32Array.from([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const len = bytes.length, padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  padded.set(bytes); padded[len] = 0x80;
  new DataView(padded.buffer).setUint32(padded.length - 4, len * 8);
  const w = new Uint32Array(64), view = new DataView(padded.buffer);
  const rot = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rot(w[i - 15], 7) ^ rot(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rot(w[i - 2], 17) ^ rot(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = (hh + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0;
      const t2 = ((rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += hh;
  }
  return [...h].map((x) => x.toString(16).padStart(8, "0")).join("");
}
async function sha256(text: string) {
  const bytes = new TextEncoder().encode(text);
  if (!globalThis.crypto?.subtle) return sha256Fallback(bytes);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function MissionHallAdminPage() {
  // Asked on every visit: the unlock lives only in this page's memory (nothing is stored).
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (unlocked) return <MissionHall admin />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    // Tolerate surrounding spaces and a trailing full stop (e.g. a pasted sentence).
    const ok = (await sha256(value.trim().replace(/\.+$/, ""))) === ADMIN_HASH;
    setBusy(false);
    setValue("");
    if (!ok) { setError("รหัสผ่านไม่ถูกต้อง"); return; }
    setUnlocked(true);
  };

  return (
    <main className="fantasy-viewport mission-hall-page" style={{ justifyContent: "center", alignItems: "center" }}>
      <FantasyBackground variant="archive" image="/images/xianxia/bg-missions.webp" />
      <form className="admin-gate glass-card gold-border-frame" onSubmit={submit} aria-labelledby="admin-gate-title">
        <span className="mission-hall-eyebrow">◈ หอจารึกแห่งภารกิจ · ผู้ดูแล ◈</span>
        <h1 id="admin-gate-title">ใส่รหัสผ่านผู้ดูแล</h1>
        <input
          type="password" inputMode="numeric" autoComplete="current-password" autoFocus
          aria-label="รหัสผ่านผู้ดูแล" value={value} maxLength={64}
          onChange={(e) => { setValue(e.target.value); setError(""); }}
        />
        {error && <p className="form-error" role="alert">{error}</p>}
        <ActionButton variant="gold" size="md" type="submit" disabled={busy || !value}>เข้าสู่โหมดผู้ดูแล</ActionButton>
      </form>
    </main>
  );
}
