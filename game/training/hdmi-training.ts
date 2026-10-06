import { nearestTablePlacement, STUDIO } from "./studio-room-layout";
import { clampToSurface, LAYOUTS, nearStaging, onSurface, type VenueLayout } from "./venue-layouts";
import { feedbackCopy } from "@/game/content/feedback-copy";
import { SCENARIOS, type Connector, type PlaceableItemId, type PortDef, type Point3, type Requirement, type Scenario, type ScenarioId } from "./scenarios";

/**
 * Signal-flow training engine (pure state transitions, unit-tested).
 * Scenario data lives in ./scenarios; "hdmi-basic" keeps the original two-cable slice,
 * "studio-full" is the full studio flow for the classroom.
 * Rules: OUTPUT → INPUT only, connector must match the cable end, one plug per port,
 * and a completed cable must match a required route.
 */
export type { Point3, PlaceableItemId, ScenarioId } from "./scenarios";
export type CableId = string;
export type PortId = string;
export type CableEnd = "a" | "b";
export type TrainingTarget =
  | { kind: "end"; cableId: CableId; end: CableEnd }
  | { kind: "port"; portId: PortId }
  | { kind: "item"; itemId: PlaceableItemId }
  | { kind: "action"; actionId: string }
  | { kind: "device"; deviceId: string };

export const CABLE_ENDS: readonly CableEnd[] = ["a", "b"];

interface EndState { portId: PortId | null; loosePosition: Point3 }
/** `turn` = yaw (radians) relative to the orientation the scenario authored the device in. */
export interface PlaceableItemState { label: string; position: Point3; turn: number }
export interface CableState { a: EndState; b: EndState }
/** `single`: only this plug was taken (keys 1 / 2); otherwise the whole lead is carried. */
export interface HeldEnd { cableId: CableId; end: CableEnd; single?: boolean }
/** E = whole cable, 1 + E = head (end a) only, 2 + E = tail (end b) only. */
export type PickMode = "whole" | "a" | "b";
export interface TrainingNotice { title: string; detail: string; tone: "success" | "error" | "info" }
export interface TrainingState {
  scenarioId: ScenarioId;
  cables: Record<CableId, CableState>;
  held: HeldEnd | null;
  heldItem: PlaceableItemId | null;
  items: Record<PlaceableItemId, PlaceableItemState>;
  actionsDone: Record<string, boolean>;
  programSource?: string;
  completed: boolean;
  notice: TrainingNotice | null;
}

export function scenarioOf(state: Pick<TrainingState, "scenarioId">): Scenario {
  return SCENARIOS[state.scenarioId];
}

/** Physical layout of the current scenario's venue (studio unless the scenario says otherwise). */
export function layoutOf(state: Pick<TrainingState, "scenarioId">): VenueLayout {
  return LAYOUTS[scenarioOf(state).layout ?? "studio"];
}
/** True when a carried item rests on the venue's main work surface (its ports are live there). */
export function onWorkSurface(state: Pick<TrainingState, "scenarioId">, at: readonly number[]): boolean {
  return onSurface(layoutOf(state).work, at[0], at[2]);
}

export function initialTrainingState(scenarioId: ScenarioId = "hdmi-basic"): TrainingState {
  const scenario = SCENARIOS[scenarioId];
  const cables: Record<CableId, CableState> = {};
  for (const cable of scenario.cables) {
    cables[cable.id] = {
      a: { portId: cable.fixedA ?? null, loosePosition: [...cable.start[0]] },
      b: { portId: null, loosePosition: [...cable.start[1]] },
    };
  }
  for (const link of scenario.initialConnections ?? []) {
    cables[link.cableId].a.portId = link.from;
    cables[link.cableId].b.portId = link.to;
  }
  return {
    scenarioId,
    cables,
    held: null,
    heldItem: null,
    items: Object.fromEntries(scenario.placeables.map((item) => [item.id, { label: item.label, position: [...item.start] as Point3, turn: 0 }])),
    actionsDone: Object.fromEntries(scenario.actions.map((action) => [action.id, false])),
    programSource: undefined,
    completed: false,
    notice: null,
  };
}

