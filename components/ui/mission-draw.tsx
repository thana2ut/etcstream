"use client";

import { ActionButton } from "./action-buttons";

/**
 * Top box of the mission hall: "Take a mission" (and the one-time "New mission 0/1").
 * The draw itself is shown on the venue cards below — a highlight runs across them and stops on the assignment.
 */
export function MissionDrawPanel({ rolling, canDraw, canReroll, rerollsUsed, maxRerolls, drawnTitle, drawnCleared, onRoll, onReroll, onOpen }: {
  rolling: boolean;
  canDraw: boolean;
  canReroll: boolean;
  rerollsUsed: number;
  maxRerolls: number;
  drawnTitle: string | null;
  drawnCleared: number;
  onRoll: () => void;
  onReroll: () => void;
  /** Opens the detail page of the current assignment (levels + start). */
  onOpen: () => void;
}) {
  const status = rolling
    ? "The hall is choosing your mission..."
    : drawnTitle
      ? canDraw
        ? `“${drawnTitle}”: all 5 levels cleared — you may take a new mission`
        : `Your mission: “${drawnTitle}” · ${drawnCleared}/5 levels cleared — clear all 5 to take a new one`
      : "Take a mission and the hall assigns you one chapter";
  const showReroll = !canDraw && Boolean(drawnTitle);
  return <section className="mission-draw glass-card gold-border-frame" aria-labelledby="mission-draw-title">
    <div className="mission-draw-order">
      <span className="mission-hall-eyebrow">Academy mission</span>
      <h2 id="mission-draw-title">Take a mission</h2>
      <p aria-live="polite">{status}</p>
      {showReroll && !rolling && <small>{canReroll ? "Not this one? You may redraw once" : drawnCleared > 0 ? "Already started — no redraw" : "Redraw used — start this mission"}</small>}
    </div>
    <div className="mission-draw-actions">
      {/* With an assignment in progress the main button opens it instead of sitting disabled. */}
      {showReroll && !rolling
        ? <ActionButton variant="gold" size="lg" onClick={onOpen}>Open the mission</ActionButton>
        : <ActionButton variant="gold" size="lg" disabled={!canDraw || rolling} onClick={onRoll}>{rolling ? "Drawing..." : "Take a mission"}</ActionButton>}
      {showReroll && <ActionButton variant="cyan" size="md" disabled={!canReroll || rolling} onClick={onReroll}>New mission {rerollsUsed}/{maxRerolls}</ActionButton>}
    </div>
  </section>;
}
