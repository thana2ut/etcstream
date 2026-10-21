"use client";

import { useTrainingStore } from "@/game/stores/training-store";
import { missionRoutes, requirementDone, scenarioOf, targetInstruction } from "@/game/training/hdmi-training";
import type { FlowGroup } from "@/game/training/scenarios";
import { ControlsGuide } from "@/components/ui/controls-guide";
import { MAX_WRONG_STREAK } from "@/game/content/cable-catalog";
import { MAX_MISSION_CONNECTION_MISTAKES } from "@/game/stores/training-store";
import { playerEquipmentText } from "@/game/content/sim-thai";

import { useEffect, useState } from "react";

type PromptKey = "E" | "F" | "hold";
const KEY_LABEL: Record<PromptKey, string> = { E: "E", F: "F", hold: "กด E ค้าง" };
const TOUCH_KEY: Record<PromptKey, string> = { E: "แตะ", F: "วาง", hold: "แตะค้าง" };
/** Split "E · …" / "F · …" / "E ค้าง 2 วิ · …" into the key to show and the text; plain hints get no key. */
function parsePrompt(instruction: string): { key: PromptKey | null; text: string } {
  const hold = instruction.match(/^E ค้าง (\S+ วิ) · (.*)$/);
  if (hold) return { key: "hold", text: `${hold[1]} · ${hold[2]}` };
  const m = instruction.match(/^([EF]) · (.*)$/);
  return m ? { key: m[1] as PromptKey, text: m[2] } : { key: null, text: instruction };
}