function cloneCables(cables: TrainingState["cables"]): TrainingState["cables"] {
  return Object.fromEntries(Object.entries(cables).map(([id, c]) => [id, { a: { ...c.a }, b: { ...c.b } }]));
}

function notice(title: string, detail: string, tone: TrainingNotice["tone"]): TrainingNotice {
  return { title, detail, tone };
}

function occupiedEnd(state: TrainingState, portId: PortId): HeldEnd | null {
  for (const [cableId, cable] of Object.entries(state.cables)) for (const end of CABLE_ENDS) {
    if (cable[end].portId === portId) return { cableId, end };
  }
  return null;
}

function cableDef(state: TrainingState, cableId: CableId) {
  return scenarioOf(state).cables.find((cable) => cable.id === cableId)!;
}

/* ---------- Adapters: a seated adapter exposes a socket port "sock:<cableId>" ---------- */
const SOCKET = "sock:";
const SOCKET_OFFSET: Point3 = [0, 0.045, 0.05];
const socketPortCache = new Map<string, PortDef>();

/** Port definition, including live adapter sockets. */
export function getPort(state: TrainingState, portId: PortId): PortDef | undefined {
  if (!portId.startsWith(SOCKET)) return scenarioOf(state).ports[portId];
  const cableId = portId.slice(SOCKET.length);
  const def = scenarioOf(state).cables.find((c) => c.id === cableId);
  const host = state.cables[cableId]?.a.portId;
  const base = host ? getPort(state, host) : undefined;
  if (!def?.socketB || !base) return undefined;
  // Zustand/React selectors need the same object identity while the adapter stays in one jack.
  // A fresh object on every read makes useSyncExternalStore loop when this socket appears.
  const key = `${state.scenarioId}:${cableId}:${host}`;
  let socket = socketPortCache.get(key);
  if (!socket) {
    socket = { label: `${def.label} (ที่ ${base.label})`, device: base.device, direction: base.direction, connector: def.socketB, position: base.position, radius: 0.03 };
    socketPortCache.set(key, socket);
  }
  return socket;
}

/** Follow adapters down to the real device port a socket leads to. */
export function resolvePort(state: TrainingState, portId: PortId | null, cables = state.cables): PortId | null {
  let id = portId;
  for (let guard = 0; id && id.startsWith(SOCKET) && guard < 8; guard++) id = cables[id.slice(SOCKET.length)]?.a.portId ?? null;
  return id;
}

/** Socket ports that currently exist (adapter plugged into something). */
export function socketPorts(state: TrainingState): PortId[] {
  return scenarioOf(state).cables.filter((c) => c.socketB && state.cables[c.id]?.a.portId).map((c) => SOCKET + c.id);
}

/** Does a plug fit the port? XLR is gendered: device inputs take a male plug, outputs a female plug. */
export function plugFits(plug: Connector, port: PortDef): boolean {
  if (port.connector === "XLR") return plug === (port.direction === "INPUT" ? "XLR-M" : "XLR-F");
  return plug === port.connector;
}

/** Anything plugged into a socket whose adapter is no longer seated falls out. */
function pruneSockets(cables: TrainingState["cables"]): void {
  for (let changed = true, guard = 0; changed && guard < 8; guard++) {
    changed = false;
    for (const cable of Object.values(cables)) for (const end of CABLE_ENDS) {
      const id = cable[end].portId;
      const adapter = id?.startsWith(SOCKET) ? cables[id.slice(SOCKET.length)] : null;
      if (adapter && !adapter.a.portId) { cable[end].portId = null; cable[end].loosePosition = [...adapter.a.loosePosition]; changed = true; }
    }
  }
}

function endConnector(state: TrainingState, held: HeldEnd): Connector {
  return cableDef(state, held.cableId).ends[held.end === "a" ? 0 : 1];
}

function linksRequirement(req: Requirement, first: PortId, second: PortId): boolean {
  return (req.from.includes(first) && req.to.includes(second)) || (req.from.includes(second) && req.to.includes(first));
}

export function requirementDone(state: TrainingState, req: Requirement, cables = state.cables): boolean {
  return Object.values(cables).some(({ a, b }) => {
    const x = resolvePort(state, a.portId, cables), y = resolvePort(state, b.portId, cables);
    return Boolean(x && y && linksRequirement(req, x, y));
  });
}

