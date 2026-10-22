"use client";

import { NoSplit } from "./no-split";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCableBag } from "./use-cable-bag";
import { createPortal } from "react-dom";
import { useMissionAccess, useTester } from "@/components/game/use-tester";
import { checkMissionBag, venueCandidateStock, type BagProblem } from "@/game/content/mission-bag";
import { CableInspector, CablePreview, CableThumbnail, CatalogCanvas } from "./cable-model";
import { CategoryIcon } from "./lobby-ornaments";
import { CABLE_CATALOG, PHYSICAL_CABLE_CATALOG, CABLE_CATEGORIES, catalogById, MAX_WRONG_STREAK, type CableCategory, type CatalogCable, type ConnectorFamily } from "@/game/content/cable-catalog";
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
 * the trainee packs the leads they think the job needs. Mission stock not packed remains at the in-room rack.
 * Legacy practice retains its original packing rules. The bag grows a row whenever it fills up.
 */
export function CableLobby({ scenario, title, levelLabel, objective, playerName, only, onConfirm, onBack, backLabel = "กลับหอภารกิจ" }: {
  scenario: Scenario; title: string; levelLabel: string; objective?: string; playerName?: string; backLabel?: string;
  /** Optional Free Practice limit; missions always show every physical catalog choice. */
  only?: string[];
  onConfirm: (bag: Record<string, number>) => void; onBack: () => void;
}) {
  const catalog = useMemo(() => {
    // Free Practice and missions share one lobby: the full physical catalog and the exact-bag check.
    return PHYSICAL_CABLE_CATALOG;
  }, []);
  // Every physical choice has the same training stock; the cap does not reveal this level's answer.
  const stock = useMemo(() => venueCandidateStock(scenario), [scenario]);
  const categories = useMemo(() => CABLE_CATEGORIES.filter((cat) => catalog.some((c) => c.category === cat.id)), [catalog]);
  const [category, setCategory] = useState<CableCategory>(() => categories[0]?.id ?? "video");
  const [selected, setSelected] = useState<CatalogCable>(() => catalog.find((c) => c.category === (categories[0]?.id ?? "video")) ?? catalog[0] ?? CABLE_CATALOG[0]);
  const [inspecting, setInspecting] = useState<CatalogCable | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const { bag, entries: bagEntries, total, kinds, add: addOne, remove: removeOne, clear, count } = useCableBag();
  // The trainee spends a while here: fetch the room's 3D models now so the level opens without hitches.
  useEffect(() => { preloadRoomModels(); }, []);

  // Search looks across every category; otherwise the active tab filters the catalog.
  const q = query.trim().toLowerCase();
  const items = q
    ? catalog.filter((c) => [c.name, c.ends, c.use, c.id].some((t) => t.toLowerCase().includes(q)))
    : catalog.filter((c) => c.category === category);
  // Five slots per row, always one free row after the last filled slot (minimum two rows).
  const slots = useMemo(() => Math.max(10, Math.ceil((kinds + 1) / 5) * 5), [kinds]);
  const packedIn = (cat: CableCategory) => bagEntries.filter((e) => e.c.category === cat).reduce((a, e) => a + e.n, 0);
  // Guide strip: a cable is always selected, so the trainee is either packing (3) or ready to enter (4).
  const step = total > 0 ? 4 : 3;

  const add = (c: CatalogCable, n = 1) => {
    const amount = Math.min(n, Math.max(0, (stock[c.id] ?? 0) - count(c.id)));
    if (amount > 0) { addOne(c, amount, stock[c.id] ?? 0); soundEngine.play("button_hover"); }
  };
  // Quantity picked in the detail stepper: only goes into the bag when "ใส่กระเป๋า" is pressed (resets to 1 per cable).
  const [draft, setDraft] = useState<{ id: string; n: number }>({ id: "", n: 1 });
  const remaining = Math.max(0, (stock[selected.id] ?? 0) - count(selected.id));
  const qty = Math.min(Math.max(1, remaining), draft.id === selected.id ? draft.n : 1);
  const setQty = (n: number) => setDraft({ id: selected.id, n: Math.min(stock[selected.id] ?? 0, Math.max(1, remaining), Math.max(1, n)) });
  const putInBag = () => { add(selected, qty); setDraft({ id: selected.id, n: 1 }); };
  const remove = (c: CatalogCable) => { removeOne(c); soundEngine.play("button_hover"); };
  const pick = (c: CatalogCable) => { setSelected(c); soundEngine.play("button_hover"); };
  const mission = true;
  // Free Practice: admin1–3 and the owner Admin may enter with any bag; everyone else needs the exact bag.
  const tester = useTester(), owner = useMissionAccess();
  const bypass = !scenario.stage && (tester || owner);
  const canEnter = mission ? true : total > 0;
  // Problem found by the last entry attempt: opens the centred red warning (one dialog per invalid click).
  const [rejected, setRejected] = useState<BagProblem | null>(null);
  const entering = useRef(false);
  const enterBtn = useRef<HTMLButtonElement>(null);
  // The bag window shows whole rows only: its height snaps to N rows of slots for whatever space the column leaves.
  const bagScroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = bagScroll.current, panel = el?.parentElement;
    if (!el || !panel) return;
    const fit = () => {
      const grid = el.firstElementChild as HTMLElement | null;
      if (!grid) return;
      // Collapse first so the panel measures at its grid-given size, not at the size the old rows pushed it to.
      el.style.height = "0px"; grid.style.gridAutoRows = "";
      const slot = grid.firstElementChild as HTMLElement | null;
      if (!slot) return;
      // Base row height comes from CSS; rows stretch a little so N whole rows fill the panel with no leftover gap.
      const styles = getComputedStyle(grid);
      const gap = parseFloat(styles.rowGap) || 0, base = slot.offsetHeight;
      const pads = parseFloat(getComputedStyle(el).paddingTop) + parseFloat(getComputedStyle(el).paddingBottom);
      const pad = parseFloat(getComputedStyle(panel).paddingBottom) || 0;
      const avail = panel.getBoundingClientRect().bottom - pad - el.getBoundingClientRect().top - pads;
      // Keep complete rows only; forcing a second row into a short panel flattens every slot.
      const rows = Math.max(1, Math.floor((avail + gap) / (base + gap)));
      // Fill the panel exactly; a short panel may shrink slots to 80% so the whole row stays inside the frame.
      const rowH = Math.max(base * .8, Math.min(base * 1.35, (avail - gap * (rows - 1)) / rows));
      grid.style.gridAutoRows = `${rowH}px`;
      el.style.height = `${rows * rowH + gap * (rows - 1) + pads}px`;
    };
    fit();
    // Re-fit again on the next frame: media queries can change the base row height right after a resize.
    const ro = new ResizeObserver(() => { fit(); requestAnimationFrame(fit); });
    // Watch the whole lobby screen: the bag column itself can be held open by the rows it is about to resize.
    ro.observe(panel.closest(".cl-screen") ?? panel);
    window.addEventListener("resize", fit);
    return () => { ro.disconnect(); window.removeEventListener("resize", fit); };
  }, [bagEntries.length, slots]);

  return <main className="cl-screen cl-v3">
    <div className="cl-bg" aria-hidden="true"><div className="cl-bg-art" /><div className="cl-bg-shade" /></div>
    <header className="cl-header">
      <button type="button" className="cl-back" onClick={onBack}>
        <span className="cl-back-arrow" aria-hidden="true">
          <svg viewBox="0 0 20 20"><path d="m12.5 4.5-5 5.5 5 5.5" /></svg>
        </span>
        <span>{backLabel}</span>
      </button>
      <div className="cl-title">
        <span className="cl-eyebrow">ห้องเตรียมสาย{playerName ? ` | ผู้ฝึก: ${playerName}` : ""}</span>
        <h1>{title}</h1>
        {levelLabel && <p className="cl-level">{levelLabel}</p>}
        {objective && <p className="cl-objective">{objective}</p>}
        {<p className="cl-objective">คลังนี้มีสายหลายชนิด บางชนิดไม่จำเป็นสำหรับด่านนี้ จงเลือกชนิดและจำนวนด้วยตนเอง</p>}
        <ol className="cl-steps" aria-label="ขั้นตอน">
          {["เลือกหมวด", "เลือกสาย", "ใส่กระเป๋า", "เข้าสู่ด่าน"].map((t, i) => <li key={t} className={i + 1 < step ? "is-done" : i + 1 === step ? "is-now" : ""} aria-current={i + 1 === step ? "step" : undefined}><b>{i + 1}</b>{t}</li>)}
        </ol>
      </div>
      <div className="cl-capacity" aria-live="polite"><span>ในกระเป๋า</span><strong>{total}</strong><small>เส้น · {kinds} ชนิด</small></div>
    </header>

    <section className="cl-body">
      <nav className="cl-tabs" aria-label="หมวดสาย">
        {categories.map((cat) => <button key={cat.id} type="button" className={!q && category === cat.id ? "is-on" : ""} onClick={() => {
          setCategory(cat.id); setQuery("");
          const first = catalog.find((c) => c.category === cat.id);
          if (selected.category !== cat.id && first) setSelected(first);
        }} aria-pressed={!q && category === cat.id}>
          <span className="cl-tab-glyph"><CategoryIcon id={cat.id} /></span><span className="cl-tab-label">{cat.label}</span>
          {packedIn(cat.id) > 0 && <em className="cl-tab-count" aria-label={`ใส่แล้ว ${packedIn(cat.id)} เส้น`}>{packedIn(cat.id)}</em>}
          <span className="cl-tab-chev" aria-hidden="true">›</span>
        </button>)}
      </nav>

      <div className="cl-center">
        <div className="cl-toolbar">
          <div className="cl-viewtoggle" role="group" aria-label="รูปแบบการแสดง">
            <button type="button" className={view === "grid" ? "is-on" : ""} aria-pressed={view === "grid"} onClick={() => setView("grid")} aria-label="แสดงแบบตาราง"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="6" height="6" rx="1.2" /><rect x="11" y="3" width="6" height="6" rx="1.2" /><rect x="3" y="11" width="6" height="6" rx="1.2" /><rect x="11" y="11" width="6" height="6" rx="1.2" /></svg></button>
            <button type="button" className={view === "list" ? "is-on" : ""} aria-pressed={view === "list"} onClick={() => setView("list")} aria-label="แสดงแบบรายการ"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4" width="2.5" height="2.5" rx=".6" /><rect x="7.5" y="4.4" width="9.5" height="1.7" rx=".8" /><rect x="3" y="8.8" width="2.5" height="2.5" rx=".6" /><rect x="7.5" y="9.2" width="9.5" height="1.7" rx=".8" /><rect x="3" y="13.6" width="2.5" height="2.5" rx=".6" /><rect x="7.5" y="14" width="9.5" height="1.7" rx=".8" /></svg></button>
          </div>
          <span className="cl-result-count">{q ? `ผลการค้นหา ${items.length} รายการ` : `${items.length} รายการ`}</span>
          <label className="cl-search">
            <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l4 4" /></svg>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาสาย..." aria-label="ค้นหาสาย" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="ล้างคำค้น">✕</button>}
          </label>
        </div>

        <div className="cl-catalog-wrap">
          <div className={`cl-catalog is-${view}`} role="list" aria-label={q ? "ผลการค้นหาสาย" : "รายการสายในหมวด"}>
            {items.map((c) => <div key={c.id} role="listitem" className={`cl-slot ${selected.id === c.id ? "is-selected" : ""} ${count(c.id) ? "is-packed" : ""}`}>
              <button type="button" className="cl-slot-hit" onClick={() => pick(c)} onDoubleClick={() => add(c)} aria-pressed={selected.id === c.id} title={`${c.name} — กดเพื่อดู · ดับเบิลคลิกเพื่อใส่กระเป๋า`}>
                <CableThumbnail className="cl-slot-3d" cable={c} />
                <span className="cl-slot-text">
                  {/* non-breaking hyphen: "Type-A" never splits across lines */}
                  <span className="cl-slot-name"><NoSplit text={c.name} /></span>
                  <span className="cl-slot-ends"><NoSplit text={c.ends} /></span>
                  {view === "list" && <span className="cl-slot-use">{c.use}</span>}
                </span>
              </button>
              {count(c.id) ? <em className="cl-slot-count">×{count(c.id)}</em> : null}
            </div>)}
            {items.length === 0 && <p className="cl-empty">ไม่พบสายที่ตรงกับ “{query}” · ลองคำอื่น เช่น HDMI, XLR, SDI</p>}
          </div>
          <CatalogCanvas />
        </div>
      </div>

      <aside className="cl-side">
        <div className="cl-detail">
          <div className="cl-panel-title">รายละเอียดสาย</div>
          <div className="cl-detail-head">
            <button type="button" className="cl-preview-wrap" onClick={() => setInspecting(selected)} aria-label={`ดูโมเดล 3D ของ ${selected.name}`} title="กดเพื่อดูโมเดล 3D แบบเต็มจอ">
              <CablePreview cable={selected} />
            </button>
            <div><strong><NoSplit text={selected.name} /></strong><small>{selected.id} · {selected.status}</small></div>
          </div>
          <dl className="cl-facts cl-facts-scroll" tabIndex={0} role="region" aria-label="หัวต่อและวิธีใช้สาย เลื่อนเพื่ออ่านข้อความทั้งหมด">
            <div><dt>หัวต่อ</dt><dd>{selected.ends}</dd></div>
            <div><dt>ใช้ต่อ</dt><dd>{selected.use}</dd></div>
          </dl>
          <div className="cl-detail-actions">
            <div className="cl-stepper" role="group" aria-label="จำนวนที่จะใส่กระเป๋า">
              <button type="button" onClick={() => setQty(qty - 1)} disabled={qty <= 1} aria-label="ลดจำนวน">−</button>
              <output aria-live="polite">{qty}</output>
              <button type="button" onClick={() => setQty(qty + 1)} disabled={qty >= Math.min(stock[selected.id] ?? 0, remaining)} aria-label="เพิ่มจำนวน">+</button>
            </div>
            <button type="button" className="cl-btn is-primary" onClick={putInBag} disabled={remaining === 0}>{remaining === 0 ? "จัดครบแล้ว" : <><span className="cl-plus">+</span> ใส่กระเป๋า{qty > 1 ? ` ${qty} เส้น` : ""}</>}</button>
          </div>
        </div>
        <div className="cl-bag">
          <div className="cl-bag-head"><strong><svg className="cl-pouch" viewBox="0 0 32 32" aria-hidden="true"><path d="M11 6h10l-2 4h-6z" fill="#c99a4a"/><path d="M13 10c-6 3-9 9-7 14 1 3 4 4 10 4s9-1 10-4c2-5-1-11-7-14z" fill="#e9c27a" stroke="#7a5426" strokeWidth="1.2"/><path d="M12 10h8" stroke="#7a5426" strokeWidth="1.6"/><circle cx="16" cy="19" r="3" fill="none" stroke="#7a5426" strokeWidth="1.2"/></svg> กระเป๋าของเจ้า</strong><button type="button" className="cl-link" disabled={total === 0} onClick={clear}>ล้าง</button></div>
          <p className="cl-bag-empty">{total === 0 ? <>กระเป๋ายังว่าง · ดับเบิลคลิกการ์ดสาย หรือกดปุ่ม “ใส่กระเป๋า”</> : <>กดช่องเพื่อดูรายละเอียด · <b>✕</b> นำออกทีละเส้น</>}</p>
          <div className="cl-bag-scroll" ref={bagScroll}>
            <div className="cl-bag-grid">
              {Array.from({ length: slots }, (_, i) => {
                const e = bagEntries[i];
                if (!e) return <span key={`empty-${i}`} className="cl-bag-slot is-empty" aria-hidden="true"><span className="cl-bag-plus"><svg viewBox="0 0 16 16"><path d="M8 3.5v9M3.5 8h9" /></svg></span></span>;
                return <span key={e.c.id} className={`cl-bag-slot is-filled ${selected.id === e.c.id ? "is-selected" : ""}`}>
                  <button type="button" className="cl-bag-hit" onClick={() => setSelected(e.c)} title={`${e.c.name} ×${e.n}`} aria-label={`${e.c.name} ${e.n} เส้น`}>
                    <CableThumbnail className="cl-bag-thumbnail" cable={e.c} /><em>{e.n}</em>
                  </button>
                  <button type="button" className="cl-bag-remove" onClick={() => remove(e.c)} aria-label={`นำ ${e.c.name} ออก 1 เส้น`}>✕</button>
                </span>;
              })}
            </div>
            <CatalogCanvas />
          </div>
        </div>
      </aside>
    </section>

    {inspecting && <CableInspector cable={inspecting} onClose={() => setInspecting(null)} />}
    <footer className="cl-footer">
      <span className="cl-footer-icon" aria-hidden="true">!</span>
      <div className="cl-footer-text">
        <strong>{mission ? "เลือกชนิดและจำนวนสายให้ตรงกับภารกิจ ระบบจะตรวจกระเป๋าก่อนเปิดประตูด่าน" : "ใส่สายอย่างน้อย 1 เส้นก่อนเข้าสู่ด่าน แล้วตรวจจำนวนให้ตรงกับงาน"}</strong>
        <small>{scenario.stage
          ? "อุปกรณ์และสายประจำฉากยังอยู่ตามเดิม · สายตัวเลือกที่ไม่จำเป็นไม่เพิ่มเป็นงานของด่าน · ต่อผิดครบ 3 ครั้งจะพักเพื่อทบทวน"
          : <>อุปกรณ์รออยู่ในห้องแล้ว · สายที่ไม่ได้นำไปจะไม่มีในห้อง · ต่อผิดติดต่อกัน {MAX_WRONG_STREAK} ครั้ง = ไม่ผ่าน</>}</small>
      </div>
      <div className="cl-enter-wrap">
        <small id="cl-entry-status" className={total === 0 ? "" : "is-ready"} role="status">{mission ? total === 0 ? "จัดสายใส่กระเป๋าก่อน แล้วกดเข้าสู่ด่านเพื่อตรวจ" : `ในกระเป๋า ${total} เส้น · กดเข้าสู่ด่านเพื่อตรวจ` : total === 0 ? "ใส่สายอย่างน้อย 1 เส้นก่อนเข้าสู่ด่าน" : `พร้อมออกเดินทาง · ${total} เส้น`}</small>
        <button ref={enterBtn} type="button" className="cl-enter" disabled={!canEnter} aria-describedby="cl-entry-status" onClick={() => {
          if (!canEnter || entering.current) return;
          if (mission) {
            // Re-check the live bag at click time against THIS level; a rejected bag stays as it is for editing.
            const result = bypass ? { ok: true as const } : checkMissionBag(scenario, bag);
            if (!result.ok) { if (!rejected) { setRejected(result.problem); soundEngine.play("button_hover"); } return; }
            entering.current = true;
            soundEngine.play("mission_accept"); onConfirm({ ...bag });
            return;
          }
          if (!Object.values(bag).some((n) => Number.isFinite(n) && n >= 1)) return;
          entering.current = true;
          soundEngine.play("mission_accept"); onConfirm(bag);
        }}>เข้าสู่ด่าน →</button>
      </div>
    </footer>
    {rejected && <BagWarning problem={rejected} onClose={() => { setRejected(null); requestAnimationFrame(() => enterBtn.current?.focus()); }} />}
  </main>;
}