export function TrainingHud({ title, difficultyLabel, objective, touch }: { title: string; difficultyLabel?: string; objective?: string; touch: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const state = useTrainingStore();
  // The status banner shows each new action's result for 3.5 s, then clears itself.
  const notice = state.notice;
  const clearNotice = state.clearNotice;
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(clearNotice, 3500);
    return () => window.clearTimeout(t);
  }, [notice, clearNotice]);
  const pickMode = state.pickMode;
  const scenario = scenarioOf(state);
  const [showFinalWarning, setShowFinalWarning] = useState(false);
  useEffect(() => {
    if (!scenario.stage || state.wrongStreak !== MAX_MISSION_CONNECTION_MISTAKES || state.failed) return;
    const show = window.setTimeout(() => setShowFinalWarning(true), 0);
    const hide = window.setTimeout(() => setShowFinalWarning(false), 3200);
    return () => { window.clearTimeout(show); window.clearTimeout(hide); };
  }, [scenario.stage, state.wrongStreak, state.failed]);
  // Checklist in signal-flow order: each group lists its cable routes, then its procedural steps.
  const GROUPS: { id: FlowGroup; title: string }[] = [
    { id: "video", title: "สัญญาณภาพ" },
    { id: "audio", title: "สัญญาณเสียง" },
    { id: "capture", title: "รับภาพและบันทึก" },
    { id: "monitor", title: "ตรวจสัญญาณ" },
  ];
  // Mission stages tick by the same rule that completes the level (accepted equivalent ports count).
  const routeDone = scenario.stage ? new Map(missionRoutes(state).map((r) => [r.id, r.done])) : null;
  const connectionRows = GROUPS.map((group) => ({
    ...group,
    items: [
      ...scenario.requirements.filter((r) => r.group === group.id).map((r) => ({ id: r.id, label: r.label, done: routeDone?.get(`${r.from[0]}>${r.to[0]}`) ?? requirementDone(state, r) })),
      ...scenario.actions.filter((a) => a.group === group.id).map((a) => ({ id: a.id, label: a.label, done: Boolean(state.actionsDone[a.id]) })),
    ],
  })).filter((group) => group.items.length > 0);
  // Mission stages: one line per required cable route; ✓ as soon as both ends sit on the right ports.
  const rows = scenario.stage && scenario.requirements.length === 0
    ? [{ id: "routes", title: "สายที่ต้องต่อ", items: missionRoutes(state).map((route) => ({ id: route.id, label: route.done ? `${route.label} · ต่อสายสำเร็จ` : route.label, done: route.done })) }]
    : connectionRows;
  const extraCheck = scenario.id === "hdmi-basic" ? 1 : 0;
  const total = rows.reduce((sum, group) => sum + group.items.length, extraCheck);
  const progress = rows.reduce((sum, group) => sum + group.items.filter((item) => item.done).length, scenario.id === "hdmi-basic" && state.completed ? 1 : 0);
  const heldCable = state.held ? scenario.cables.find((c) => c.id === state.held!.cableId) : null;

  // Interaction prompt text
  const instruction = targetInstruction(state, state.focusedTarget);
  const prompt = parsePrompt(instruction);

  return (
    <>
      {/* Top-Left Objective Checklist Panel (REF 09) */}
      {isCollapsed ? (
        <button
          type="button"
          className="hud-objective-mini-pill"
          onClick={() => setIsCollapsed(false)}
          aria-label="เปิดแผงภารกิจ"
        >
          <span className="mini-pill-glyph">◈</span>
          <span className="mini-pill-text">ภารกิจ ({progress}/{total})</span>
          <span className="mini-pill-arrow">▾</span>
        </button>
      ) : (
        <aside className="hud-objective-panel glass-card hud-panel" aria-label="ภารกิจปัจจุบัน">
          <div className="hud-panel-top-row">
            <h3 className="hud-panel-title">{title}</h3>
            <button
              type="button"
              className="hud-collapse-btn"
              onClick={() => setIsCollapsed(true)}
              title="ย่อแผงภารกิจ"
              aria-label="ย่อแผงภารกิจ"
            >
              −
            </button>
          </div>
          {difficultyLabel && <strong className="mission-level-label">{difficultyLabel}</strong>}
          {/* Mission levels keep the panel compact like free practice: title, progress, grouped checklist. */}
          {objective && !scenario.venueScale && <p className="hud-panel-sub">{objective}</p>}
          {scenario.job && !scenario.venueScale && <p className="hud-panel-sub">งาน: {scenario.job}</p>}
          {pickMode !== "whole" && <p className="hud-pick-mode" role="status">{`โหมด ${pickMode === "a" ? 1 : 2} · ${touch ? "เล็งสายแล้วแตะปุ่มใช้งาน" : "กด E ที่สาย"}เพื่อหยิบเฉพาะ${pickMode === "a" ? "หัวสาย" : "ปลายสาย"}`} ({touch ? "แตะปุ่มเลขเดิมซ้ำ" : "กดเลขซ้ำ"}เพื่อยกเลิก)</p>}
          {scenario.venueScale && state.heldItem && <p className="hud-panel-sub" role="status">กำลังถือ: {playerEquipmentText(scenario.placeables.find((p) => p.id === state.heldItem)?.label ?? "อุปกรณ์")} → นำไปที่ {scenario.placeables.find((p) => p.id === state.heldItem)?.zoneLabel ?? "ตำแหน่งใช้งาน"}</p>}
          {scenario.stage && state.held && (() => {
            const cable = scenario.cables.find((c) => c.id === state.held!.cableId);
            const lead = state.cables[state.held.cableId];
            return <p className="hud-panel-sub" role="status">{cable?.id} · {cable?.ends.join(" ↔ ")} · {lead.a.portId || lead.b.portId ? "ปลายแรกติดแล้ว นำปลายที่เหลือไปต่อ" : "เลือกพอร์ตสำหรับปลายแรก"}</p>;
          })()}
          <div className="hud-panel-sub">
            <span>◈</span>
            <span>{scenario.stage && scenario.requirements.length > 0 ? "ต่อสายถูกต้อง" : "ความคืบหน้า"}: {progress}/{total} ขั้น</span>
          </div>
          {scenario.stage && !state.completed && !state.failed && <p className="hud-panel-sub mission-mistake-count" role="status">ความผิดพลาด {state.wrongStreak}/{MAX_MISSION_CONNECTION_MISTAKES}</p>}
          {scenario.venueScale && !scenario.stage && !state.completed && <p className="hud-panel-sub" role="status">ต่อผิดติดต่อกัน: {state.wrongStreak}/{MAX_WRONG_STREAK}</p>}
          {scenario.venueScale && state.completed && <p className="hud-panel-sub" role="status" style={{ color: "var(--success)", fontWeight: 700 }}>✓ ผ่านด่านแล้ว — ครบทุกเงื่อนไข</p>}

          <div className="hud-checklist">
            {rows.map((group) => (
              <div key={group.id} className="hud-check-group">
                {rows.length > 1 && <span className="hud-check-group-title">{group.title}</span>}
                {group.items.map((item) => (
                  <div key={item.id} className="hud-check-item">
                    <div><span>{item.label}</span></div>
                    <div className={`hud-checkbox-square ${item.done ? "is-done" : ""}`}>{item.done && <span>✓</span>}</div>
                  </div>
                ))}
              </div>
            ))}
            {scenario.id === "hdmi-basic" && (
              <div className="hud-check-item">
                <div><span>ตรวจหาสัญญาณภาพ</span></div>
                <div className={`hud-checkbox-square ${state.completed ? "is-done" : ""}`}>{state.completed && <span>✓</span>}</div>
              </div>
            )}
            {scenario.venueScale && scenario.faults?.map((fault) => <small className="hud-check-note" key={fault}>⚠ {fault}</small>)}
          </div>
        </aside>
      )}

      {/* Bottom-Left Controls Guide (REF 09) */}
      {showFinalWarning && !state.failed && <div className="mission-final-warning" role="alert"><strong>คำเตือนครั้งสุดท้าย</strong><span>ท่านผิดพลาดครบ 3 ครั้งแล้ว หากต่อสายผิดอีกครั้ง ภารกิจจะล้มเหลวทันที</span></div>}
      {!touch && <ControlsGuide />}

      {/* Center Bottom Interaction Prompt (REF 09) */}
      <div className={`interaction-prompt-center${touch ? " is-touch" : ""}`} role="status">
        {(state.held || state.heldItem) && (
          <div className="prompt-holding-pill">
            <span>{heldCable ? `กำลังถือ${heldCable.label}` : `กำลังถือ${playerEquipmentText(state.items[state.heldItem!]?.label ?? "อุปกรณ์")}`}</span>
          </div>
        )}

        {/* The key badge follows the action: E pick up / connect / unplug, F put down, E-hold inspect; none for info only. */}
        <div className={`prompt-action-pill${prompt.key ? "" : " is-info"}`}>
          {prompt.key && <span className={`prompt-action-key key-${prompt.key}`}>{touch ? TOUCH_KEY[prompt.key] : KEY_LABEL[prompt.key]}</span>}
          <span title={prompt.text || undefined}>{prompt.text || "โต้ตอบอุปกรณ์"}</span>
        </div>
      </div>

      {/* Notice feedback banner if triggered */}
      {state.notice && (
        <div
          className={`training-feedback hud-notice glass tone-${state.notice.tone}`}
          style={{
            // Top-centre under the header: clear of the objective panel (left) and the look-control button (right).
            position: "absolute",
            top: "84px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "max-content",
            maxWidth: "min(680px, calc(100vw - 32px))",
            lineHeight: 1.6,
            textAlign: "center",
            padding: "10px 16px",
            borderRadius: "8px",
            background: state.notice.tone === "success" ? "rgba(6, 44, 35, 0.97)" : state.notice.tone === "error" ? "rgba(57, 16, 25, 0.97)" : "rgba(9, 28, 48, 0.97)",
            border: `1px solid ${state.notice.tone === "success" ? "var(--success)" : state.notice.tone === "error" ? "var(--danger)" : "var(--cyan-primary)"}`,
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            fontSize: "0.95rem",
            zIndex: 50,
          }}
          role="status"
        >
          <strong style={{ color: state.notice.tone === "success" ? "var(--success)" : state.notice.tone === "error" ? "var(--danger)" : "var(--cyan-primary)" }}>
            {state.notice.title}
          </strong>
          <span style={{ color: "var(--text-secondary)" }}>{state.notice.detail}</span>
        </div>
      )}
    </>
  );
}