function itemZone(state: TrainingState, itemId: PlaceableItemId): Point3 {
  return scenarioOf(state).placeables.find((item) => item.id === itemId)!.zone;
}

/** Studio-style scenarios: on the work surface. Venue layouts: at the item's own operating position. */
export function isItemPlaced(state: TrainingState, itemId: PlaceableItemId): boolean {
  const at = state.items[itemId].position;
  if (state.heldItem === itemId) return false;
  if (!usesVenueLayout(state)) return onWorkSurface(state, at);
  const zone = itemZone(state, itemId);
  return Math.hypot(at[0] - zone[0], at[2] - zone[2]) <= 0.5;
}
const itemPlaced = isItemPlaced;
function usesVenueLayout(state: Pick<TrainingState, "scenarioId">): boolean {
  const id = scenarioOf(state).layout;
  return Boolean(scenarioOf(state).venueScale) && Boolean(id);
}

/** Rotate a point about the Y axis. */
function yaw(p: Point3, angle: number): Point3 {
  const c = Math.cos(angle), n = Math.sin(angle);
  return [p[0] * c + p[2] * n, p[1], -p[0] * n + p[2] * c];
}

/** Map a point authored relative to the item's zone onto wherever the item sits now. */
export function itemPoint(state: TrainingState, itemId: PlaceableItemId, authored: Point3): Point3 {
  const zone = itemZone(state, itemId);
  const item = state.items[itemId];
  const local = yaw([authored[0] - zone[0], authored[1] - zone[1], authored[2] - zone[2]], item.turn);
  return [+(item.position[0] + local[0]).toFixed(4), +(item.position[1] + local[1]).toFixed(4), +(item.position[2] + local[2]).toFixed(4)];
}

/** Live world position of a port (ports on placeable devices move and turn with the device). */
export function portPosition(state: TrainingState, portId: PortId): Point3 {
  if (portId.startsWith(SOCKET)) {
    const host = state.cables[portId.slice(SOCKET.length)]?.a.portId;
    const at: Point3 = host ? portPosition(state, host) : [0, 0, 0];
    return [at[0] + SOCKET_OFFSET[0], +(at[1] + SOCKET_OFFSET[1]).toFixed(4), +(at[2] + SOCKET_OFFSET[2]).toFixed(4)];
  }
  const port = scenarioOf(state).ports[portId];
  return port.requiresItem ? itemPoint(state, port.requiresItem, port.position) : port.position;
}

/** A port is live when its device is in the room (placeable devices must sit on the centre table). */
export function portAvailable(state: TrainingState, portId: PortId): boolean {
  if (portId.startsWith(SOCKET)) { const host = state.cables[portId.slice(SOCKET.length)]?.a.portId; return Boolean(host && portAvailable(state, host)); }
  const port = scenarioOf(state).ports[portId];
  return Boolean(port) && (!port.requiresItem || itemPlaced(state, port.requiresItem));
}

function isComplete(state: TrainingState, cables: TrainingState["cables"], actionsDone: Record<string, boolean>): boolean {
  const scenario = scenarioOf(state);
  return scenario.requirements.every((req) => requirementDone(state, req, cables)) && scenario.actions.every((action) => actionsDone[action.id]);
}

export function trainingProgress(state: TrainingState): number {
  const scenario = scenarioOf(state);
  return scenario.requirements.filter((req) => requirementDone(state, req)).length + scenario.actions.filter((action) => state.actionsDone[action.id]).length;
}

export function trainingTotal(state: Pick<TrainingState, "scenarioId">): number {
  const scenario = scenarioOf(state);
  return scenario.requirements.length + scenario.actions.length;
}

/** Actions depend on requirements (or other actions); unplugging undoes any action that lost a prerequisite. */
function settleActions(state: TrainingState, cables: TrainingState["cables"], actionsDone: Record<string, boolean>): Record<string, boolean> {
  const scenario = scenarioOf(state);
  const done = { ...actionsDone };
  for (const action of scenario.actions) {
    if (!done[action.id]) continue;
    const ok = action.needs.every((need) => {
      const req = scenario.requirements.find((r) => r.id === need);
      return req ? requirementDone(state, req, cables) : done[need];
    });
    if (!ok) done[action.id] = false;
  }
  return done;
}