/** Non-spoiler wording: says what kind of problem, never which cables or how many. */
const WARNING: Record<BagProblem, { cue: string; text: string }> = {
  empty: { cue: "กระเป๋ายังว่าง", text: "กระเป๋ายังว่างอยู่ โปรดเลือกสายที่เหมาะสมก่อนก้าวเข้าสู่ด่าน" },
  missing: { cue: "เลือกสายไม่ครบ", text: "สายที่เลือกยังไม่ครบตามเงื่อนไขของภารกิจ โปรดกลับไปตรวจสอบกระเป๋าอีกครั้ง" },
  wrong: { cue: "ชนิดสายไม่ตรง", text: "ชนิดหรือจำนวนสายที่เลือกไม่ตรงกับภารกิจ โปรดจัดกระเป๋าใหม่ก่อนเข้าสู่ด่าน" },
  excess: { cue: "จำนวนสายไม่ถูกต้อง", text: "ชนิดหรือจำนวนสายที่เลือกไม่ตรงกับภารกิจ โปรดจัดกระเป๋าใหม่ก่อนเข้าสู่ด่าน" },
  stock: { cue: "จำนวนสายไม่ถูกต้อง", text: "ชนิดหรือจำนวนสายที่เลือกไม่ตรงกับภารกิจ โปรดจัดกระเป๋าใหม่ก่อนเข้าสู่ด่าน" },
};

