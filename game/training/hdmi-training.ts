import { nearestTablePlacement, STUDIO } from "./studio-room-layout";
import { feedbackCopy } from "@/game/content/feedback-copy";
import { missionS001 } from "@/game/missions/mission-s-001";

export type Point3 = [number, number, number];
export type CableId = "cable-1" | "cable-2";
export type CableEnd = "a" | "b";
export type PortId = "camera:hdmi-out" | "switcher:hdmi-in" | "switcher:hdmi-out" | "monitor:hdmi-in";
export type PlaceableItemId = "capture-card" | "signal-adapter";
export type TrainingTarget =
  | { kind: "end"; cableId: CableId; end: CableEnd }
  | { kind: "port"; portId: PortId }
  | { kind: "item"; itemId: PlaceableItemId };

export const HDMI_PORTS: Record<PortId, { label: string; direction: "INPUT" | "OUTPUT"; device: string; position: Point3 }> = {
  "camera:hdmi-out": { label: "Camera HDMI OUT", direction: "OUTPUT", device: "camera", position: STUDIO.ports["camera:hdmi-out"] },
  "switcher:hdmi-in": { label: "Video Switcher HDMI IN", direction: "INPUT", device: "switcher", position: STUDIO.ports["switcher:hdmi-in"] },
  "switcher:hdmi-out": { label: "Video Switcher HDMI OUT", direction: "OUTPUT", device: "switcher", position: STUDIO.ports["switcher:hdmi-out"] },
  "monitor:hdmi-in": { label: "Monitor HDMI IN", direction: "INPUT", device: "monitor", position: STUDIO.ports["monitor:hdmi-in"] },
};

export const CABLE_IDS: readonly CableId[] = ["cable-1", "cable-2"];
export const CABLE_ENDS: readonly CableEnd[] = ["a", "b"];
export const CABLE_COLORS: Record<CableId, string> = { "cable-1": "#e9bd6a", "cable-2": "#62dce9" };

interface EndState { portId: PortId | null; loosePosition: Point3 }
export interface PlaceableItemState { label: string; position: Point3 }
export interface CableState { a: EndState; b: EndState }
export interface HeldEnd { cableId: CableId; end: CableEnd }
export interface TrainingNotice { title: string; detail: string; tone: "success" | "error" | "info" }
export interface TrainingState {
  cables: Record<CableId, CableState>;
  held: HeldEnd | null;
  heldItem: PlaceableItemId | null;
  items: Record<PlaceableItemId, PlaceableItemState>;
  completed: boolean;
  notice: TrainingNotice | null;
}

export function initialTrainingState(): TrainingState {
  return {
    cables: {
      "cable-1": { a: { portId: null, loosePosition: [...STUDIO.cableEnds[0]] }, b: { portId: null, loosePosition: [...STUDIO.cableEnds[1]] } },
      "cable-2": { a: { portId: null, loosePosition: [...STUDIO.cableEnds[2]] }, b: { portId: null, loosePosition: [...STUDIO.cableEnds[3]] } },
    },
    held: null,
    heldItem: null,
    items: {
      "capture-card": { label: "อุปกรณ์รับภาพ", position: [...STUDIO.placeableItems["capture-card"]] },
      "signal-adapter": { label: "อะแดปเตอร์สัญญาณ", position: [...STUDIO.placeableItems["signal-adapter"]] },
    },
    completed: false,
    notice: null,
  };
}

function cloneCables(cables: TrainingState["cables"]): TrainingState["cables"] {
  return {
    "cable-1": { a: { ...cables["cable-1"].a }, b: { ...cables["cable-1"].b } },
    "cable-2": { a: { ...cables["cable-2"].a }, b: { ...cables["cable-2"].b } },
  };
}

function occupiedEnd(state: TrainingState, portId: PortId): HeldEnd | null {
  for (const cableId of CABLE_IDS) for (const end of CABLE_ENDS) {
    if (state.cables[cableId][end].portId === portId) return { cableId, end };
  }
  return null;
}

function requiredPair(first: PortId, second: PortId): boolean {
  return missionS001.requiredConnections.some(({ from, to }) =>
    (first === from && second === to) || (first === to && second === from));
}

function routeComplete(cables: TrainingState["cables"]): boolean {
  return missionS001.requiredConnections.every(({ from, to }) =>
    CABLE_IDS.some((id) => {
      const { a, b } = cables[id];
      return (a.portId === from && b.portId === to) || (a.portId === to && b.portId === from);
    }));
}

function notice(title: string, detail: string, tone: TrainingNotice["tone"]): TrainingNotice {
  return { title, detail, tone };
}

export function trainingProgress(state: TrainingState): number {
  return missionS001.requiredConnections.filter(({ from, to }) =>
    CABLE_IDS.some((id) => {
      const { a, b } = state.cables[id];
      return (a.portId === from && b.portId === to) || (a.portId === to && b.portId === from);
    })).length;
}