function withCables(state: TrainingState, cables: TrainingState["cables"], extra: Partial<TrainingState>): TrainingState {
  pruneSockets(cables);
  const actionsDone = settleActions(state, cables, state.actionsDone);
  const programSource = state.programSource && actionsDone[`select-${state.programSource}`] ? state.programSource : undefined;
  return { ...state, ...extra, cables, actionsDone, programSource, completed: isComplete(state, cables, actionsDone) };
}

function runAction(state: TrainingState, actionId: string): TrainingState {
  const scenario = scenarioOf(state);
  const action = scenario.actions.find((a) => a.id === actionId);
  if (!action) return state;
  if (state.held || state.heldItem) return { ...state, notice: notice("มือไม่ว่าง", "กด F เพื่อวางสิ่งที่ถืออยู่ก่อน", "error") };
  if (state.actionsDone[actionId] && !action.source) return { ...state, notice: notice(action.doneLabel, "ขั้นนี้เสร็จแล้ว", "info") };
  // Trace back along the flow and report the first missing link (never guess past it).
  for (const need of action.needs) {
    const req = scenario.requirements.find((r) => r.id === need);
    const ok = req ? requirementDone(state, req) : state.actionsDone[need];
    if (!ok) {
      const label = req?.label ?? scenario.actions.find((a) => a.id === need)?.label ?? need;
      return { ...state, notice: notice("ยังไม่มีสัญญาณครบเส้นทาง", `ย้อนตรวจ: ${label}`, "error") };
    }
  }
  const actionsDone = { ...state.actionsDone, [actionId]: true };
  const completed = isComplete(state, state.cables, actionsDone);
  return {
    ...state, actionsDone, completed, programSource: action.source ?? state.programSource,
    notice: completed
      ? notice("ระบบพร้อมใช้งาน", "เส้นทางสัญญาณและการตั้งค่าครบทุกเงื่อนไขของบทเรียน", "success")
      : notice(action.doneLabel, action.label, "success"),
  };
}