/** Centred red "broken formation" dialog for an invalid mission bag. Portalled to <body> above every layer. */
function BagWarning({ problem, onClose }: { problem: BagProblem; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    back.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); return; }
      if (!box.current) return;
      if (e.key !== "Tab") {
        // Nothing behind the dialog reacts to the keyboard while it is open.
        if (!box.current.contains(e.target as Node)) { e.preventDefault(); e.stopPropagation(); }
        return;
      }
      // Keep keyboard focus inside the dialog.
      const items = [...box.current.querySelectorAll<HTMLElement>("button")];
      const i = items.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length]?.focus();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);
  const w = WARNING[problem];
  return createPortal(<div className="cl-warn-veil">
    <div ref={box} className="cl-warn" role="alertdialog" aria-modal="true" aria-labelledby="cl-warn-title" aria-describedby="cl-warn-text">
      <div className="cl-warn-seal" aria-hidden="true">
        <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="30 6 22 8" /><circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".7" /><path d="M32 18v17M32 42v3" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
      </div>
      <span className="cl-warn-cue">{w.cue}</span>
      <h2 id="cl-warn-title">ค่ายกลสายสัญญาณยังไม่สมบูรณ์</h2>
      <p id="cl-warn-text">{w.text}</p>
      <button ref={back} type="button" className="cl-warn-cta" onClick={onClose}>กลับไปจัดกระเป๋า</button>
    </div>
  </div>, document.body);
}