export function interactWithTarget(state: TrainingState, target: TrainingTarget | null): TrainingState {
  if (!target) return { ...state, notice: notice(feedbackCopy.training.invalidTarget.title, feedbackCopy.training.invalidTarget.detail, "error") };
  const cables = cloneCables(state.cables);

  if (target.kind === "item") {
    if (state.held || state.heldItem) return { ...state, notice: notice("มือไม่ว่าง", "กด F เพื่อวางสิ่งที่ถืออยู่ก่อน", "error") };
    return { ...state, heldItem: target.itemId, notice: notice("หยิบอุปกรณ์แล้ว", "นำไปใกล้โต๊ะกลางแล้วกด F เพื่อวาง", "info") };
  }

  if (target.kind === "end") {
    if (state.held || state.heldItem) return { ...state, notice: notice(feedbackCopy.training.alreadyHolding.title, "กด F เพื่อวางสิ่งที่ถืออยู่ก่อน", "error") };
    const selected = cables[target.cableId][target.end];
    const connected = Boolean(selected.portId);
    selected.portId = null;
    return {
      ...state, cables, held: { cableId: target.cableId, end: target.end }, completed: routeComplete(cables),
      notice: connected
        ? notice(feedbackCopy.training.disconnected.title, feedbackCopy.training.disconnected.detail, "info")
        : notice(feedbackCopy.training.pickedUp.title, feedbackCopy.training.pickedUp.detail, "info"),
    };
  }

  const occupied = occupiedEnd(state, target.portId);
  if (state.heldItem) return { ...state, notice: notice("กำลังถืออุปกรณ์", "วางอุปกรณ์บนโต๊ะกลางก่อนต่อสาย", "error") };
  if (!state.held) {
    if (!occupied) return { ...state, notice: notice(feedbackCopy.training.pickUpFirst.title, feedbackCopy.training.pickUpFirst.detail, "error") };
    cables[occupied.cableId][occupied.end].portId = null;
    return { ...state, cables, held: occupied, completed: routeComplete(cables), notice: notice(feedbackCopy.training.disconnected.title, feedbackCopy.training.disconnected.detail, "info") };
  }
  if (occupied) return { ...state, notice: notice(feedbackCopy.connection.portOccupied.title, feedbackCopy.connection.portOccupied.detail, "error") };
  const otherEnd: CableEnd = state.held.end === "a" ? "b" : "a";
  const otherPort = cables[state.held.cableId][otherEnd].portId;
  if (otherPort) {
    const a = HDMI_PORTS[otherPort];
    const b = HDMI_PORTS[target.portId];
    if (a.direction === b.direction) return { ...state, notice: notice(feedbackCopy.connection.invalidDirection.title, feedbackCopy.connection.invalidDirection.technical, "error") };
    if (!requiredPair(otherPort, target.portId)) return { ...state, notice: notice(feedbackCopy.connection.invalidRoute.title, feedbackCopy.connection.invalidRoute.detail, "error") };
  }
  cables[state.held.cableId][state.held.end].portId = target.portId;
  const completed = routeComplete(cables);
  return {
    ...state, cables, held: null, completed,
    notice: completed
      ? notice(feedbackCopy.signalTest.complete.title, feedbackCopy.signalTest.complete.status, "success")
      : notice(feedbackCopy.connection.success.title, `${feedbackCopy.connection.success.detail}: ${HDMI_PORTS[target.portId].label}`, "success"),
  };
}

export function dropHeldEnd(state: TrainingState, position: Point3): TrainingState {
  if (!state.held) return state;
  const cables = cloneCables(state.cables);
  cables[state.held.cableId][state.held.end].loosePosition = position;
  return { ...state, cables, held: null, notice: notice(feedbackCopy.training.dropped.title, feedbackCopy.training.dropped.detail, "info") };
}

function cablePlacement(cableId: CableId, end: CableEnd): Point3 {
  const base = cableId === "cable-1" ? STUDIO.placementZones.cableLeft : STUDIO.placementZones.cableRight;
  return [base[0], base[1], base[2] + (end === "a" ? -0.12 : 0.12)];
}

export function placeHeldOnCenterTable(state: TrainingState, position: Point3): TrainingState {
  if (!state.held && !state.heldItem) return state;
  const kind = state.held ? "cable" : "equipment";
  if (!nearestTablePlacement(position[0], position[2], kind)) {
    return { ...state, notice: notice("ยังวางตรงนี้ไม่ได้", "เข้าใกล้โต๊ะกลางแล้วกด F อีกครั้ง", "error") };
  }
  if (state.held) {
    return dropHeldEnd(state, cablePlacement(state.held.cableId, state.held.end));
  }
  const itemId = state.heldItem as PlaceableItemId;
  const zone = itemId === "capture-card" ? STUDIO.placementZones.smallDevice : STUDIO.placementZones.auxDevice;
  return {
    ...state,
    heldItem: null,
    items: { ...state.items, [itemId]: { ...state.items[itemId], position: [...zone] } },
    notice: notice("วางอุปกรณ์บนโต๊ะกลางแล้ว", "เล็งอุปกรณ์แล้วกด E เพื่อหยิบอีกครั้ง", "success"),
  };
}

export function targetInstruction(state: TrainingState, target: TrainingTarget | null): string {
  if (!target) return state.held || state.heldItem ? "F · วางบนโต๊ะกลาง" : feedbackCopy.training.aimHint;
  if (target.kind === "item") return state.held || state.heldItem ? "F · วางสิ่งที่ถือบนโต๊ะกลาง" : `E · หยิบ${state.items[target.itemId].label}`;
  if (target.kind === "end") return state.held ? feedbackCopy.training.alreadyHolding.detail : state.cables[target.cableId][target.end].portId ? feedbackCopy.training.disconnectHint : feedbackCopy.training.pickUpHint;
  const label = HDMI_PORTS[target.portId].label;
  if (state.held) return `E · ต่อสายเข้าพอร์ต ${label}`;
  return occupiedEnd(state, target.portId) ? `E · ถอดสายจาก ${label}` : feedbackCopy.training.pickUpFirst.detail;
}
