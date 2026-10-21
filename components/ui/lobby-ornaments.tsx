"use client";

/**
 * Hand-drawn vector ornaments for the cable-prep lobby (no raster images): gold corner filigree, hanging tassels and a
 * rolled-scroll rail. All are decorative (aria-hidden, pointer-events: none) and scale with their panel.
 */

const GOLD = "#e9c27a", GOLD_HI = "#ffe3a3", GOLD_LO = "#8a5f28";

/** One corner flourish (drawn for the top-left corner; the other three are mirrored with CSS). */
function Corner({ at }: { at: "tl" | "tr" | "bl" | "br" }) {
  return <svg className={`lo-corner lo-${at}`} viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <linearGradient id="lo-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={GOLD_HI} /><stop offset=".55" stopColor={GOLD} /><stop offset="1" stopColor={GOLD_LO} /></linearGradient>
    </defs>
    {/* L-shaped rim with a rolled end on each arm */}
    <path d="M4 60 V14 Q4 4 14 4 H60" fill="none" stroke="url(#lo-g)" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M10 56 V18 Q10 10 18 10 H56" fill="none" stroke="url(#lo-g)" strokeWidth="1.1" opacity=".75" />
    <circle cx="60" cy="4" r="2.4" fill={GOLD_HI} /><circle cx="4" cy="60" r="2.4" fill={GOLD_HI} />
    {/* cloud scroll (xiangyun-style curl) and leaf sprigs */}
    <path d="M14 14 C22 8 32 12 30 20 C28 27 19 25 21 19 C22 15 27 16 26 19" fill="none" stroke="url(#lo-g)" strokeWidth="2" strokeLinecap="round" />
    <path d="M30 20 C38 18 44 12 50 14" fill="none" stroke="url(#lo-g)" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M20 30 C18 38 12 44 14 50" fill="none" stroke="url(#lo-g)" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M44 12 q4 -5 9 -3 q-3 5 -9 3z M12 44 q-5 4 -3 9 q5 -3 3 -9z" fill={GOLD} />
    {/* jewel */}
    <path d="M14 8 l3 3 -3 3 -3 -3z" fill="#4fe3ff" stroke={GOLD_HI} strokeWidth=".8" />
  </svg>;
}

/** Four gold corners on any positioned panel. */
export function FrameCorners() {
  return <span className="lo-corners" aria-hidden="true"><Corner at="tl" /><Corner at="tr" /><Corner at="bl" /><Corner at="br" /></span>;
}

/** Hanging tassel: gold cord, carved knot, jade bead and a red silk tassel with gold bands. */
export function Tassel({ side, long = false }: { side: "left" | "right"; long?: boolean }) {
  const cord = long ? 46 : 26;
  return <svg className={`lo-tassel lo-tassel-${side}`} viewBox={`0 0 24 ${cord + 74}`} aria-hidden="true">
    <defs>
      <linearGradient id={`lo-silk-${side}`} x1="0" x2="1"><stop offset="0" stopColor="#7d0d12" /><stop offset=".5" stopColor="#d7262c" /><stop offset="1" stopColor="#7d0d12" /></linearGradient>
    </defs>
    <path d={`M12 0 V${cord}`} stroke={GOLD} strokeWidth="1.6" />
    <circle cx="12" cy={cord + 5} r="5" fill="none" stroke={GOLD_HI} strokeWidth="1.6" />
    <path d={`M7 ${cord + 5} h10 M12 ${cord} v10`} stroke={GOLD} strokeWidth="1.2" />
    <circle cx="12" cy={cord + 15} r="4" fill="#2fbf8f" stroke={GOLD_HI} strokeWidth="1" />
    <rect x="7" y={cord + 20} width="10" height="5" rx="1.5" fill={GOLD} />
    <path d={`M7 ${cord + 25} C6 ${cord + 45} 4 ${cord + 60} 5 ${cord + 70} L19 ${cord + 70} C20 ${cord + 60} 18 ${cord + 45} 17 ${cord + 25} Z`} fill={`url(#lo-silk-${side})`} />
    {[9, 11, 13, 15].map((x) => <path key={x} d={`M${x} ${cord + 28} V${cord + 68}`} stroke="#ff7b7b" strokeWidth=".5" opacity=".6" />)}
    <rect x="6" y={cord + 32} width="12" height="2.5" rx="1" fill={GOLD_HI} />
  </svg>;
}

/** Rolled scroll rail (gold finials + parchment strip) that sits beside the bag's scrollbar. */
export function ScrollRail() {
  return <svg className="lo-scroll" viewBox="0 0 22 200" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="lo-paper" x1="0" x2="1"><stop offset="0" stopColor="#c9b07a" /><stop offset=".5" stopColor="#f3e3b8" /><stop offset="1" stopColor="#b89a5e" /></linearGradient>
      <linearGradient id="lo-rod" x1="0" x2="1"><stop offset="0" stopColor={GOLD_LO} /><stop offset=".5" stopColor={GOLD_HI} /><stop offset="1" stopColor={GOLD_LO} /></linearGradient>
    </defs>
    <rect x="6" y="14" width="10" height="172" rx="2" fill="url(#lo-paper)" opacity=".85" />
    {[40, 80, 120, 160].map((y) => <path key={y} d={`M8 ${y} h6`} stroke="#8a6a3a" strokeWidth=".8" opacity=".6" />)}
    {[4, 186].map((y) => <g key={y}>
      <rect x="2" y={y} width="18" height="10" rx="3" fill="url(#lo-rod)" />
      <circle cx="11" cy={y < 100 ? y - 1 : y + 11} r="3" fill={GOLD_HI} />
    </g>)}
  </svg>;
}

/** ON AIR plaque: red lacquer tablet in a gold frame with cloud wings and a moon jewel on top. */
export function OnAirPlaque() {
  return <span className="lo-onair" aria-hidden="true">
    <svg viewBox="0 0 320 90" className="lo-onair-art">
      <defs>
        <linearGradient id="lo-lac" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e2343a" /><stop offset="1" stopColor="#6e0a10" /></linearGradient>
        <linearGradient id="lo-gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={GOLD_HI} /><stop offset="1" stopColor={GOLD_LO} /></linearGradient>
      </defs>
      {/* cloud wings */}
      {[1, -1].map((d) => <g key={d} transform={d < 0 ? "translate(320 0) scale(-1 1)" : undefined}>
        <path d="M78 48 C60 30 36 34 30 46 C24 58 40 66 50 58 C56 52 50 46 44 50" fill="none" stroke="url(#lo-gf)" strokeWidth="3" strokeLinecap="round" />
        <path d="M74 60 C52 64 26 60 10 50" fill="none" stroke="#7fd8ff" strokeWidth="2.4" strokeLinecap="round" opacity=".8" />
        <path d="M70 36 C58 20 40 16 26 22" fill="none" stroke="url(#lo-gf)" strokeWidth="2" strokeLinecap="round" />
      </g>)}
      {/* tablet */}
      <path d="M86 26 H234 L248 45 L234 64 H86 L72 45 Z" fill="url(#lo-lac)" stroke="url(#lo-gf)" strokeWidth="3.5" />
      <path d="M92 31 H228 L239 45 L228 59 H92 L81 45 Z" fill="none" stroke={GOLD_HI} strokeWidth="1" opacity=".6" />
      {/* moon jewel */}
      <path d="M150 26 Q160 6 170 26" fill="url(#lo-gf)" />
      <circle cx="160" cy="16" r="9" fill="#bfe6ff" stroke={GOLD_HI} strokeWidth="2" />
    </svg>
    <b><i>◆</i> ON AIR</b>
  </span>;
}

/** Pagoda roof cap over the cable-detail panel. */
export function PagodaRoof() {
  return <svg className="lo-roof" viewBox="0 0 400 70" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="lo-tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a3566" /><stop offset="1" stopColor="#0c1230" /></linearGradient></defs>
    <path d="M200 6 L214 20 Q300 26 390 52 L376 60 Q290 40 200 38 Q110 40 24 60 L10 52 Q100 26 186 20 Z" fill="url(#lo-tile)" stroke={GOLD} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M24 60 Q110 40 200 38 Q290 40 376 60" fill="none" stroke={GOLD_HI} strokeWidth="1.2" opacity=".7" />
    <path d="M10 52 q-6 -2 -6 -10 M390 52 q6 -2 6 -10" stroke={GOLD} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <circle cx="200" cy="8" r="4" fill={GOLD_HI} />
  </svg>;
}

/** Spirit swirl drawn behind a catalog card's connector. */
export function SpiritSwirl({ color = "#4fe3ff" }: { color?: string }) {
  return <svg className="lo-swirl" viewBox="0 0 120 90" aria-hidden="true">
    <path d="M14 62 C30 30 70 22 96 34 C114 42 108 64 86 66 C66 68 60 50 74 46" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity=".75" />
    <path d="M20 72 C44 78 82 76 104 58" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity=".45" />
    <path d="M8 50 C18 40 30 36 40 38" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity=".4" />
  </svg>;
}

/** Round gold medallion for the footer scroll bar. */
export function Medallion() {
  return <svg className="lo-medal" viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="17" fill="#1a1208" stroke={GOLD} strokeWidth="2.5" />
    <circle cx="20" cy="20" r="11" fill="none" stroke={GOLD_HI} strokeWidth="1.2" />
    <path d="M20 10 L23 20 L20 30 L17 20 Z" fill={GOLD} />
    <circle cx="20" cy="20" r="3" fill="#4fe3ff" />
  </svg>;
}

/** Category tab icons (line drawings). */
export function CategoryIcon({ id }: { id: string }) {
  const s = { fill: "none", stroke: "#ffe3a3", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <svg className="lo-cat" viewBox="0 0 32 32" aria-hidden="true">
    {id === "video" && <><rect x="5" y="7" width="22" height="15" rx="2" {...s} /><path d="M12 26 h8 M16 22 v4" {...s} /><rect x="9" y="11" width="9" height="7" rx="1" fill="#ffe3a3" opacity=".35" /></>}
    {id === "fiber" && <>{[0, 45, 90, 135].map((a) => <path key={a} d="M16 4 Q22 16 16 28" {...s} transform={`rotate(${a} 16 16)`} />)}<circle cx="16" cy="16" r="3" fill="#4fe3ff" /></>}
    {id === "audio" && <><path d="M12 24 V8 l12 -3 v16" {...s} /><circle cx="9" cy="24" r="3.5" {...s} /><circle cx="21" cy="21" r="3.5" {...s} /></>}
    {id === "stagebox" && <><rect x="6" y="5" width="20" height="22" rx="2" {...s} /><path d="M10 11 h12 M10 16 h12 M10 21 h12" {...s} /></>}
    {id === "usb" && <><path d="M16 4 v22" {...s} /><path d="M12 8 l4 -4 4 4" {...s} /><path d="M16 18 l-6 -4 v-3 M16 22 l6 -4 v-3" {...s} /><circle cx="16" cy="27" r="2.5" fill="#ffe3a3" /></>}
    {id === "network" && <><path d="M11 11 a4 4 0 1 1 4 -4 v18 a4 4 0 1 1 -4 -4 h10 a4 4 0 1 1 -4 4 v-18 a4 4 0 1 1 4 4 z" {...s} strokeWidth={1.8} /></>}
    {id === "control" && <><circle cx="16" cy="16" r="11" {...s} /><circle cx="16" cy="16" r="6" {...s} /><circle cx="16" cy="16" r="2" fill="#ffe3a3" /></>}
    {id === "accessory" && <><circle cx="11" cy="16" r="5" {...s} /><circle cx="22" cy="16" r="5" {...s} /><path d="M16 16h1 M6 8l4-3 M22 27l4-3" {...s} /></>}
  </svg>;
}