/** In-level bag viewer (🎒 button). Shows what was packed and how much of it this level can use. */
/** `ready`: loose (unplugged) leads of each type still in the room; `onTake` puts one in the player's hands. */
/** `holding`: catalog id + label of the lead in hand (can be put back with `onStow`). */
export function BagOverlay({ bag, usage, ready, holding, onTake, onStow, onClose }: { bag: Record<string, number>; usage: Record<string, number>; ready: Record<string, number>; holding?: { id: string; label: string } | null; onTake: (catalogId: string) => void; onStow: () => void; onClose: () => void }) {
  const entries = Object.entries(bag).map(([id, n]) => ({ c: catalogById(id)!, n, u: usage[id] ?? 0, r: ready[id] ?? 0 }));
  return <div className="cl-overlay" role="dialog" aria-modal="true" aria-labelledby="cl-bag-title" onClick={onClose}>
    <div className="cl-overlay-card" onClick={(e) => e.stopPropagation()}>
      <div className="cl-bag-head"><strong id="cl-bag-title">กระเป๋าสายสัญญาณ</strong><button type="button" className="cl-link" onClick={onClose}>ปิด ✕</button></div>
      {holding && (() => { const c = catalogById(holding.id); return <button type="button" className="cl-bag-pick cl-holding" onClick={onStow}>
        {c ? <CableThumbnail className="bag-cable-thumbnail" cable={c} /> : <span className="bag-info-icon" aria-hidden="true">↯</span>}
        <div><strong>ถืออยู่: {c?.name ?? holding.label}</strong><small>หยิบผิดเส้น? เก็บคืนแล้วเลือกใหม่</small></div>
        <span className="cl-pick-state is-on"><b>เก็บคืนกระเป๋า</b></span>
      </button>; })()}
      {entries.length === 0 && <p className="cl-msg">กระเป๋าว่าง</p>}
      <ul className="cl-bag-list">
        {entries.map(({ c, n, u, r }) => <li key={c.id}>
          <button type="button" className="cl-bag-pick" disabled={r === 0} onClick={() => onTake(c.id)} title={r ? `หยิบ ${c.name}` : u === 0 ? "ด่านนี้ไม่มีพอร์ตรองรับสายนี้" : "ใช้ครบแล้ว"}>
            <CableThumbnail className="bag-cable-thumbnail" cable={c} />
            <div><strong><NoSplit text={c.name} /></strong><small><NoSplit text={c.ends} /></small></div>
            <span className={`cl-pick-state ${r > 0 ? "is-on" : "is-off"}`}>
              {r > 0 ? <><b>เลือกได้</b>{r} เส้น</> : <><b>เลือกไม่ได้</b>{u === 0 ? "ด่านนี้ไม่ใช้" : `ต่อครบแล้ว ${u}/${n}`}</>}
            </span>
          </button>
        </li>)}
      </ul>
      <CatalogCanvas />
      <p className="cl-note"><span className="cl-key">คลิก</span> สายที่ “เลือกได้” เพื่อหยิบขึ้นมือ</p>
    </div>
  </div>;
}
