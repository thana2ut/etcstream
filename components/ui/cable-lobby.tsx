"use client";

import { useEffect, useMemo, useState } from "react";
import { CableInspector, CablePreview, CableView, CardCableScene, CatalogCanvas } from "./cable-model";
import { CategoryIcon, FrameCorners, Medallion, OnAirPlaque, PagodaRoof, ScrollRail, Tassel } from "./lobby-ornaments";
import { CABLE_CATALOG, CABLE_CATEGORIES, catalogById, MAX_WRONG_STREAK, type CableCategory, type CatalogCable, type ConnectorFamily } from "@/game/content/cable-catalog";
import type { Scenario } from "@/game/training/scenarios";
import { soundEngine } from "@/game/audio/sound-engine";
import { preloadRoomModels } from "@/game/assets/preload-models";

/** Small connector silhouette per family (no images). */
export function ConnectorIcon({ family, color }: { family: ConnectorFamily; color: string }) {
  const s = { stroke: color, strokeWidth: 3, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <svg viewBox="0 0 64 64" className="cl-icon" aria-hidden="true">
    <path d="M6 40 C 18 52, 30 22, 44 34" {...s} strokeWidth={4} opacity={0.55} />
    {family === "hdmi" && <path d="M38 22 h20 v10 l-4 6 h-12 l-4 -6 z" {...s} fill={color} fillOpacity={0.25} />}
    {family === "bnc" && <><circle cx="50" cy="28" r="10" {...s} /><circle cx="50" cy="28" r="3" fill={color} /></>}
    {family === "fiber" && <><circle cx="50" cy="28" r="6" fill={color} /><circle cx="50" cy="28" r="12" {...s} opacity={0.5} /></>}
    {family === "xlr" && <><circle cx="50" cy="28" r="11" {...s} /><circle cx="46" cy="25" r="2" fill={color} /><circle cx="54" cy="25" r="2" fill={color} /><circle cx="50" cy="32" r="2" fill={color} /></>}
    {family === "trs" && <><rect x="40" y="25" width="10" height="7" rx="2" {...s} /><path d="M50 28.5 h10" {...s} /><path d="M56 26 v5" {...s} /></>}
    {family === "rca" && <><circle cx="46" cy="28" r="6" {...s} /><circle cx="56" cy="28" r="6" {...s} stroke="#e85d5d" /></>}
    {family === "usb" && <><rect x="40" y="22" width="18" height="12" rx="2" {...s} /><rect x="44" y="26" width="10" height="4" fill={color} /></>}
    {family === "rj45" && <><rect x="40" y="20" width="18" height="16" rx="2" {...s} /><path d="M44 36 v-5 h10 v5" {...s} /></>}
    {family === "multicore" && <><rect x="38" y="18" width="22" height="20" rx="3" {...s} />{[0, 1, 2].map((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={43 + c * 6} cy={23 + r * 5} r="1.6" fill={color} />))}</>}
    {family === "control" && <><rect x="40" y="22" width="18" height="12" rx="6" {...s} /><path d="M45 28 h8" {...s} /></>}
  </svg>;
}

/**
 * ห้องเตรียมสาย (Cable Prep Lobby) — shown before every Mission Hall level. Devices are already in the venue;
 * the trainee packs the leads they think the job needs. Only packed leads appear in the room, so a wrong or short
 * selection makes the level impossible to finish. The bag has no size limit: it grows a row whenever it fills up.
 */
export function CableLobby({ scenario, title, levelLabel, objective, playerName, onConfirm, onBack }: {
  scenario: Scenario; title: string; levelLabel: string; objective?: string; playerName?: string;
  onConfirm: (bag: Record<string, number>) => void; onBack: () => void;
}) {
  void scenario; // the room's devices come from the scenario; the bag itself is free-form
  const [category, setCategory] = useState<CableCategory>("video");
  const [selected, setSelected] = useState<CatalogCable>(CABLE_CATALOG[0]);
  const [bag, setBag] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const [inspecting, setInspecting] = useState<CatalogCable | null>(null);
  // The trainee spends a while here: fetch the room's 3D models now so the level opens without hitches.
  useEffect(() => { preloadRoomModels(); }, []);
  const total = Object.values(bag).reduce((a, b) => a + b, 0);
  const used = Object.keys(bag).length;
  const items = CABLE_CATALOG.filter((c) => c.category === category);
  // Always at least 4 rows, plus one empty row beyond the last filled slot.
  const slots = useMemo(() => Math.max(16, Math.ceil((used + 1) / 4) * 4), [used]);

  const add = (c: CatalogCable) => {
    setBag({ ...bag, [c.id]: (bag[c.id] ?? 0) + 1 }); setMessage(""); soundEngine.play("button_hover");
  };
  const remove = (c: CatalogCable) => {
    if (!bag[c.id]) return;
    const next = { ...bag, [c.id]: bag[c.id] - 1 };
    if (next[c.id] <= 0) delete next[c.id];
    setBag(next); setMessage("");
  };
  const bagEntries = Object.entries(bag).map(([id, n]) => ({ c: catalogById(id)!, n }));
  const packedIn = (cat: CableCategory) => bagEntries.filter((e) => e.c.category === cat).reduce((a, e) => a + e.n, 0);
  // Guide strip: a cable is always selected, so the trainee is either packing (3) or ready to enter (4).
  const step = total > 0 ? 4 : 3;
  const pick = (c: CatalogCable) => { setSelected(c); soundEngine.play("button_hover"); };

  return <main className="cl-screen">
    <div className="cl-bg" aria-hidden="true"><div className="cl-bg-art" /><div className="cl-bg-shade" /></div>
    <OnAirPlaque />
    <header className="cl-header">
      <button type="button" className="cl-back" onClick={onBack}><span className="cl-back-arrow" aria-hidden="true">↩</span> กลับหอภารกิจ</button>
      <div className="cl-title">
        <span className="cl-eyebrow">ห้องเตรียมสาย · Cable Prep Lobby{playerName ? ` · ผู้ฝึก ${playerName}` : ""}</span>
        <h1>{title} <small>{levelLabel}</small></h1>
        {objective && <p>{objective}</p>}
        <ol className="cl-steps" aria-label="ขั้นตอน">
          {["เลือกหมวด", "เลือกสาย", "ใส่กระเป๋า", "เข้าสู่ด่าน"].map((t, i) => <li key={t} className={i + 1 < step ? "is-done" : i + 1 === step ? "is-now" : ""}><b>{i + 1}</b>{t}</li>)}
        </ol>
      </div>
      <div className="cl-capacity" aria-live="polite"><Tassel side="left" long /><Tassel side="right" long /><span>ในกระเป๋า</span><strong>{total}</strong><small>เส้น · {used} ชนิด</small></div>
    </header>

    <section className="cl-body">
      <nav className="cl-tabs" aria-label="หมวดสาย">
        {CABLE_CATEGORIES.map((cat) => <button key={cat.id} type="button" className={category === cat.id ? "is-on" : ""} onClick={() => setCategory(cat.id)} aria-pressed={category === cat.id}>
          <span className="cl-tab-glyph"><CategoryIcon id={cat.id} /></span><span>{cat.label}</span>
          {packedIn(cat.id) > 0 && <em className="cl-tab-count" aria-label={`ใส่แล้ว ${packedIn(cat.id)} เส้น`}>{packedIn(cat.id)}</em>}
        </button>)}
      </nav>

      <div className="cl-catalog-wrap">
      <div className="cl-catalog" role="list" aria-label="รายการสายในหมวด">
        <FrameCorners />
        {items.map((c) => <div key={c.id} role="listitem" className={`cl-slot ${selected.id === c.id ? "is-selected" : ""} ${bag[c.id] ? "is-packed" : ""}`}>
          <button type="button" className="cl-slot-hit" onClick={() => pick(c)} onDoubleClick={() => add(c)} aria-pressed={selected.id === c.id} title={`${c.name} — กดเพื่อดู · ดับเบิลคลิกเพื่อใส่กระเป๋า`}>
            <CableView className="cl-slot-3d"><CardCableScene cable={c} /></CableView>
            <span className="cl-slot-name">{c.name}</span>
            <span className="cl-slot-ends">{c.ends}</span>
          </button>
          {bag[c.id] ? <em className="cl-slot-count">×{bag[c.id]}</em> : null}
          <button type="button" className="cl-slot-add" onClick={() => { setSelected(c); add(c); }} aria-label={`ใส่ ${c.name} ลงกระเป๋า`}>+</button>
        </div>)}
      </div>

        <CatalogCanvas />
      </div>

      <aside className="cl-side">
        <div className="cl-detail">
          <FrameCorners /><Tassel side="left" /><Tassel side="right" />
          <PagodaRoof />
          <div className="cl-panel-title">รายละเอียดสาย</div>
          <div className="cl-detail-head"><ConnectorIcon family={selected.family} color={selected.color} /><div><strong>{selected.name}</strong><small>{selected.id} · {selected.status}</small></div></div>
          <button type="button" className="cl-preview-wrap" onClick={() => setInspecting(selected)} aria-label={`ดูโมเดล 3D ของ ${selected.name}`}>
            <CablePreview cable={selected} />
            <span className="cl-hold">กดเพื่อดูรายละเอียดเพิ่มเติม</span>
          </button>
          <dl className="cl-facts">
            <div><dt>หัวต่อ</dt><dd>{selected.ends}</dd></div>
            <div><dt>ใช้ต่อ</dt><dd>{selected.use}</dd></div>
          </dl>
          <div className="cl-detail-actions">
            <div className="cl-stepper" role="group" aria-label="จำนวนในกระเป๋า">
              <button type="button" onClick={() => remove(selected)} disabled={!bag[selected.id]} aria-label="นำออก 1 เส้น">−</button>
              <output aria-live="polite">{bag[selected.id] ?? 0}</output>
              <button type="button" onClick={() => add(selected)} aria-label="เพิ่ม 1 เส้น">+</button>
            </div>
            <button type="button" className="cl-btn is-primary" onClick={() => add(selected)}><span className="cl-plus">+</span> ใส่กระเป๋า</button>
          </div>
        </div>
        <div className="cl-bag">
          <FrameCorners /><ScrollRail />
          <div className="cl-bag-head"><strong><svg className="cl-pouch" viewBox="0 0 32 32" aria-hidden="true"><path d="M11 6h10l-2 4h-6z" fill="#c99a4a"/><path d="M13 10c-6 3-9 9-7 14 1 3 4 4 10 4s9-1 10-4c2-5-1-11-7-14z" fill="#e9c27a" stroke="#7a5426" strokeWidth="1.2"/><path d="M12 10h8" stroke="#7a5426" strokeWidth="1.6"/><circle cx="16" cy="19" r="3" fill="none" stroke="#7a5426" strokeWidth="1.2"/></svg> กระเป๋าของเจ้า</strong><button type="button" className="cl-link" disabled={total === 0} onClick={() => { setBag({}); setMessage(""); }}>ล้าง</button></div>
          {total === 0 && <p className="cl-bag-empty">กระเป๋ายังว่าง · กด <b>+</b> บนการ์ดสาย หรือปุ่ม “ใส่กระเป๋า”</p>}
          {/* only the slot grid scrolls; frame, header, corners and scroll rail stay put */}
          <div className="cl-bag-scroll">
          <div className="cl-bag-grid">
            {Array.from({ length: slots }, (_, i) => {
              const e = bagEntries[i];
              return <button key={i} type="button" className={`cl-bag-slot ${e ? "is-filled" : ""}`} disabled={!e} onClick={() => e && setSelected(e.c)} title={e ? `${e.c.name} ×${e.n}` : "ช่องว่าง"}>
                {e && <><ConnectorIcon family={e.c.family} color={e.c.color} /><em>{e.n}</em></>}
              </button>;
            })}
          </div>
          </div>
          {message && <p className="cl-msg" role="alert">{message}</p>}
        </div>
      </aside>
    </section>

    {inspecting && <CableInspector cable={inspecting} onClose={() => setInspecting(null)} />}
    <footer className="cl-footer">
      <FrameCorners /><Medallion />
      <p>อุปกรณ์รออยู่ในห้องแล้ว · เลือกสายให้ครบและถูกชนิด สายที่ไม่ได้นำไปจะไม่มีในห้อง · ต่อผิดติดต่อกัน {MAX_WRONG_STREAK} ครั้ง = ไม่ผ่าน</p>
      <div className="cl-enter-wrap">
        <button type="button" className="cl-enter" disabled={total === 0} onClick={() => { soundEngine.play("mission_accept"); onConfirm(bag); }}>เข้าสู่ด่าน →</button>
        <small>{total === 0 ? "ใส่สายอย่างน้อย 1 เส้นก่อน" : `พร้อมออกเดินทาง · ${total} เส้น`}</small>
      </div>
    </footer>
  </main>;
}

/** In-level bag viewer (🎒 button). Shows what was packed and how much of it this level can use. */
/** `ready`: loose (unplugged) leads of each type still in the room; `onTake` puts one in the player's hands. */
/** `holding`: catalog id + label of the lead in hand (can be put back with `onStow`). */
export function BagOverlay({ bag, usage, ready, holding, onTake, onStow, onClose }: { bag: Record<string, number>; usage: Record<string, number>; ready: Record<string, number>; holding?: { id: string; label: string } | null; onTake: (catalogId: string) => void; onStow: () => void; onClose: () => void }) {
  const entries = Object.entries(bag).map(([id, n]) => ({ c: catalogById(id)!, n, u: usage[id] ?? 0, r: ready[id] ?? 0 }));
  return <div className="cl-overlay" role="dialog" aria-modal="true" aria-labelledby="cl-bag-title" onClick={onClose}>
    <div className="cl-overlay-card" onClick={(e) => e.stopPropagation()}>
      <div className="cl-bag-head"><strong id="cl-bag-title">🎒 กระเป๋าสาย</strong><button type="button" className="cl-link" onClick={onClose}>ปิด ✕</button></div>
      {holding && (() => { const c = catalogById(holding.id); return <button type="button" className="cl-bag-pick cl-holding" onClick={onStow}>
        {c ? <ConnectorIcon family={c.family} color={c.color} /> : <span />}
        <div><strong>ถืออยู่: {c?.name ?? holding.label}</strong><small>หยิบผิดเส้น? เก็บคืนแล้วเลือกใหม่</small></div>
        <span className="cl-pick-state is-on"><b>เก็บคืนกระเป๋า</b></span>
      </button>; })()}
      {entries.length === 0 && <p className="cl-msg">กระเป๋าว่าง</p>}
      <ul className="cl-bag-list">
        {entries.map(({ c, n, u, r }) => <li key={c.id}>
          <button type="button" className="cl-bag-pick" disabled={r === 0} onClick={() => onTake(c.id)} title={r ? `หยิบ ${c.name}` : u === 0 ? "ด่านนี้ไม่มีพอร์ตรองรับสายนี้" : "ใช้ครบแล้ว"}>
            <ConnectorIcon family={c.family} color={c.color} />
            <div><strong>{c.name}</strong><small>{c.ends}</small></div>
            <span className={`cl-pick-state ${r > 0 ? "is-on" : "is-off"}`}>
              {r > 0 ? <><b>เลือกได้</b>{r} เส้น</> : <><b>เลือกไม่ได้</b>{u === 0 ? "ด่านนี้ไม่ใช้" : `ต่อครบแล้ว ${u}/${n}`}</>}
            </span>
          </button>
        </li>)}
      </ul>
      <p className="cl-note"><span className="cl-key">คลิก</span> สายที่ “เลือกได้” เพื่อหยิบขึ้นมือ</p>
    </div>
  </div>;
}
