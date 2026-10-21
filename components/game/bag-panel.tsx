"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTrainingStore } from "@/game/stores/training-store";
import { isItemPlaced, scenarioOf } from "@/game/training/hdmi-training";
import { catalogById, catalogIdFor } from "@/game/content/cable-catalog";
import { CableThumbnail, CatalogCanvas } from "@/components/ui/cable-model";
import { playerEquipmentText } from "@/game/content/sim-thai";

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

  if (scenario.stage) return <MissionStockPanel onClose={onClose} />;

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
        {heldCat ? <CableThumbnail className="bag-cable-thumbnail" cable={heldCat} /> : <span />}
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
            <CableThumbnail className="bag-cable-thumbnail" cable={c} />
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
      <CatalogCanvas />
    </div>
  </div>;
}

/** Mission inventory reads physical instances, including stock left in the venue and installed leads. */
function MissionStockPanel({ onClose }: { onClose: () => void }) {
  const state = useTrainingStore();
  const scenario = scenarioOf(state);
  const [tab, setTab] = useState<"cables" | "equipment" | "routes">("cables");
  const [query, setQuery] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (document.pointerLockElement) document.exitPointerLock();
    const previous = document.activeElement;
    const root = panel.current;
    root?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); }
      if (event.key !== "Tab" || !root) return;
      const controls = Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), input, summary, [tabindex="0"]'));
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    root?.addEventListener("keydown", handleKey);
    return () => { root?.removeEventListener("keydown", handleKey); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, [onClose]);
  const rows = scenario.cables.map((def) => {
    const lead = state.cables[def.id];
    const attached = Number(Boolean(lead?.a.portId)) + Number(Boolean(lead?.b.portId));
    const held = state.held?.cableId === def.id;
    const bagged = state.bagged?.includes(def.id) ?? false;
    return { def, lead, attached, held, bagged };
  });
  const installed = rows.filter((r) => r.attached === 2);
  const filtered = rows.filter(({ def }) => `${def.id} ${def.label} ${def.ends.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="cl-overlay" role="dialog" aria-modal="true" aria-labelledby="mission-stock-title" onClick={onClose}>
    <div className="cl-overlay-card bag-card" ref={panel} onClick={(e) => e.stopPropagation()}>
      <div className="bag-head"><strong id="mission-stock-title">🎒 กระเป๋าและคลังประจำด่าน</strong><button type="button" className="cl-link" onClick={onClose}>ปิด ✕</button></div>
      <div className="bag-summary" aria-live="polite">
        <span><b>{rows.length}</b>ทั้งหมด</span><span><b>{rows.filter((r) => !r.attached && !r.held).length}</b>ยังว่าง</span>
        <span><b>{rows.filter((r) => r.held).length}</b>กำลังถือ</span><span><b>{installed.length}</b>ต่อครบสองปลาย</span>
      </div>
      <nav aria-label="รายการประจำด่าน" className="bag-chips">
        {([["cables", "สายสัญญาณ"], ["equipment", "อุปกรณ์"], ["routes", "เส้นทางที่ต่อแล้ว"]] as const).map(([id, label]) => <button type="button" className="bag-btn" key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}
      </nav>
      {state.held && <div className="bag-hand"><div><strong>กำลังถือ {state.held.cableId}</strong><small>{rows.find((r) => r.held)?.attached ? "ปลายแรกติดแล้ว นำปลายที่เหลือไปต่อ" : "เลือกพอร์ตสำหรับปลายแรก"}</small></div><button type="button" className="bag-btn is-stow" onClick={state.stowHeld}>ยกเลิกและเก็บคืน</button></div>}
      {tab === "cables" && <>
        <label>ค้นหาสายหรือหัวต่อ <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="รหัสสาย ชื่อ หรือหัวต่อ" /></label>
        <ul className="bag-list">{filtered.map(({ def, attached, held, bagged }) => {
          const category = catalogById(catalogIdFor(def));
          const stockRole = def.stockRole === "spare" ? "สายสำรอง" : def.stockRole === "distractor" ? "สายตัวเลือกฝึกวิเคราะห์" : "สายสำหรับงาน";
          return <li key={def.id} className="bag-row">
            {category && <CableThumbnail className="bag-cable-thumbnail" cable={category} />}
            <div className="bag-row-main"><strong>{def.id} · {def.label}</strong><small>ปลาย A: {def.ends[0]} ↔ ปลาย B: {def.ends[1]}</small>
              <span className="bag-chips"><em>{stockRole}</em><em>{held ? "กำลังถือ" : attached === 2 ? "ต่อครบสองปลาย" : attached === 1 ? "ต่ออยู่หนึ่งปลาย" : bagged ? "ในกระเป๋า" : "จุดเก็บสายในห้อง"}</em></span>
              {scenario.cableMeta?.[def.id] && <small>ความยาว {scenario.cableMeta[def.id].lengthM} ม. · สัญญาณ {def.signalClass ?? "ตรวจชนิดจากพอร์ต"}</small>}
            </div>
            {bagged && <button type="button" className="bag-btn" disabled={Boolean(state.held || state.heldItem)} onClick={() => { if (state.takeCable(def.id)) onClose(); }}>หยิบ</button>}
          </li>;
        })}</ul>
        {filtered.length === 0 && <p>ไม่พบสายที่ค้นหา</p>}
        <p className="cl-note">สายที่ยังอยู่ในห้องหยิบด้วย E ที่จุดเก็บสาย · ต่อครบสองปลายไม่ได้แปลว่ามีสัญญาณ ต้องตั้งค่าและทดสอบระบบ</p>
      </>}
      {tab === "equipment" && <ul className="bag-list">{scenario.devices.map((d) => {
        const portable = scenario.placeables.find((p) => p.id === d.id);
        return <li key={d.id}><strong>{playerEquipmentText(d.label)}</strong><p>{portable ? state.heldItem === d.id ? "กำลังถือ" : isItemPlaced(state, d.id) ? "วางที่จุดใช้งานแล้ว" : "นำไปวางที่จุดใช้งาน" : "อุปกรณ์ติดตั้งประจำ"} · {portable?.zoneLabel ?? d.zoneLabel ?? "ตรวจป้ายประจำจุด"}</p><small>พอร์ต {Object.values(scenario.ports).filter((p) => p.device === d.id).length} ช่อง · {d.generic ? "อุปกรณ์ฝึกจำลอง" : "ตรวจชื่อและหน้าที่พอร์ตก่อนต่อ"}</small></li>;
      })}</ul>}
      {tab === "routes" && <><p className="cl-note">แสดงเฉพาะสายที่ต่อเองหรือมีอยู่เมื่อเริ่มงาน ยังไม่ยืนยันการส่งสัญญาณ</p><ul className="bag-list">{installed.map(({ def, lead }) => <li key={def.id}><strong>{def.id}</strong><p>{scenario.ports[lead.a.portId!]?.label} ↔ {scenario.ports[lead.b.portId!]?.label}</p><small>ถอดหรือเปลี่ยนสายด้วย E ที่พอร์ตจริง</small></li>)}</ul>{installed.length === 0 && <p>ยังไม่มีสายที่ต่อครบสองปลาย</p>}</>}
      <CatalogCanvas />
    </div>
  </div>;
}
