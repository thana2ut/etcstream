"use client";

import { useTrainingStore } from "@/game/stores/training-store";
import { targetInstruction, trainingProgress } from "@/game/training/hdmi-training";
import { ControlsGuide } from "@/components/ui/controls-guide";

import { useState } from "react";

export function TrainingHud({ title, difficultyLabel, objective, touch }: { title: string; difficultyLabel?: string; objective?: string; touch: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const state = useTrainingStore();
  const progress = trainingProgress(state);

  // Check connection stages
  const isCameraToSwitcher = Object.values(state.cables).some((c) => {
    const a = c.a.portId;
    const b = c.b.portId;
    return (
      (a === "camera:hdmi-out" && b === "switcher:hdmi-in") ||
      (a === "switcher:hdmi-in" && b === "camera:hdmi-out")
    );
  });

  const isSwitcherToMonitor = Object.values(state.cables).some((c) => {
    const a = c.a.portId;
    const b = c.b.portId;
    return (
      (a === "switcher:hdmi-out" && b === "monitor:hdmi-in") ||
      (a === "monitor:hdmi-in" && b === "switcher:hdmi-out")
    );
  });

  const isSignalActive = state.completed;

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
          <span className="mini-pill-text">ภารกิจ ({progress}/2)</span>
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
          <div className="hud-panel-sub">
            <span>◈</span>
            <span>ความคืบหน้า: {progress}/2 เส้นทาง</span>
          </div>

          <div className="hud-checklist">
            <div className="hud-check-item">
              <div>
                <span className="check-num-badge">1</span>
                <span>Camera → Switcher</span>
              </div>
              <div className={`hud-checkbox-square ${isCameraToSwitcher ? "is-done" : ""}`}>
                {isCameraToSwitcher && <span>✓</span>}
              </div>
            </div>

            <div className="hud-check-item">
              <div>
                <span className="check-num-badge">2</span>
                <span>Switcher → Monitor</span>
              </div>
              <div className={`hud-checkbox-square ${isSwitcherToMonitor ? "is-done" : ""}`}>
                {isSwitcherToMonitor && <span>✓</span>}
              </div>
            </div>

            <div className="hud-check-item">
              <div>
                <span className="check-num-badge">3</span>
                <span>ตรวจหาสัญญาณภาพ</span>
              </div>
              <div className={`hud-checkbox-square ${isSignalActive ? "is-done" : ""}`}>
                {isSignalActive && <span>✓</span>}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Bottom-Left Controls Guide (REF 09) */}
      {!touch && <ControlsGuide />}

      {/* Center Bottom Interaction Prompt (REF 09) */}
      <div className="interaction-prompt-center" role="status">
        {(state.held || state.heldItem) && (
          <div className="prompt-holding-pill">
            <span>{state.held ? "กำลังถือสาย HDMI" : `กำลังถือ${state.items[state.heldItem!].label}`} · กด F เพื่อวางบนโต๊ะกลาง</span>
          </div>
        )}

        <div className="prompt-action-pill">
          <span className="prompt-action-key">E</span>
          <span>{instruction.replace(/^E · /, "") || "โต้ตอบอุปกรณ์"}</span>
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
