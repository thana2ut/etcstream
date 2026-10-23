"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { missionChapters } from "@/game/content/mission-catalog";
import { api, timeText, type AttemptView } from "./client-api";

/** V35 live duels: invitation pop-up, challenge sender, shared duel state, and the head-to-head verdict. */
export type DuelPlayer = { side: "challenger" | "opponent"; name: string; friendCode: string; status: string | null; totalMs: number | null; elapsedMs: number | null; mistakes: number | null; packed: boolean; started: boolean };
export type DuelState = { id: string; scenario: string; status: string; side: "challenger" | "opponent"; bothPacked: boolean; bothStarted: boolean;
  me: { packed: boolean; started: boolean; run: string | null }; players: DuelPlayer[] };
type Invite = { id: string; scenario: string; created: number; challenger: { name: string; friendCode: string } };

const SCALES = ["xs", "s", "m", "l", "xl"];
export function duelStageName(id: string) {
  const [scale, level] = id.split("-"), chapter = missionChapters[SCALES.indexOf(scale)];
  const difficulty = chapter?.difficulties.find((d) => d.level === Number(level));
  return { venue: chapter?.venue ?? scale, title: chapter?.title ?? "", level: Number(level), name: difficulty?.title ?? id };
}

/** Both sides open their own server-timed run of the duel stage, link it to the duel, then enter cable prep. */
export async function enterDuel(id: string, scenario: string): Promise<string> {
  const attempt = await api<AttemptView>("attempts", { scenario, requestId: id });
  await api("duel", { op: "join", id, run: attempt.id });
  return `/arena/time-attack/${attempt.id}?duel=${id}`;
}

/** Polls the duel while a round is being played (cable prep / start / result). */
export function useDuel(id: string | null | undefined, interval = 1500) {
  const [duel, setDuel] = useState<DuelState | null>(null);
  const refresh = useCallback(async () => { if (!id) return; try { setDuel(await api<DuelState>(`duel?op=get&id=${id}`)); } catch { /* keep last state */ } }, [id]);
  useEffect(() => {
    if (!id) return;
    const first = window.setTimeout(() => void refresh(), 0), timer = window.setInterval(() => void refresh(), interval);
    return () => { clearTimeout(first); clearInterval(timer); };
  }, [id, interval, refresh]);
  const send = useCallback(async (op: "packed" | "start") => { if (!id) return; try { setDuel(await api<DuelState>("duel", { op, id })); } catch { void refresh(); } }, [id, refresh]);
  return { duel, refresh, send };
}

/** Site-wide (signed-in arena pages): a friend's challenge appears centred; the challenger is sent in once accepted. */
export function DuelInviteWatcher() {
  const router = useRouter();
  const [invite, setInvite] = useState<Invite | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const dismissed = useRef(new Set<string>()), entering = useRef(false);
  useEffect(() => {
    if (window.location.pathname.startsWith("/arena/time-attack/")) return;
    let alive = true;
    const poll = async () => {
      if (document.hidden || entering.current) return;
      try {
        const [incoming, active] = await Promise.all([api<{ duels: Invite[] }>("duel?op=incoming"), api<{ id: string | null; scenario: string | null }>("duel?op=active")]);
        if (!alive) return;
        setInvite(incoming.duels.find((d) => !dismissed.current.has(d.id)) ?? null);
        if (active.id && active.scenario && !entering.current) { entering.current = true; router.push(await enterDuel(active.id, active.scenario)); }
      } catch { /* not signed in or offline: stay quiet */ }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 4000);
    return () => { alive = false; clearInterval(timer); };
  }, [router]);
  if (!invite) return null;
  const stage = duelStageName(invite.scenario);
  const respond = async (accept: boolean) => {
    if (busy) return;
    setBusy(true); setError("");
    try {
      await api("duel", { op: "respond", id: invite.id, accept });
      if (!accept) { dismissed.current.add(invite.id); setInvite(null); return; }
      entering.current = true;
      router.push(await enterDuel(invite.id, invite.scenario));
    } catch (e) { setError((e as Error).message); dismissed.current.add(invite.id); }
    finally { setBusy(false); }
  };
  return <div className="duel-invite-veil" role="presentation">
    <section className="duel-invite" role="alertdialog" aria-modal="true" aria-labelledby="duel-invite-title">
      <div className="duel-invite-swords" aria-hidden="true">⚔</div>
      <p className="duel-invite-kicker">✦ สาส์นท้าประลอง ✦</p>
      <h2 id="duel-invite-title"><strong>{invite.challenger.name}</strong> ท้าเจ้าประลองฝีมือ</h2>
      <dl className="duel-invite-detail">
        <div><dt>ผู้ท้า</dt><dd>{invite.challenger.name} <code>@{invite.challenger.friendCode}</code></dd></div>
        <div><dt>สถานที่</dt><dd>{stage.venue}{stage.title ? ` · ${stage.title}` : ""}</dd></div>
        <div><dt>ด่าน</dt><dd>ระดับ {stage.level} · {stage.name}</dd></div>
        <div><dt>กติกา</dt><dd>เตรียมสาย เข้าห้องพร้อมกัน เริ่มพร้อมกัน ใครต่อสายครบเร็วกว่าชนะ</dd></div>
      </dl>
      {error && <p className="duel-invite-error" role="alert">{error}</p>}
      <div className="duel-invite-actions">
        <button type="button" className="duel-accept" disabled={busy} onClick={() => void respond(true)}>{busy ? "กำลังเข้าลาน…" : "รับคำท้า"}</button>
        <button type="button" className="duel-decline" disabled={busy} onClick={() => void respond(false)}>ปฏิเสธ</button>
      </div>
    </section>
  </div>;
}