export function interactWithTarget(state: TrainingState, target: TrainingTarget | null, pick: PickMode = "whole"): TrainingState {
  if (!target) return { ...state, notice: notice(feedbackCopy.training.invalidTarget.title, feedbackCopy.training.invalidTarget.detail, "error") };
  const scenario = scenarioOf(state);
  const cables = cloneCables(state.cables);

  if (target.kind === "action") return runAction(state, target.actionId);
  if (target.kind === "device") return { ...state, notice: notice("อุปกรณ์ติดตั้งประจำที่", "กด E ค้าง 2 วินาทีเพื่อเปิดดูรายละเอียด", "info") };

  if (target.kind === "item") {
    if (!state.items[target.itemId]) return state;
    if (state.held || state.heldItem) return { ...state, notice: notice("มือไม่ว่าง", "กด F เพื่อวางสิ่งที่ถืออยู่ก่อน", "error") };
    // Lifting the switcher unplugs everything seated in it.
    for (const [cableId, cable] of Object.entries(cables)) for (const end of CABLE_ENDS) {
      const portId = cable[end].portId;
      if (end === "a" && cableDef(state, cableId).fixedA) continue; // a lavalier stays on its own lead
      if (portId && scenario.ports[portId]?.requiresItem === target.itemId) {
        cable[end].portId = null;
        cable[end].loosePosition = portPosition(state, portId);
      }
    }
    return withCables(state, cables, { heldItem: target.itemId, notice: notice("หยิบอุปกรณ์แล้ว", "นำไปใกล้โต๊ะทำงานแล้วกด F เพื่อวาง", "info") });
  }

  if (target.kind === "end") {
    if (!cables[target.cableId] || !cableDef(state, target.cableId)) return state;
    const fixedMic = cableDef(state, target.cableId).fixedA;
    if (fixedMic && target.end === "a") {
      if (state.held || state.heldItem) return { ...state, notice: notice("มือไม่ว่าง", "กด F เพื่อวางสิ่งที่ถืออยู่ก่อน", "error") };
      // The capsule and its captive lead travel together; disconnect the TX plug if needed.
      const connected = Boolean(cables[target.cableId].b.portId);
      cables[target.cableId].b.portId = null;
      return withCables(state, cables, {
        held: { cableId: target.cableId, end: "b" },
        notice: notice(connected ? "ถอดไมค์จากตัวส่งแล้ว" : "หยิบไมค์พร้อมสายแล้ว", "นำปลั๊ก 3.5 mm ไปเสียบช่อง MIC INPUT ของ TX", "info"),
      });
    }
    // 1 / 2 + E: take only the head / tail of the aimed cable; the other end stays where it is.
    if (pick !== "whole" && !state.held && !state.heldItem) {
      const def = cableDef(state, target.cableId);
      const endPick: CableEnd = def.socketB ? "a" : pick;
      if (endPick === "a" && def.fixedA) return interactWithTarget(state, { ...target, end: "a" }, "whole");
      const chosen = cables[target.cableId][endPick];
      const wasIn = Boolean(chosen.portId);
      chosen.portId = null;
      return withCables(state, cables, {
        held: { cableId: target.cableId, end: endPick, single: true },
        notice: notice(wasIn ? feedbackCopy.training.disconnected.title : (endPick === "a" ? "หยิบหัวสาย" : "หยิบปลายสาย"), `${def.label} · ปลาย ${def.ends[endPick === "a" ? 0 : 1]} เท่านั้น`, "info"),
      });
    }
    // Holding a cable carries the whole lead: aiming at its other (loose) end just chooses which plug goes in first.
    if (state.held && !state.held.single && !state.heldItem && state.held.cableId === target.cableId) {
      if (state.held.end === target.end) return state;
      if (!cables[target.cableId][target.end].portId && !(target.end === "a" && cableDef(state, target.cableId).fixedA)) {
        return { ...state, held: { cableId: target.cableId, end: target.end }, notice: notice("สลับหัวสาย", `ถือปลาย ${cableDef(state, target.cableId).ends[target.end === "a" ? 0 : 1]} ไว้เสียบก่อน`, "info") };
      }
    }
    if (state.held || state.heldItem) return { ...state, notice: notice(feedbackCopy.training.alreadyHolding.title, "กด F เพื่อวางสิ่งที่ถืออยู่ก่อน", "error") };
    const def = cableDef(state, target.cableId);
    if (target.end === "b" && def.socketB) return interactWithTarget(state, { ...target, end: "a" }); // an adapter is one rigid piece
    const selected = cables[target.cableId][target.end];
    const connected = Boolean(selected.portId);
    selected.portId = null;
    return withCables(state, cables, {
      held: { cableId: target.cableId, end: target.end },
      notice: connected
        ? notice(feedbackCopy.training.disconnected.title, feedbackCopy.training.disconnected.detail, "info")
        : notice(feedbackCopy.training.pickedUp.title, `${def.label} · ${feedbackCopy.training.pickedUp.detail}`, "info"),
    });
  }

  const port = getPort(state, target.portId);
  if (!port) return state;
  if (state.heldItem) return { ...state, notice: notice("กำลังถืออุปกรณ์", "วางอุปกรณ์บนโต๊ะทำงานก่อนต่อสาย", "error") };
  if (!portAvailable(state, target.portId)) return { ...state, notice: notice("อุปกรณ์ยังไม่พร้อม", "วาง Video Switcher บนโต๊ะทำงานก่อน แล้วจึงต่อสาย", "error") };
  const occupied = occupiedEnd(state, target.portId);
  if (!state.held) {
    if (!occupied) return { ...state, notice: notice(feedbackCopy.training.pickUpFirst.title, feedbackCopy.training.pickUpFirst.detail, "error") };
    if (occupied.end === "a" && cableDef(state, occupied.cableId).fixedA) return state;
    cables[occupied.cableId][occupied.end].portId = null;
    return withCables(state, cables, { held: occupied, notice: notice(feedbackCopy.training.disconnected.title, feedbackCopy.training.disconnected.detail, "info") });
  }
  if (occupied) return { ...state, notice: notice(feedbackCopy.connection.portOccupied.title, feedbackCopy.connection.portOccupied.detail, "error") };
  const connector = endConnector(state, state.held);
  const lead = cableDef(state, state.held.cableId);
  if (port.signalType && lead.signalType && port.signalType !== lead.signalType) return { ...state, notice: notice("ชนิดสัญญาณไม่ตรงกัน", "หัวต่อที่เสียบได้อาจส่งสัญญาณคนละชนิด โปรดตรวจเส้นทางอีกครั้ง", "error") };
  if (target.portId === SOCKET + state.held.cableId) return { ...state, notice: notice("เสียบเข้าตัวเองไม่ได้", "เสียบหัวแปลงเข้าพอร์ตของอุปกรณ์", "error") };
  if (!plugFits(connector, port)) {
    const need = port.connector === "XLR" ? (port.direction === "INPUT" ? "XLR ตัวผู้ (M)" : "XLR ตัวเมีย (F)") : port.connector;
    return { ...state, notice: notice("หัวสายไม่ตรงกับพอร์ต", `ปลายสายนี้เป็น ${connector} แต่พอร์ต ${port.label} ต้องใช้ ${need}`, "error") };
  }
  const otherEnd: CableEnd = state.held.end === "a" ? "b" : "a";
  const otherPort = cables[state.held.cableId][otherEnd].portId;
  const otherReal = resolvePort(state, otherPort), targetReal = resolvePort(state, target.portId);
  if (otherReal && targetReal) {
    const other = getPort(state, otherReal)!, here = getPort(state, targetReal)!;
    if (other.direction === here.direction) return { ...state, notice: notice(feedbackCopy.connection.invalidDirection.title, feedbackCopy.connection.invalidDirection.technical, "error") };
    if (other.signalType && here.signalType && other.signalType !== here.signalType) return { ...state, notice: notice("ชนิดสัญญาณไม่ตรงกัน", "ต้องใช้อุปกรณ์แปลงสัญญาณที่ถูกต้อง", "error") };
    if (!scenario.requirements.some((req) => linksRequirement(req, otherReal, targetReal))) return { ...state, notice: notice(feedbackCopy.connection.invalidRoute.title, feedbackCopy.connection.invalidRoute.detail, "error") };
  }
  cables[state.held.cableId][state.held.end].portId = target.portId;
  if (lead.fixedA && state.held.end === "b") {
    const at = portPosition(state, target.portId);
    cables[state.held.cableId].a.loosePosition = [+(at[0] + 0.17).toFixed(3), +(at[1] - 0.24).toFixed(3), +(at[2] + 0.1).toFixed(3)];
  }
  // The other end of a carried lead stays in hand, ready for its destination (no walking back to the table).
  const otherSide: CableEnd = state.held.end === "a" ? "b" : "a";
  const leadDef = cableDef(state, state.held.cableId);
  const keepOther = !state.held.single && !cables[state.held.cableId][otherSide].portId && !leadDef.socketB && !(otherSide === "a" && leadDef.fixedA);
  const next = withCables(state, cables, { held: keepOther ? { cableId: state.held.cableId, end: otherSide } : null });
  return {
    ...next,
    notice: next.completed
      ? notice(feedbackCopy.signalTest.complete.title, feedbackCopy.signalTest.complete.status, "success")
      : notice(feedbackCopy.connection.success.title, `${feedbackCopy.connection.success.detail}: ${port.label}`, "success"),
  };
}

