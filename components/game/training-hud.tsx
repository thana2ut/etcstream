"use client";

import { useTrainingStore } from "@/game/stores/training-store";
import { requirementDone, scenarioOf, targetInstruction, trainingProgress, trainingTotal } from "@/game/training/hdmi-training";
import type { FlowGroup } from "@/game/training/scenarios";
import { ControlsGuide } from "@/components/ui/controls-guide";
import { MAX_WRONG_STREAK } from "@/game/content/cable-catalog";

import { useEffect, useState } from "react";

type PromptKey = "E" | "F" | "hold";
const KEY_LABEL: Record<PromptKey, string> = { E: "E", F: "F", hold: "Hold E" };
const TOUCH_KEY: Record<PromptKey, string> = { E: "Tap", F: "Drop", hold: "Hold" };
/** Split "E · …" / "F · …" / "E hold 2 s · …" into the key to show and the text; plain hints get no key. */
function parsePrompt(instruction: string): { key: PromptKey | null; text: string } {
  const hold = instruction.match(/^E hold (\S+ s) · (.*)$/);
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
  const progress = trainingProgress(state);

  const scenario = scenarioOf(state);
  const total = trainingTotal(state);
  // Checklist in signal-flow order: each group lists its cable routes, then its procedural steps.
  const GROUPS: { id: FlowGroup; title: string }[] = [
    { id: "video", title: "VIDEO INPUT" },
    { id: "audio", title: "AUDIO INPUT" },
    { id: "capture", title: "CAPTURE / STREAM" },
    { id: "monitor", title: "MONITORING" },
  ];
  const rows = GROUPS.map((group) => ({
    ...group,
    items: [
      ...scenario.requirements.filter((r) => r.group === group.id).map((r) => ({ id: r.id, label: r.verified || scenario.venueScale ? r.label : `${r.label} *`, done: requirementDone(state, r) })),
      ...scenario.actions.filter((a) => a.group === group.id).map((a) => ({ id: a.id, label: a.label, done: Boolean(state.actionsDone[a.id]) })),
    ],
  })).filter((group) => group.items.length > 0);
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
          aria-label="Open the mission panel"
        >
          <span className="mini-pill-glyph">◈</span>
          <span className="mini-pill-text">Mission ({progress}/{total})</span>
          <span className="mini-pill-arrow">▾</span>
        </button>
      ) : (
        <aside className="hud-objective-panel glass-card hud-panel" aria-label="Current mission">
          <div className="hud-panel-top-row">
            <h3 className="hud-panel-title">{title}</h3>
            <button
              type="button"
              className="hud-collapse-btn"
              onClick={() => setIsCollapsed(true)}
              title="Collapse the mission panel"
              aria-label="Collapse the mission panel"
            >
              −
            </button>
          </div>
          {difficultyLabel && <strong className="mission-level-label">{difficultyLabel}</strong>}
          {/* Mission levels keep the panel compact like free practice: title, progress, grouped checklist. */}
          {objective && !scenario.venueScale && <p className="hud-panel-sub">{objective}</p>}
          {scenario.job && !scenario.venueScale && <p className="hud-panel-sub">Job: {scenario.job}</p>}
          {pickMode !== "whole" && <p className="hud-pick-mode" role="status">{`Mode ${pickMode === "a" ? 1 : 2} · ${touch ? "aim at a cable and tap Use" : "press E on a cable"} to take only its ${pickMode === "a" ? "head" : "tail"}`} ({touch ? "tap the same number again" : "press the number again"} to cancel)</p>}
          {scenario.venueScale && state.heldItem && <p className="hud-panel-sub" role="status">Carrying: {scenario.placeables.find((p) => p.id === state.heldItem)?.label} → take it to {scenario.placeables.find((p) => p.id === state.heldItem)?.zoneLabel ?? "its station"}</p>}
          <div className="hud-panel-sub">
            <span>◈</span>
            <span>Progress: {progress}/{total} checks</span>
          </div>
          {scenario.venueScale && !state.completed && (state.sim
            ? <p className="hud-panel-sub" role="status" style={{ color: state.sim.errors >= 2 ? "var(--danger)" : undefined }}>Errors before targeted review: {state.sim.errors}/3 · press C for the Operator Console</p>
            : <p className="hud-panel-sub" role="status" style={{ color: state.wrongStreak >= 3 ? "var(--danger)" : undefined }}>Wrong connections in a row: {state.wrongStreak}/{MAX_WRONG_STREAK}</p>)}
          {scenario.venueScale && state.completed && <p className="hud-panel-sub" role="status" style={{ color: "var(--success)", fontWeight: 700 }}>✓ Stage passed — every condition met</p>}

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
                <div><span>Check for a picture</span></div>
                <div className={`hud-checkbox-square ${state.completed ? "is-done" : ""}`}>{state.completed && <span>✓</span>}</div>
              </div>
            )}
            {scenario.venueScale && scenario.faults?.map((fault) => <small className="hud-check-note" key={fault}>⚠ {fault}</small>)}
            {rows.length > 1 && <small className="hud-check-note">{scenario.venueScale ? "Generic devices are labelled training stand-ins; named models list their manufacturer source in the console." : "* Provisional route — verify against the real room cabling"}</small>}
          </div>
        </aside>
      )}

      {/* Bottom-Left Controls Guide (REF 09) */}
      {!touch && <ControlsGuide />}

      {/* Center Bottom Interaction Prompt (REF 09) */}
      <div className={`interaction-prompt-center${touch ? " is-touch" : ""}`} role="status">
        {(state.held || state.heldItem) && (
          <div className="prompt-holding-pill">
            <span>{heldCable ? `Holding ${heldCable.label}` : `Holding ${state.items[state.heldItem!].label}`} · {touch ? "use Drop to set it down · Turn rotates 45°" : "aim at a surface and press F to set down · T turns 45°"}</span>
          </div>
        )}

        {/* The key badge follows the action: E pick up / connect / unplug, F put down, E-hold inspect; none for info only. */}
        <div className={`prompt-action-pill${prompt.key ? "" : " is-info"}`}>
          {prompt.key && <span className={`prompt-action-key key-${prompt.key}`}>{touch ? TOUCH_KEY[prompt.key] : KEY_LABEL[prompt.key]}</span>}
          <span>{prompt.text || "Interact"}</span>
        </div>
      </div>

      {/* Notice feedback banner if triggered */}
      {state.notice && (
        <div
          className={`training-feedback glass tone-${state.notice.tone}`}
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