/** Send a live challenge to the selected friend for the selected stage, and wait for the answer. */
export function DuelChallengeButton({ code, name, scenario }: { code: string; name: string; scenario: string }) {
  const [pending, setPending] = useState<string | null>(null), [note, setNote] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(async () => {
      try {
        const d = await api<DuelState>(`duel?op=get&id=${pending}`);
        if (d.status === "declined") { setNote(`${name} ปฏิเสธคำท้า`); setPending(null); }
        else if (d.status === "expired" || d.status === "cancelled") { setNote("คำท้าหมดเวลาแล้ว"); setPending(null); }
      } catch { /* keep waiting */ }
    }, 3000);
    return () => clearInterval(timer);
  }, [pending, name]);
  if (!code) return null;
  return <div className="duel-send">
    {pending ? <>
      <p className="duel-send-wait" role="status">ส่งสาส์นท้าประลองถึง <strong>{name}</strong> แล้ว · รอตอบรับ…</p>
      <button type="button" className="arena-button-secondary" onClick={async () => { try { await api("duel", { op: "cancel", id: pending }); } catch { /* ignore */ } setPending(null); setNote("ยกเลิกคำท้าแล้ว"); }}>ยกเลิกคำท้า</button>
    </> : <button type="button" className="duel-challenge-btn" disabled={busy} onClick={async () => {
      setBusy(true); setNote("");
      try { setPending((await api<{ id: string }>("duel", { op: "challenge", code, scenario })).id); }
      catch (e) { setNote((e as Error).message); } finally { setBusy(false); }
    }}><span className="duel-challenge-icon" aria-hidden="true">⚔</span><span className="duel-challenge-text"><strong>{busy ? "กำลังส่งสาส์นท้าประลอง…" : `ท้าประลองสดกับ ${name}`}</strong><small>ส่งคำท้าให้สหาย เข้าด่านและเริ่มพร้อมกัน</small></span></button>}
    {note && <p className="arena-note" role="status">{note}</p>}
  </div>;
}

/** After both runs end: who was faster, by how much. */
export function DuelVerdict({ duel }: { duel: DuelState | null }) {
  if (!duel) return null;
  const me = duel.players.find((p) => p.side === duel.side), them = duel.players.find((p) => p.side !== duel.side);
  if (!me || !them) return null;
  const done = (p: DuelPlayer) => p.status && !["PENDING", "RUNNING"].includes(p.status);
  const ok = (p: DuelPlayer) => typeof p.totalMs === "number" && p.status !== "DNF" && p.status !== "REJECTED";
  const bothDone = done(me) && done(them);
  let verdict = "รอคู่ประลองทำภารกิจให้จบ…", winner: string | null = null;
  if (bothDone) {
    if (ok(me) && ok(them)) { winner = me.totalMs! === them.totalMs! ? "draw" : me.totalMs! < them.totalMs! ? me.side : them.side; }
    else winner = ok(me) ? me.side : ok(them) ? them.side : "none";
    const gap = ok(me) && ok(them) ? ` · ห่างกัน ${timeText(Math.abs(me.totalMs! - them.totalMs!))}` : "";
    verdict = winner === "draw" ? "เสมอกัน — ฝีมือทัดเทียม" : winner === "none" ? "ไม่มีผู้ชนะในรอบนี้" : winner === me.side ? `เจ้าชนะ!${gap}` : `${them.name} ชนะ${gap}`;
  }
  const card = (p: DuelPlayer, label: string) => <div className={`duel-verdict-card${winner === p.side ? " is-winner" : ""}`}>
    {winner === p.side && <span className="duel-crown" aria-hidden="true">👑</span>}
    <span className="duel-verdict-label">{label}</span><strong>{p.name}</strong>
    <b>{ok(p) ? timeText(p.totalMs) : done(p) ? "ไม่จบภารกิจ" : "กำลังประลอง…"}</b>
    <small>{typeof p.mistakes === "number" ? `ผิดพลาด ${p.mistakes} ครั้ง` : " "}</small>
  </div>;
  return <section className="duel-verdict" aria-live="polite">
    <p className="duel-invite-kicker">✦ ผลประลองสองเซียน ✦</p>
    <div className="duel-verdict-board">{card(me, "เจ้า")}<span className="duel-vs">VS</span>{card(them, "คู่ประลอง")}</div>
    <h3 className={bothDone && winner === me.side ? "is-win" : undefined}>{verdict}</h3>
  </section>;
}