export function dropHeldEnd(state: TrainingState, position: Point3): TrainingState {
  if (!state.held) return state;
  const cables = cloneCables(state.cables);
  cables[state.held.cableId][state.held.end].loosePosition = position;
  // A carried lead is set down whole: its other loose end lands right beside the first.
  const other = cables[state.held.cableId][state.held.end === "a" ? "b" : "a"];
  if (cableDef(state, state.held.cableId).fixedA && !state.held.single) {
    cables[state.held.cableId].a.loosePosition = [+(position[0] - 0.15).toFixed(3), position[1], +(position[2] + 0.08).toFixed(3)];
  }
  if (!state.held.single && !other.portId && !cableDef(state, state.held.cableId).fixedA) other.loosePosition = [+(position[0] + 0.1).toFixed(3), position[1], +(position[2] + 0.06).toFixed(3)];
  return { ...state, cables, held: null, notice: notice(feedbackCopy.training.dropped.title, feedbackCopy.training.dropped.detail, "info") };
}

function cablePlacement(state: TrainingState, cableId: CableId, end: CableEnd): Point3 {
  const index = scenarioOf(state).cables.findIndex((cable) => cable.id === cableId);
  const base = index % 2 === 0 ? STUDIO.placementZones.cableLeft : STUDIO.placementZones.cableRight;
  const row = Math.floor(index / 2) * 0.3;
  return [base[0], base[1], +(base[2] + row + (end === "a" ? -0.12 : 0.12)).toFixed(3)];
}

