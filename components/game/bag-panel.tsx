"use client";

import { useMemo } from "react";
import { useTrainingStore } from "@/game/stores/training-store";
import { scenarioOf } from "@/game/training/hdmi-training";
import { catalogById, catalogIdFor } from "@/game/content/cable-catalog";
import { ConnectorIcon } from "@/components/ui/cable-lobby";

type Row = { id: string; packed: number; inBag: string[]; inHand: number; placed: number; plugged: number; spare: number };

/**
 * In-room bag (🎒): a real inventory. Every packed lead is in exactly one place — inside the bag, in the hand,
 * lying in the room, or plugged in — and the window shows those counts per cable type, live.
 * "หยิบ" takes one lead out of the bag; "เก็บเข้ากระเป๋า" puts the lead in hand back.
 */
export function BagPanel({ bag, onClose }: { bag: Record<string, number>; onClose: () => void }) {
  const scenario = useTrainingStore((s) => scenarioOf(s));
  const cables = useTrainingStore((s) => s.cables);
  const bagged = useTrainingStore((s) => s.bagged);
  const hidden = useTrainingStore((s) => s.hiddenCables);
  const held = useTrainingStore((s) => s.held);
  const heldItem = useTrainingStore((s) => s.heldItem);
  const takeCable = useTrainingStore((s) => s.takeCable);
  const stowHeld = useTrainingStore((s) => s.stowHeld);

  const rows = useMemo<Row[]>(() => {
    const leads = scenario.cables.filter((c) => !c.fixedA && !hidden?.includes(c.id));
    return Object.entries(bag).map(([id, packed]) => {
      const mine = leads.filter((c) => catalogIdFor(c) === id);
      const inBag = mine.filter((c) => bagged?.includes(c.id)).map((c) => c.id);
      const inHand = mine.filter((c) => held?.cableId === c.id).length;
      const plugged = mine.filter((c) => !bagged?.includes(c.id) && held?.cableId !== c.id && (cables[c.id]?.a.portId || cables[c.id]?.b.portId)).length;
      const placed = mine.length - inBag.length - inHand - plugged;
      return { id, packed, inBag, inHand, placed, plugged, spare: Math.max(0, packed - mine.length) };
    });
  }, [bag, scenario, cables, bagged, hidden, held]);

  const total = (k: "inHand" | "placed" | "plugged") => rows.reduce((a, r) => a + r[k], 0);
  const inBagTotal = rows.reduce((a, r) => a + r.inBag.length, 0);
  const handsFull = Boolean(held || heldItem);
  const heldDef = held ? scenario.cables.find((c) => c.id === held.cableId) : null;
  const heldCat = heldDef ? catalogById(catalogIdFor(heldDef)) : null;

  const take = (r: Row) => { if (r.inBag[0] && takeCable(r.inBag[0])) onClose(); };

  return <div className="cl-overlay" role="dialog" aria-modal="true" aria-labelledby="bag-title" onClick={onClose}>
    <div className="cl-overlay-card bag-card" onClick={(e) => e.stopPropagation()}>
      <div className="bag-head">
        <strong id="bag-title">🎒 กระเป๋าสาย</strong>
        <button type="button" className="cl-link" onClick={onClose}>ปิด ✕</button>
      </div>
      <div className="bag-summary" aria-live="polite">
        <span><b>{inBagTotal}</b>ในกระเป๋า</span>
        <span><b>{total("inHand")}</b>ในมือ</span>
        <span><b>{total("placed")}</b>วางในห้อง</span>
        <span><b>{total("plugged")}</b>เสียบแล้ว</span>
      </div>

      {held && heldDef && !heldDef.fixedA && <div className="bag-hand">
        {heldCat ? <ConnectorIcon family={heldCat.family} color={heldCat.color} /> : <span />}
        <div><strong>ถืออยู่: {heldCat?.name ?? heldDef.label}</strong><small>หยิบผิดเส้น? เก็บกลับเข้ากระเป๋าได้</small></div>
        <button type="button" className="bag-btn is-stow" onClick={() => stowHeld()}>เก็บเข้ากระเป๋า</button>
      </div>}

      {rows.length === 0 && <p className="cl-msg">ไม่ได้นำสายมา</p>}
      <ul className="bag-list">
        {rows.map((r) => {
          const c = catalogById(r.id);
          if (!c) return null;
          const canTake = r.inBag.length > 0 && !handsFull;
          return <li key={r.id} className={`bag-row ${r.inBag.length ? "" : "is-out"}`}>
            <ConnectorIcon family={c.family} color={c.color} />
            <div className="bag-row-main">
              <strong>{c.name}</strong>
              <small>{c.ends}</small>
              <span className="bag-chips">
                <em className={r.inBag.length ? "chip-bag" : "chip-zero"}>ในกระเป๋า {r.inBag.length}</em>
                {r.inHand > 0 && <em className="chip-hand">ในมือ {r.inHand}</em>}
                {r.placed > 0 && <em className="chip-room">วางในห้อง {r.placed}</em>}
                {r.plugged > 0 && <em className="chip-plug">เสียบแล้ว {r.plugged}</em>}
                {r.spare > 0 && <em className="chip-spare">ไม่มีจุดใช้ในด่านนี้ {r.spare}</em>}
              </span>
            </div>
            <div className="bag-row-side">
              <span className="bag-count">{r.inBag.length}<small>/{r.packed}</small></span>
              <button type="button" className="bag-btn" disabled={!canTake} onClick={() => take(r)}
                title={r.inBag.length === 0 ? "ไม่มีเส้นนี้เหลือในกระเป๋า" : handsFull ? "มือไม่ว่าง: วางหรือเก็บสิ่งที่ถืออยู่ก่อน" : `หยิบ ${c.name} 1 เส้น`}>
                หยิบ
              </button>
            </div>
          </li>;
        })}
      </ul>
      <p className="cl-note">{handsFull ? "มือไม่ว่าง · กด F วางสิ่งที่ถือ หรือกด “เก็บเข้ากระเป๋า” ก่อนหยิบเส้นใหม่" : "กด “หยิบ” เพื่อนำสายออกจากกระเป๋า 1 เส้น · สายที่วางไว้ในห้องเก็บด้วย E แล้วกด “เก็บเข้ากระเป๋า”"}</p>
    </div>
  </div>;
}
