"use client";

import { useTrainingStore } from "@/game/stores/training-store";
import { requirementDone, scenarioOf, targetInstruction, trainingProgress, trainingTotal } from "@/game/training/hdmi-training";
import type { FlowGroup } from "@/game/training/scenarios";
import { ControlsGuide } from "@/components/ui/controls-guide";

import { useState } from "react";

export function TrainingHud({ title, difficultyLabel, objective, touch }: { title: string; difficultyLabel?: string; objective?: string; touch: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const state = useTrainingStore();
  const pickMode = state.pickMode;
  const progress = trainingProgress(state);

  const scenario = scenarioOf(state);
  const total = trainingTotal(state);
  // Checklist in signal-flow order: each group lists its cable routes, then its procedural steps.
  const GROUPS: { id: FlowGroup; title: string }[] = [
    { id: "video", title: "ภาพ · VIDEO INPUT" },
    { id: "audio", title: "เสียง · AUDIO INPUT" },
    { id: "capture", title: "บันทึก · CAPTURE / OBS" },
    { id: "monitor", title: "ตรวจ · MONITORING" },
  ];
  const rows = GROUPS.map((group) => ({
    ...group,
    items: [
      ...scenario.requirements.filter((r) => r.group === group.id).map((r) => ({ id: r.id, label: r.verified ? r.label : `${r.label} *`, done: requirementDone(state, r) })),
      ...scenario.actions.filter((a) => a.group === group.id).map((a) => ({ id: a.id, label: a.label, done: Boolean(state.actionsDone[a.id]) })),
    ],
  })).filter((group) => group.items.length > 0);
  const heldCable = state.held ? scenario.cables.find((c) => c.id === state.held!.cableId) : null;

  // Interaction prompt text
  const instruction = targetInstruction(state, state.focusedTarget);

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
          {objective && <p className="hud-panel-sub">{objective}</p>}
          {scenario.job && <p className="hud-panel-sub">งาน: {scenario.job}</p>}
          {pickMode !== "whole" && <p className="hud-pick-mode" role="status">{`โหมด ${pickMode === "a" ? 1 : 2} · ${touch ? "เล็งสายแล้วแตะปุ่มใช้งาน" : "กด E ที่สาย"}เพื่อหยิบเฉพาะ${pickMode === "a" ? "หัวสาย" : "ปลายสาย"}`} ({touch ? "แตะปุ่มเลขเดิมซ้ำ" : "กดเลขซ้ำ"}เพื่อยกเลิก)</p>}
          {scenario.venueScale && state.heldItem && <p className="hud-panel-sub" role="status">กำลังถือ: {scenario.placeables.find((p) => p.id === state.heldItem)?.label} → นำไปที่ {scenario.placeables.find((p) => p.id === state.heldItem)?.zoneLabel ?? "ตำแหน่งใช้งาน"}</p>}
          {scenario.venueScale && <p className="hud-panel-sub" role="status">Program: {state.programSource ?? "ยังไม่เลือกแหล่งภาพ"} · {state.actionsDone["obs-ready"] ? "OBS จำลองพร้อม" : state.actionsDone["encoder-ready"] ? "Encoder จำลองพร้อม" : "ตรวจเส้นทางตามรายการ"}</p>}
          {scenario.faults?.map(fault => <p className="hud-check-note" key={fault}>{fault}</p>)}
          <div className="hud-panel-sub">
            <span>◈</span>
            <span>ความคืบหน้า: {progress}/{total} ขั้น</span>
          </div>

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
            {rows.length > 1 && <small className="hud-check-note">{scenario.venueScale ? "* แบบจำลองเพื่อฝึกเส้นทาง รุ่นและพอร์ตที่ระบุว่ารอยืนยันยังต้องตรวจของจริง" : "* เส้นทางชั่วคราว รอตรวจสายจริงในห้อง"}</small>}
          </div>
        </aside>
      )}

      {/* Bottom-Left Controls Guide (REF 09) */}
      {!touch && <ControlsGuide />}

      {/* Center Bottom Interaction Prompt (REF 09) */}
      <div className={`interaction-prompt-center${touch ? " is-touch" : ""}`} role="status">
        {(state.held || state.heldItem) && (
          <div className="prompt-holding-pill">
            <span>{heldCable ? `กำลังถือ${heldCable.label}` : `กำลังถือ${state.items[state.heldItem!].label}`} · {touch ? "ใช้ปุ่มวางบนโต๊ะกลาง · ปุ่มหมุนปรับครั้งละ 45°" : "เล็งจุดบนโต๊ะกลางแล้วกด F วาง · R หมุน 45°"}</span>
          </div>
        )}

        <div className="prompt-action-pill">
          <span className="prompt-action-key">{touch ? "แตะ" : "E"}</span>
          <span>{instruction.replace(/^[EF] · /, "") || "โต้ตอบอุปกรณ์"}</span>
        </div>
      </div>

      {/* Notice feedback banner if triggered */}
      {state.notice && (
        <div
          className={`training-feedback glass tone-${state.notice.tone}`}
          style={{
            position: "absolute",
            top: "90px",
            right: "28px",
            padding: "10px 16px",
            borderRadius: "8px",
            background: state.notice.tone === "success" ? "rgba(16, 185, 129, 0.2)" : state.notice.tone === "error" ? "rgba(239, 68, 68, 0.2)" : "rgba(85, 214, 255, 0.18)",
            border: `1px solid ${state.notice.tone === "success" ? "var(--success)" : state.notice.tone === "error" ? "var(--danger)" : "var(--cyan-primary)"}`,
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            fontSize: "0.82rem",
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