/** Near a side table, F puts the held item/cable end back where it started (undo a wrong pick). */
function nearSideTable(state: TrainingState, position: Point3): boolean {
  if (usesVenueLayout(state)) return nearStaging(layoutOf(state), position[0], position[2]);
  const [w, , d] = STUDIO.sideTableSize;
  return STUDIO.sideTables.some(([x, , z]) => Math.abs(position[0] - x) < w / 2 + 0.9 && Math.abs(position[2] - z) < d / 2 + 0.4);
}

function returnToSideTable(state: TrainingState, position: Point3): TrainingState | null {
  if (!nearSideTable(state, position)) return null;
  const scenario = scenarioOf(state);
  if (state.heldItem) {
    const item = scenario.placeables.find((p) => p.id === state.heldItem)!;
    const cables = cloneCables(state.cables);
    for (const def of scenario.cables) {
      const mic = def.fixedA ? scenario.ports[def.fixedA] : null;
      if (!mic || mic.requiresItem !== item.id) continue;
      cables[def.id].a.loosePosition = [...def.start[0]];
      if (!cables[def.id].b.portId) cables[def.id].b.loosePosition = [...def.start[1]];
    }
    return { ...state, cables, heldItem: null, items: { ...state.items, [item.id]: { ...state.items[item.id], position: [...item.start], turn: 0 } },
      notice: notice("วางคืนโต๊ะอุปกรณ์แล้ว", `${item.label} กลับที่เดิม`, "info") };
  }
  if (state.held) {
    const def = cableDef(state, state.held.cableId);
    const back = dropHeldEnd({ ...state }, [...def.start[state.held.end === "a" ? 0 : 1]]);
    const otherEnd: CableEnd = state.held.end === "a" ? "b" : "a";
    if (def.fixedA) back.cables[def.id].a.loosePosition = [...def.start[0]];
    if (!state.held.single && !back.cables[def.id][otherEnd].portId && !(otherEnd === "a" && def.fixedA)) back.cables[def.id][otherEnd].loosePosition = [...def.start[otherEnd === "a" ? 0 : 1]];
    return back;
  }
  return null;
}

export function placeHeldOnCenterTable(state: TrainingState, position: Point3, turn = 0): TrainingState {
  if (!state.held && !state.heldItem) return state;
  const kind = state.held ? "cable" : "equipment";
  // Venues: an item aimed at its own operating position is installed there, even when storage is close by.
  const heldDef = state.heldItem ? scenarioOf(state).placeables.find((p) => p.id === state.heldItem) : undefined;
  const atOwnZone = usesVenueLayout(state) && heldDef && Math.hypot(position[0] - heldDef.zone[0], position[2] - heldDef.zone[2]) <= 1.6;
  const returned = atOwnZone ? null : returnToSideTable(state, position);
  if (returned) return returned;
  const legacy = !usesVenueLayout(state);
  const work = layoutOf(state).work;
  if (!legacy) {
    // Venue workflow: cable ends can be set down anywhere; equipment goes to its real operating position.
    if (state.held) {
      const onWork = onSurface(work, position[0], position[2], 0.1);
      const at = onWork ? clampToSurface(work, position[0], position[2], 0.12) : position;
      return dropHeldEnd(state, onWork ? [at[0], at[1] + 0.06, at[2]] : at);
    }
    const def = scenarioOf(state).placeables.find((p) => p.id === state.heldItem)!;
    if (Math.hypot(position[0] - def.zone[0], position[2] - def.zone[2]) > 1.6) {
      return { ...state, notice: notice("ยังไม่ใช่ตำแหน่งใช้งาน", `นำ ${def.label} ไปที่: ${def.zoneLabel ?? "ตำแหน่งใช้งานของอุปกรณ์"} แล้วกด F`, "error") };
    }
  } else if (!nearestTablePlacement(position[0], position[2], kind)) {
    return { ...state, notice: notice("ยังวางตรงนี้ไม่ได้", "เข้าใกล้โต๊ะทำงานหลักแล้วกด F อีกครั้ง", "error") };
  }
  if (state.held) return dropHeldEnd(state, cablePlacement(state, state.held.cableId, state.held.end));
  const itemId = state.heldItem as PlaceableItemId;
  // Studio: free placement where the player aims on the round table. Venues: snap to the operating position.
  const spot: Point3 = legacy ? clampToSurface(work, position[0], position[2], 0.35) : [...itemZone(state, itemId)];
  const placed: TrainingState = { ...state, items: { ...state.items, [itemId]: { ...state.items[itemId], position: spot, turn: legacy ? turn : 0 } } };
  return {
    ...placed,
    heldItem: null,
    notice: legacy
      ? notice("วางอุปกรณ์บนโต๊ะทำงานแล้ว", "เล็งอุปกรณ์แล้วกด E เพื่อหยิบอีกครั้ง", "success")
      : notice("ติดตั้งอุปกรณ์ที่ตำแหน่งใช้งานแล้ว", `${scenarioOf(state).placeables.find((p) => p.id === itemId)?.zoneLabel ?? ""} · ตรวจพอร์ตก่อนต่อสาย`, "success"),
  };
}

