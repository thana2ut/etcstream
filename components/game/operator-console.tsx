"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { useTrainingStore } from "@/game/stores/training-store";
import { CONCEPTS } from "@/game/training/sim/library";
import { simThai } from "@/game/content/sim-thai";

// The Operator Console (C) was removed: missions complete from the physical wiring alone.
// Only the mistake review overlay (shown after repeated wrong connections) remains here.
const C = {
  panel: { position: "absolute", inset: "64px max(16px, calc(50vw - 560px)) 16px", zIndex: 60, display: "flex", flexDirection: "column", background: "rgba(6, 13, 26, 0.96)", border: "1px solid #3b5372", borderRadius: 10, color: "#e8eef6", fontFamily: "inherit", boxShadow: "0 18px 60px rgba(0,0,0,.55)" } as CSSProperties,
  head: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid #24364d", flexWrap: "wrap" } as CSSProperties,
  body: { flex: 1, minHeight: 0, lineHeight: 1.65, overflowWrap: "anywhere", overflow: "auto", padding: "12px 16px" } as CSSProperties,
  btn: { background: "#15263d", color: "#e8eef6", borderWidth: 1, borderStyle: "solid", borderColor: "#3b5372", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: "0.95em", minHeight: 44 } as CSSProperties,
  on: { background: "#e7c98f", color: "#10131a", borderColor: "#e7c98f" } as CSSProperties,
  muted: { color: "#93a7bf" } as CSSProperties,
  card: { border: "1px solid #24364d", borderRadius: 8, padding: "10px 12px", marginBottom: 10, background: "rgba(20,34,54,.5)" } as CSSProperties,
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.95em" } as CSSProperties,
};

function H({ children }: { children: ReactNode }) { return <h4 style={{ margin: "4px 0 8px", color: "#e7c98f", fontSize: "1em" }}>{children}</h4>; }

/** Mission Paused → Targeted Learning Review → Mini Mastery Check → Resume. */
export function ReviewOverlay() {
  const sim = useTrainingStore((s) => s.sim);
  const review = useTrainingStore((s) => s.review);
  useEffect(() => { if (sim?.paused && document.pointerLockElement) document.exitPointerLock(); }, [sim?.paused]);
  if (!sim?.paused || !sim.reviewConcept) return null;
  const c = CONCEPTS[sim.reviewConcept];
  const last = [...sim.log].reverse().find((l) => l.kind === "reject");
  return <div style={{ position: "absolute", inset: 0, zIndex: 80, display: "grid", placeItems: "center", background: "rgba(3,8,16,.78)" }} role="alertdialog" aria-label="พักภารกิจเพื่อทบทวนจุดที่ยังไม่เข้าใจ">
    <div style={{ ...C.card, maxWidth: 560, background: "#0b1626", color: "#e8eef6", padding: 20 }}>
      <H>พักภารกิจเพื่อทบทวนจุดที่ยังไม่เข้าใจ</H>
      <p style={C.muted}>พบข้อผิดพลาดที่มีผลต่องาน 3 ครั้ง ครั้งล่าสุด: {simThai(last?.text ?? "")}</p>
      <p><b>{c.title}.</b> {c.review}</p>
      <H>คำถามทบทวนความเข้าใจ</H>
      <p>{c.check.q}</p>
      {c.check.options.map((o, i) => <button key={o} style={{ ...C.btn, display: "block", width: "100%", textAlign: "left", margin: "4px 0" }} onClick={() => review(i)}>{o}</button>)}
    </div>
  </div>;
}