/**
 * While holding a plug: can it physically go into this port? Checks connector / XLR gender and that the
 * direction is opposite to wherever the other end already sits. The scenario route is NOT revealed here —
 * the trainee still has to work out the signal path. `null` when nothing is held.
 */
export function heldPlugFits(state: TrainingState, portId: PortId): boolean | null {
  if (!state.held) return null;
  const port = getPort(state, portId);
  if (!port || !portAvailable(state, portId) || occupiedEnd(state, portId)) return false;
  if (!plugFits(endConnector(state, state.held), port)) return false;
  const otherId = state.cables[state.held.cableId][state.held.end === "a" ? "b" : "a"].portId;
  const other = resolvePort(state, otherId);
  if (other) {
    const o = getPort(state, other);
    if (o && o.direction === port.direction) return false;
    if (o?.signalType && port.signalType && o.signalType !== port.signalType) return false;
  }
  return true;
}

export function targetInstruction(state: TrainingState, target: TrainingTarget | null): string {
  const scenario = scenarioOf(state);
  if (!target) return state.held || state.heldItem ? "F · วางบนโต๊ะทำงาน หรือวางคืนโต๊ะอุปกรณ์" : feedbackCopy.training.aimHint;
  if (target.kind === "item") return state.held || state.heldItem ? "F · วางสิ่งที่ถือบนโต๊ะทำงาน" : `E · หยิบ${state.items[target.itemId].label} · ค้าง 2 วิ = ดูรายละเอียด`;
  if (target.kind === "device") return "E ค้าง 2 วิ · ดูรายละเอียดอุปกรณ์";
  if (target.kind === "action") {
    const action = scenario.actions.find((a) => a.id === target.actionId);
    return action ? (state.actionsDone[action.id] ? action.doneLabel : `E · ${action.label}`) : "";
  }
  if (target.kind === "end") {
    const def = cableDef(state, target.cableId);
    if (state.held) return feedbackCopy.training.alreadyHolding.detail;
    if (target.end === "a" && def.fixedA) return `E · หยิบ${def.label} พร้อมปลั๊กไปเสียบ TX`;
    const connector = def.ends[target.end === "a" ? 0 : 1];
    return state.cables[target.cableId][target.end].portId ? feedbackCopy.training.disconnectHint : `E · หยิบ${def.label} ทั้งเส้น · 1+E หัวสาย · 2+E ปลายสาย (${connector})`;
  }
  const port = getPort(state, target.portId);
  if (!port) return "";
  const label = `${port.label} · ${port.direction}`;
  if (state.held) return `E · ต่อสายเข้าพอร์ต ${label}`;
  return occupiedEnd(state, target.portId) ? `E · ถอดสายจาก ${port.label}` : label;
}
