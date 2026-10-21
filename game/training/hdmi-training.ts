import { simThai } from "@/game/content/sim-thai";
import { nearestTablePlacement, STUDIO } from "./studio-room-layout";
import { clampToSurface, LAYOUTS, nearStaging, onSurface, type VenueLayout } from "./venue-layouts";
import { feedbackCopy } from "@/game/content/feedback-copy";
import { SCENARIOS, type Connector, type PlaceableItemId, type PortDef, type Point3, type Requirement, type Scenario, type ScenarioId } from "./scenarios";
import { canConnect, evaluate, modelOf, portOf, scoreOf, testRoute, validateLevel } from "./sim/engine";
import type { ConceptId, ControlValue, EvalContext, FaultScenario, SimRuntime, TestStage } from "./sim/types";
import { CONCEPTS } from "./sim/library";
import { catalogIdFor } from "@/game/content/cable-catalog";

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
  | { kind: "device"; deviceId: string }
  /** A real button / selector on a modelled device: drives the SAME simulation control as the Operator Console. */
  | { kind: "control"; deviceId: string; key: string; value: string | boolean | "toggle" | "cycle"; label: string };

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
  /** Transient marker: one deliberate cable-to-port attempt rejected by the existing validator. */
  invalidConnectionAttempt?: boolean;
  /** Mission cable-prep: leads the trainee did not pack (not rendered, cannot be used). */
  hiddenCables?: string[];
  /** Leads currently inside the trainee's bag (packed, not in the room yet): not rendered, taken out one at a time. */
  bagged?: string[];
  /** Production simulation runtime (mission stages only). */
  sim?: SimRuntime;
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

export function initialTrainingState(scenarioId: ScenarioId = "hdmi-basic", hiddenCables: string[] = [], bagged: string[] = []): TrainingState {
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
    hiddenCables,
    bagged,
    sim: scenario.stage ? initSim(scenario, attemptSeed(scenarioId)) : undefined,
  };
}

function cloneCables(cables: TrainingState["cables"]): TrainingState["cables"] {
  return Object.fromEntries(Object.entries(cables).map(([id, c]) => [id, { a: { ...c.a }, b: { ...c.b } }]));
}

function notice(title: string, detail: string, tone: TrainingNotice["tone"]): TrainingNotice {
  return { title, detail, tone };
}

function rejectConnection(state: TrainingState, title: string, detail: string): TrainingState {
  return { ...state, invalidConnectionAttempt: true, notice: notice(title, detail, "error") };
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
  if (port.connector === "COMBO") return plug === "XLR-M" || plug === "6.35mm";
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

/** A venue item is installed where the player actually places it, within its work area. */
export function isItemPlaced(state: TrainingState, itemId: PlaceableItemId): boolean {
  const at = state.items[itemId].position;
  if (state.heldItem === itemId) return false;
  if (!usesVenueLayout(state)) return onWorkSurface(state, at);
  const zone = itemZone(state, itemId);
  const work = layoutOf(state).work;
  if (onSurface(work, zone[0], zone[2])) return onSurface(work, at[0], at[2]) && Math.abs(at[1] - work.center[1]) < 0.2;
  return Math.hypot(at[0] - zone[0], at[2] - zone[2]) <= 1.6 && Math.abs(at[1] - zone[1]) < 0.2;
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

/**
 * Mission stages (console removed): every required physical route of the level's canonical graph, each wired by a
 * lead of the same cable kind with BOTH ends on the route's two ports. Logical replay control is not a cable.
 */
export function missionRoutes(state: Pick<TrainingState, "scenarioId" | "cables">, cables: TrainingState["cables"] = state.cables) {
  const scenario = scenarioOf(state);
  return (scenario.canonical ?? []).flatMap((route) => {
    const def = scenario.cables.find((c) => c.id === route.cableId);
    if (!def || catalogIdFor(def) === "CTRL-REPLAY") return [];
    const kind = catalogIdFor(def);
    const done = scenario.cables.some((c) => {
      const lead = cables[c.id];
      if (!lead || catalogIdFor(c) !== kind) return false;
      const ends = [lead.a.portId, lead.b.portId];
      return ends.includes(route.from as PortId) && ends.includes(route.to as PortId);
    });
    const from = scenario.ports[route.from]?.label ?? route.from, to = scenario.ports[route.to]?.label ?? route.to;
    return [{ id: `${route.from}>${route.to}`, label: `${from} → ${to}`, done }];
  });
}
export const missionWired = (state: Pick<TrainingState, "scenarioId" | "cables">, cables: TrainingState["cables"] = state.cables) => {
  const routes = missionRoutes(state, cables);
  return routes.length > 0 && routes.every((x) => x.done);
};

function isComplete(state: TrainingState, cables: TrainingState["cables"], actionsDone: Record<string, boolean>): boolean {
  const scenario = scenarioOf(state);
  if (scenario.stage) return missionWired(state, cables);
  return scenario.requirements.every((req) => requirementDone(state, req, cables)) && scenario.actions.every((action) => actionsDone[action.id]);
}

export function trainingProgress(state: TrainingState): number {
  const scenario = scenarioOf(state);
  if (scenario.stage) return missionRoutes(state).filter((x) => x.done).length;
  return scenario.requirements.filter((req) => requirementDone(state, req)).length + scenario.actions.filter((action) => state.actionsDone[action.id]).length;
}

export function trainingTotal(state: Pick<TrainingState, "scenarioId">): number {
  const scenario = scenarioOf(state);
  if (scenario.stage) return missionRoutes({ scenarioId: state.scenarioId, cables: {} }).length;
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
  const next = { ...state, ...extra, cables, actionsDone, programSource };
  if (next.sim) {
    // ✓ the moment a required route becomes fully wired (both ends on the right ports).
    const before = new Set(missionRoutes(state).filter((x) => x.done).map((x) => x.id));
    const fresh = missionRoutes(next, cables).find((x) => x.done && !before.has(x.id));
    const wired = missionWired(next, cables);
    const shown = fresh ? { notice: wired ? notice("✓ ต่อสายครบทุกเส้นทาง", "ผ่านด่านแล้ว", "success") : notice(`✓ ${fresh.label}`, "ต่อสายสำเร็จ", "success") } : {};
    return settleSim({ ...next, ...shown, completed: wired });
  }
  return { ...next, completed: isComplete(state, cables, actionsDone) };
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
  if (!target) return { ...state, notice: notice(feedbackCopy.training.invalidTarget.title, scenarioOf(state).stage ? "เข้าใกล้แล้วเล็งหัวสายหรือพอร์ตที่ต้องการให้ตรงกลางจอ โดยไม่มีสิ่งกีดขวาง" : feedbackCopy.training.invalidTarget.detail, "error") };
  const scenario = scenarioOf(state);
  const cables = cloneCables(state.cables);

  if (target.kind === "action") return runAction(state, target.actionId);
  if (target.kind === "control") {
    if (state.held || state.heldItem) return { ...state, notice: notice("มือไม่ว่าง", "กด F เพื่อวางสิ่งที่ถืออยู่ก่อนกดปุ่มบนอุปกรณ์", "error") };
    const current = simContext(state)?.cfg(target.deviceId, target.key);
    if (target.value === "cycle") {
      const options = scenarioOf(state).simDevices && modelOf(scenarioOf(state).simDevices!, target.deviceId)?.controls.find((c) => c.key === target.key)?.options;
      if (!options?.length) return state;
      return setControl(state, target.deviceId, target.key, options[(options.indexOf(String(current)) + 1) % options.length]);
    }
    return setControl(state, target.deviceId, target.key, target.value === "toggle" ? !(current === true) : target.value);
  }
  if (target.kind === "device") return { ...state, notice: notice("อุปกรณ์ติดตั้งประจำที่", "กด E ค้าง 2 วินาทีเพื่อเปิดดูรายละเอียด", "info") };

  if (target.kind === "item") {
    if (!state.items[target.itemId]) return state;
    if (state.held || state.heldItem) return { ...state, notice: notice("มือไม่ว่าง", "กด F เพื่อวางสิ่งที่ถืออยู่ก่อน", "error") };
    // Lifting the switcher unplugs everything seated in it.
    for (const [cableId, cable] of Object.entries(cables)) for (const end of CABLE_ENDS) {
      const portId = cable[end].portId;
      if (end === "a" && cableDef(state, cableId).fixedA) continue; // a lavalier stays on its own lead
      if (cableDef(state, cableId).locked) continue; // factory-wired leads travel with their device
      if (portId && scenario.ports[portId]?.requiresItem === target.itemId) {
        cable[end].portId = null;
        cable[end].loosePosition = portPosition(state, portId);
      }
    }
    return withCables(state, cables, { heldItem: target.itemId, notice: notice("หยิบอุปกรณ์แล้ว", "นำไปใกล้โต๊ะทำงานแล้วกด F เพื่อวาง", "info") });
  }

  if (target.kind === "end") {
    if (!cables[target.cableId] || !cableDef(state, target.cableId)) return state;
    if (cableDef(state, target.cableId).locked) return { ...state, notice: notice("ติดตั้งมากับเครื่องแล้ว", "ไมค์หนีบปกเสียบอยู่กับตัวส่ง TX แล้ว ไม่ต้องต่อเพิ่ม", "info") };
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
  if (!portAvailable(state, target.portId)) return { ...state, notice: notice("อุปกรณ์ยังไม่พร้อม", "นำอุปกรณ์ไปวางที่จุดติดตั้งก่อน แล้วจึงต่อสาย", "error") };
  const occupied = occupiedEnd(state, target.portId);
  if (!state.held) {
    if (!occupied) return { ...state, notice: notice(feedbackCopy.training.pickUpFirst.title, feedbackCopy.training.pickUpFirst.detail, "error") };
    if (occupied.end === "a" && cableDef(state, occupied.cableId).fixedA) return state;
    if (cableDef(state, occupied.cableId).locked) return { ...state, notice: notice("ติดตั้งมากับเครื่องแล้ว", "ไมค์หนีบปกเสียบอยู่กับตัวส่ง TX แล้ว ไม่ต้องต่อเพิ่ม", "info") };
    cables[occupied.cableId][occupied.end].portId = null;
    return withCables(state, cables, { held: occupied, notice: notice(feedbackCopy.training.disconnected.title, feedbackCopy.training.disconnected.detail, "info") });
  }
  if (occupied) return rejectConnection(state, feedbackCopy.connection.portOccupied.title, feedbackCopy.connection.portOccupied.detail);
  if (state.sim?.paused) return { ...state, notice: notice("พักภารกิจอยู่", "ตอบคำถามทบทวนให้ผ่านเพื่อกลับไปฝึกต่อ", "error") };
  if (state.sim && state.sim.weatherNow === "lightning") return { ...state, notice: notice("หยุดงานเนื่องจากฟ้าผ่า", "บันทึกการหยุดงานและรอยืนยันว่าปลอดภัยก่อนติดตั้งต่อ", "error") };
  const connector = endConnector(state, state.held);
  const lead = cableDef(state, state.held.cableId);
  if (port.signalType && lead.signalType && port.signalType !== lead.signalType) return rejectConnection(state, "ชนิดสัญญาณไม่ตรงกัน", "หัวต่อที่เสียบได้อาจส่งสัญญาณคนละชนิด โปรดตรวจเส้นทางอีกครั้ง");
  if (target.portId === SOCKET + state.held.cableId) return rejectConnection(state, "เสียบเข้าตัวเองไม่ได้", "เสียบหัวแปลงเข้าพอร์ตของอุปกรณ์");
  if (!plugFits(connector, port)) {
    const need = port.connector === "XLR" ? (port.direction === "INPUT" ? "XLR ตัวผู้ (M)" : "XLR ตัวเมีย (F)") : port.connector;
    const detail = `ปลายสายนี้เป็น ${connector} แต่พอร์ต ${port.label} ต้องใช้ ${need}`;
    return rejectConnection(state, "หัวสายไม่ตรงกับพอร์ต", detail);
  }
  const otherEnd: CableEnd = state.held.end === "a" ? "b" : "a";
  const otherPort = cables[state.held.cableId][otherEnd].portId;
  const otherReal = resolvePort(state, otherPort), targetReal = resolvePort(state, target.portId);
  if (otherReal && targetReal) {
    const other = getPort(state, otherReal)!, here = getPort(state, targetReal)!;
    if (scenario.simDevices && state.sim) {
      const v = canConnect(scenario.simDevices, otherReal, targetReal);
      if (!v.ok) return rejectConnection(state, v.title, v.detail);
    } else {
    if (other.direction === here.direction) return rejectConnection(state, feedbackCopy.connection.invalidDirection.title, feedbackCopy.connection.invalidDirection.technical);
    if (other.signalType && here.signalType && other.signalType !== here.signalType) return rejectConnection(state, "ชนิดสัญญาณไม่ตรงกัน", "ต้องใช้อุปกรณ์แปลงสัญญาณที่ถูกต้อง");
    if (!scenario.requirements.some((req) => linksRequirement(req, otherReal, targetReal))) return rejectConnection(state, feedbackCopy.connection.invalidRoute.title, feedbackCopy.connection.invalidRoute.detail);
    }
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
  if (next.sim && otherReal && targetReal) {
    const ctx = simContext(next);
    const [o, i] = getPort(state, otherReal)!.direction === "OUTPUT" ? [otherReal, targetReal] : [targetReal, otherReal];
    const sig = ctx?.inp[i];
    next.sim = { ...next.sim, log: [...next.sim.log, { t: next.sim.tick, kind: "connect", text: `${o} → [${leadDef.label}] → ${i}` }] };
    return { ...next, notice: notice("ต่อสายแล้ว ต้องทดสอบระบบ", `${leadDef.label} · ${getPort(state, o)!.label} → ${getPort(state, i)!.label}${sig ? " · ตรวจพบสัญญาณจำลอง" : " · ยังไม่มีสัญญาณ ตรวจไฟเลี้ยง รูปแบบภาพ และการตั้งค่า"}`, "success") };
  }
  return {
    ...next,
    notice: next.completed
      ? notice(feedbackCopy.signalTest.complete.title, feedbackCopy.signalTest.complete.status, "success")
      : notice(feedbackCopy.connection.success.title, `${feedbackCopy.connection.success.detail}: ${port.label}`, "success"),
  };
}

/** Bag: put the lead in hand back into the bag (both plugs out, out of the room); routes/actions are re-settled. */
export function stowHeldCable(state: TrainingState): TrainingState {
  if (!state.held) return state;
  const def = cableDef(state, state.held.cableId);
  if (def.fixedA || def.locked) return { ...state, notice: notice("เก็บคืนไม่ได้", "สายไมค์นี้ติดกับตัวไมค์ ไม่ได้อยู่ในกระเป๋า", "error") };
  const cables = cloneCables(state.cables);
  cables[def.id] = { a: { portId: null, loosePosition: [...def.start[0]] }, b: { portId: null, loosePosition: [...def.start[1]] } };
  const bagged = [...(state.bagged ?? []).filter((id) => id !== def.id), def.id];
  return withCables(state, cables, { held: null, bagged, notice: notice("เก็บสายคืนกระเป๋าแล้ว", def.label, "info") });
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
  const work = layoutOf(state).work;
  const atOwnZone = usesVenueLayout(state) && heldDef && (onSurface(work, heldDef.zone[0], heldDef.zone[2])
    ? onSurface(work, position[0], position[2], 0.1)
    : Math.hypot(position[0] - heldDef.zone[0], position[2] - heldDef.zone[2]) <= 1.6);
  const returned = atOwnZone ? null : returnToSideTable(state, position);
  if (returned) return returned;
  const legacy = !usesVenueLayout(state);
  if (!legacy) {
    // Venue workflow: cable ends can be set down anywhere; equipment goes to its real operating position.
    if (state.held) {
      const onWork = onSurface(work, position[0], position[2], 0.1);
      const at = onWork ? clampToSurface(work, position[0], position[2], 0.12) : position;
      return dropHeldEnd(state, onWork ? [at[0], at[1] + 0.06, at[2]] : at);
    }
    const def = scenarioOf(state).placeables.find((p) => p.id === state.heldItem)!;
    const workStation = onSurface(work, def.zone[0], def.zone[2]);
    if (workStation ? !onSurface(work, position[0], position[2], 0.1) : Math.hypot(position[0] - def.zone[0], position[2] - def.zone[2]) > 1.6) {
      return { ...state, notice: notice("ยังไม่ใช่ตำแหน่งใช้งาน", `นำ ${def.label} ไปที่: ${def.zoneLabel ?? "ตำแหน่งใช้งานของอุปกรณ์"} แล้วกด F`, "error") };
    }
  } else if (!nearestTablePlacement(position[0], position[2], kind)) {
    return { ...state, notice: notice("ยังวางตรงนี้ไม่ได้", "เข้าใกล้โต๊ะทำงานหลักแล้วกด F อีกครั้ง", "error") };
  }
  if (state.held) return dropHeldEnd(state, cablePlacement(state, state.held.cableId, state.held.end));
  const itemId = state.heldItem as PlaceableItemId;
  // Keep the chosen position and rotation in both modes; ports follow itemPoint.
  const zone = itemZone(state, itemId);
  const onWorkStation = onSurface(work, zone[0], zone[2]);
  const spot: Point3 = legacy || onWorkStation
    ? clampToSurface(work, position[0], position[2], 0.2)
    : [position[0], zone[1], position[2]];
  const placed: TrainingState = { ...state, items: { ...state.items, [itemId]: { ...state.items[itemId], position: spot, turn } } };
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

/**
 * Short on-screen name for the bottom E prompt only: drops trailing model / asset-tag brackets such as
 * "(YAMAHA PMX-402D-USB)" or "(XS-OBS-01)" but keeps short role tags like "(OBS)". The full name stays
 * on the equipment and in the 2-second detail view.
 */
export function promptName(label: string): string {
  let name = label.trim();
  const groups: string[] = [];
  // Peel balanced bracket groups off the end, innermost-safe.
  while (name.endsWith(")")) {
    let depth = 0, i = name.length - 1;
    for (; i >= 0; i--) { if (name[i] === ")") depth++; else if (name[i] === "(" && --depth === 0) break; }
    if (i <= 0) break;
    groups.unshift(name.slice(i));
    name = name.slice(0, i).trimEnd();
  }
  const kept = groups.filter((g) => g.length <= 7 && !/\d/.test(g));
  return [name, ...kept].join(" ");
}

export function targetInstruction(state: TrainingState, target: TrainingTarget | null): string {
  const scenario = scenarioOf(state);
  // One prompt grammar everywhere: "E · หยิบ…" / "F · วาง…" / "E ค้าง 2 วิ · ดูรายละเอียด…".
  const heldZone = state.heldItem && usesVenueLayout(state) ? scenario.placeables.find((p) => p.id === state.heldItem)?.zoneLabel : undefined;
  if (state.heldItem && usesVenueLayout(state) && (!target || target.kind === "item")) return `F · วางอุปกรณ์ที่${heldZone ? ` ${heldZone}` : "ตำแหน่งใช้งาน"}`;
  if (!target) return state.held || state.heldItem ? "F · วางบนโต๊ะทำงาน หรือวางคืนโต๊ะอุปกรณ์" : scenario.stage ? "เข้าใกล้แล้วเล็งหัวสายหรือพอร์ตที่ต้องการ จากนั้นกด E" : feedbackCopy.training.aimHint;
  if (target.kind === "item") return state.held || state.heldItem ? "F · วางสิ่งที่ถือบนโต๊ะทำงาน" : `E · หยิบ ${promptName(state.items[target.itemId].label)} · ค้าง 2 วิ ดูรายละเอียด`;
  if (target.kind === "device") return scenario.stage && (state.held || state.heldItem) ? "F · วางสิ่งที่ถือก่อนตรวจรายละเอียดอุปกรณ์" : "E ค้าง 2 วิ · ดูรายละเอียดอุปกรณ์ (ติดตั้งประจำที่)";
  if (target.kind === "control") return state.held || state.heldItem ? "F · วางสิ่งที่ถือก่อนกดปุ่มบนอุปกรณ์" : `E · กดปุ่ม ${target.label}`;
  if (target.kind === "action") {
    const action = scenario.actions.find((a) => a.id === target.actionId);
    return action ? (state.actionsDone[action.id] ? action.doneLabel : `E · ${action.label}`) : "";
  }
  if (target.kind === "end") {
    const def = cableDef(state, target.cableId);
    if (def.locked) return `${def.label} · ต่อกับ TX มาแล้ว`;
    if (state.held) return "F · วางสายที่ถืออยู่ก่อน (หรือนำไปต่อเข้าพอร์ต)";
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

/* ═════════════════════════ Production simulation runtime (mission stages) ═════════════════════════
 * Pure transitions over TrainingState.sim. Every observable result is recomputed from the real cable graph +
 * device configuration (game/training/sim/engine.ts) — the HUD never trusts cable colour. */
let attemptCounter = 0;
/** Deterministic per-attempt seed (restart = next attempt): the L5 surprise fault varies between attempts, never randomly within one. */
export function attemptSeed(id: string): number { attemptCounter += 1; return [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, attemptCounter) >>> 0; }

function applyFaultConfig(sim: SimRuntime, f: FaultScenario): SimRuntime {
  const config = { ...sim.config };
  const locked = [...sim.locked];
  for (const c of f.config ?? []) { config[c.device] = { ...(config[c.device] ?? {}), [c.key]: c.value }; if (c.lock) locked.push(`${c.device}.${c.key}`); }
  return { ...sim, config, locked };
}

export function initSim(scenario: Scenario, seed: number): SimRuntime {
  const stage = scenario.stage!;
  let sim: SimRuntime = {
    stageId: stage.id, config: { site: { decision: "(undecided)" } }, pgmHistory: [], cueIndex: 0, cueMisses: 0, testsPassed: {}, diagnosed: [], recovered: [],
    activeFaults: [], surpriseArmed: false, seed, errors: 0, totalErrors: 0, paused: false, log: [], tick: 0, signedOff: false, evidence: [], quizOk: false,
    fallbackUsed: false, locked: [], weatherNow: stage.weather, recoveryOrder: [],
  };
  for (const c of stage.startConfig ?? []) sim.config[c.device] = { ...(sim.config[c.device] ?? {}), [c.key]: c.value };
  for (const f of stage.faults ?? []) { sim = applyFaultConfig(sim, f); sim.activeFaults = [...sim.activeFaults, f.id]; }
  return sim;
}

const ctxCache = new WeakMap<object, EvalContext>();
/**
 * The signal graph depends only on these fields. Store updates that change something else (aim/focus,
 * the E-hold timer, notices, console open) produce a new state object but must not re-run evaluate().
 * Every input below is replaced immutably on change, so reference equality is an exact invalidation test.
 */
type CtxInputs = [TrainingState["scenarioId"], TrainingState["cables"], TrainingState["items"], TrainingState["heldItem"], TrainingState["bagged"], TrainingState["hiddenCables"], TrainingState["sim"]];
let lastInputs: CtxInputs | null = null;
let lastCtx: EvalContext | null = null;
/** Evaluated signal graph for the current state (cached per state snapshot). */
export function simContext(state: TrainingState): EvalContext | null {
  const scenario = scenarioOf(state);
  if (!scenario.stage || !state.sim || !scenario.simDevices) return null;
  const hit = ctxCache.get(state);
  if (hit) return hit;
  const inputs: CtxInputs = [state.scenarioId, state.cables, state.items, state.heldItem, state.bagged, state.hiddenCables, state.sim];
  if (lastInputs && lastCtx && inputs.every((v, i) => v === lastInputs![i])) { ctxCache.set(state, lastCtx); return lastCtx; }
  const devs = scenario.simDevices;
  const edges: EvalContext["edges"] = [];
  for (const [cableId, c] of Object.entries(state.cables)) {
    const definition = scenario.cables.find((lead) => lead.id === cableId);
    if (!definition || state.bagged?.includes(cableId) || state.hiddenCables?.includes(cableId)) continue;
    const aPort = c.a.portId ? getPort(state, c.a.portId) : undefined;
    const bPort = c.b.portId ? getPort(state, c.b.portId) : undefined;
    if (!aPort || !bPort || !plugFits(definition.ends[0], aPort) || !plugFits(definition.ends[1], bPort)) continue;
    const a = resolvePort(state, c.a.portId), b = resolvePort(state, c.b.portId);
    if (!a || !b) continue;
    const pa = portOf(devs, a), pb = portOf(devs, b);
    if (!pa || !pb || pa.dir === pb.dir) continue;
    edges.push(pa.dir === "OUTPUT" ? { from: a, to: b, cableId } : { from: b, to: a, cableId });
  }
  const placeable = new Set(scenario.placeables.map((p) => p.id));
  const ctx = evaluate({ stage: scenario.stage, devices: devs, edges, cables: scenario.cableMeta ?? {}, placed: (d) => !placeable.has(d) || isItemPlaced(state, d), sim: state.sim });
  ctxCache.set(state, ctx);
  lastInputs = inputs; lastCtx = ctx;
  return ctx;
}

const allFaults = (scenario: Scenario): FaultScenario[] => [...(scenario.stage?.faults ?? []), ...(scenario.stage?.surpriseFaults ?? [])];

/** Clear recovered faults (root cause fixed) and unlock what they held. */
function settleSim(state: TrainingState): TrainingState {
  if (!state.sim) return state;
  const ctx = simContext(state);
  if (!ctx) return state;
  const scenario = scenarioOf(state);
  let sim = state.sim;
  for (const id of state.sim.activeFaults) {
    const f = allFaults(scenario).find((x) => x.id === id);
    if (!f || !f.cleared(ctx)) continue;
    sim = { ...sim, activeFaults: sim.activeFaults.filter((x) => x !== id), recovered: [...sim.recovered, id], recoveryOrder: [...sim.recoveryOrder, id],
      locked: sim.locked.filter((k) => !(f.config ?? []).some((c) => `${c.device}.${c.key}` === k)),
      log: [...sim.log, { t: sim.tick, kind: "recover", text: `แก้ปัญหาแล้ว: ${f.label}` }] };
  }
  // Test badges are evidence about the current graph, not permanent achievements.
  // A repaired setup must be deliberately tested again; no automatic green badges.
  const results = validateLevel(ctx).filter((r) => r.id !== "signoff");
  const order: TestStage[] = ["physical", "signal", "rehearsal", "delivery"];
  const invalid = order.findIndex((t) => results.some((r) => r.stage === t && !r.result.ok));
  if (invalid >= 0) {
    const testsPassed = { ...sim.testsPassed };
    // Only stale PASSES are withdrawn; a recorded failure is still true evidence about this graph.
    for (const t of order.slice(invalid)) if (testsPassed[t]) delete testsPassed[t];
    sim = { ...sim, testsPassed, signedOff: false };
  }
  return { ...state, sim, completed: missionWired(state) };
}

/** A meaningful error: counted deterministically; three → Mission Paused → targeted review. */
export function registerError(state: TrainingState, concept: ConceptId, text: string, code = "ERROR"): TrainingState {
  if (!state.sim) return { ...state, notice: notice("ดำเนินการไม่ได้", text, "error") };
  const errors = state.sim.errors + 1;
  const paused = errors >= 3;
  const sim: SimRuntime = { ...state.sim, errors, totalErrors: state.sim.totalErrors + 1, lastErrorConcept: concept, paused, reviewConcept: paused ? concept : state.sim.reviewConcept,
    log: [...state.sim.log, { t: state.sim.tick, kind: "reject", text, code }] };
  return { ...state, sim, notice: notice(paused ? "พักภารกิจเพื่อทบทวน" : "ยังทำรายการนี้ไม่ได้", paused ? `ผิดพลาดที่มีผลต่องานครบ 3 ครั้ง ให้ทบทวน: ${CONCEPTS[concept].title}` : text, "error") };
}

function stageCtl(state: TrainingState) { return scenarioOf(state).stage!; }

/** Operator control on a device (or the "site" preflight/safety panel). */
export function setControl(state: TrainingState, device: string, key: string, value: ControlValue): TrainingState {
  if (!state.sim) return state;
  if (state.sim.paused) return { ...state, notice: notice("พักภารกิจอยู่", "ตอบคำถามทบทวนให้ผ่านเพื่อกลับไปฝึกต่อ", "error") };
  if (state.sim.locked.includes(`${device}.${key}`)) return { ...state, notice: notice("ปรับค่านี้โดยตรงไม่ได้", "เป็นปัญหาภายนอก เช่น ผู้ให้บริการอินเทอร์เน็ตขัดข้อง ให้ใช้แผนสำรองจากอุปกรณ์ที่มีจริง", "error") };
  const stage = stageCtl(state);
  const definition = scenarioOf(state).simDevices && modelOf(scenarioOf(state).simDevices!, device);
  const control = definition ? definition.controls.find((c) => c.key === key) : undefined;
  const siteControl = device === "site" && (stage.preflight.includes(key) || key === "decision");
  const valid = control
    ? control.kind === "select" ? typeof value === "string" && Boolean(control.options?.includes(value)) : typeof value === "boolean"
    : siteControl && (key === "decision" ? ["GO", "NO-GO (hold)"].includes(String(value)) : typeof value === "boolean");
  if (!valid) return { ...state, notice: notice("ตั้งค่านี้ไม่ได้", "อุปกรณ์ไม่มีรายการควบคุมหรือไม่รองรับค่าที่เลือก", "error") };
  const before = simContext(state);
  const prev = before?.cfg(device, key) ?? state.sim.config[device]?.[key];
  const sim: SimRuntime = { ...state.sim, tick: state.sim.tick + 1, config: { ...state.sim.config, [device]: { ...(state.sim.config[device] ?? {}), [key]: value } } };
  sim.log = [...sim.log, { t: sim.tick, kind: "config", text: `${device}.${key} = ${String(value)}` }];
  let next: TrainingState = { ...state, sim, notice: notice("ตั้งค่าแล้ว", `${device} · ${key} = ${typeof value === "boolean" ? value ? "เปิด" : "ปิด" : simThai(String(value))}`, "info") };
  // Safety: GO during lightning is a critical safety bypass.
  if (device === "site" && key === "decision" && value === "GO" && sim.weatherNow === "lightning") {
    next = { ...next, sim: { ...next.sim!, log: [...next.sim!.log, { t: sim.tick, kind: "reject", text: "สั่งเริ่มงานขณะมีคำเตือนฟ้าผ่า", code: "SAFETY_BYPASS" }] } };
    return registerError(next, "safety", "ห้ามเริ่มงานขณะมีฟ้าผ่า บันทึกการหยุดงานและรอยืนยันว่าปลอดภัย", "SAFETY_BYPASS");
  }
  // Recording stopped cleanly → the file closes and becomes evidence.
  if (key === "record" && value === false && prev === true && before) {
    const dev = device === "sw" ? Object.keys(before.view).find((d) => before.view[d]?.recording && scenarioOf(state).simDevices?.[d]?.model === "generic-recording-ssd") : before.view[device]?.recording ? device : undefined;
    const file = dev ? before.view[dev]?.file : undefined;
    if (dev && file) next.sim = { ...next.sim!, evidence: [...next.sim!.evidence, `${device === "host" ? "OBS local recording saved" : device === "rec" ? "rec · HyperDeck clip closed" : `${dev} · ISO disk file closed`} · ${file}`] };
  }
  // Going on air before rehearsal in a certification is logged.
  if (key === "stream" && value === true && stage.guidance === "certification" && !state.sim.testsPassed.rehearsal) {
    next.sim = { ...next.sim!, log: [...next.sim!.log, { t: sim.tick, kind: "config", text: "เริ่มสตรีมก่อนผ่านการซ้อมงาน", code: "EARLY_STREAM" }] };
  }
  // Program takes drive the run-of-show.
  if (device === "sw" && key === "pgm") next = afterTake(next, String(state.sim.config.sw?.pvw ?? ""), String(value));
  return settleSim(next);
}

function afterTake(state: TrainingState, pvwBefore: string, opt: string): TrainingState {
  const ctx = simContext(state);
  const content = ctx?.view.sw?.picture ?? "BLACK";
  const stage = stageCtl(state);
  let sim: SimRuntime = { ...state.sim!, pgmHistory: [...state.sim!.pgmHistory, content], log: [...state.sim!.log, { t: state.sim!.tick, kind: "take", text: `TAKE ${opt} → ${content}` }] };
  if (content.includes("HOLDING") && sim.activeFaults.length) sim = { ...sim, fallbackUsed: true };
  const next: TrainingState = { ...state, sim };
  const live = stage.cues.length > 0 && sim.testsPassed.signal && sim.cueIndex < stage.cues.length;
  if (!live) return { ...next, notice: notice("สลับออกอากาศ", `ภาพออกอากาศ: ${content}`, "info") };
  const cue = stage.cues[sim.cueIndex];
  if (stage.previewBeforeTake && pvwBefore !== opt) {
    return registerError({ ...next, sim: { ...sim, cueMisses: sim.cueMisses + 1 } }, "output-assign", `คิว "${cue.call}": ยังไม่เลือกภาพเตรียมก่อนสลับออกอากาศ ต้องเตรียมภาพก่อน`, "NO_PREVIEW");
  }
  if (content.includes(cue.expect)) {
    sim = { ...sim, cueIndex: sim.cueIndex + 1, evidence: [...sim.evidence, `CUE ${sim.cueIndex + 1}: ${cue.call} → ${content}`] };
    return { ...next, sim, notice: notice(`คิว ${sim.cueIndex}/${stage.cues.length} ✓`, sim.cueIndex < stage.cues.length ? `คิวถัดไป: ${stage.cues[sim.cueIndex].call}` : "ครบคิวแล้ว ให้ทดสอบการซ้อมงาน", "success") };
  }
  return registerError({ ...next, sim: { ...sim, cueMisses: sim.cueMisses + 1 } }, "output-assign", `คิว "${cue.call}" — ภาพออกอากาศเป็น ${content} ใช้แหล่งภาพผิด`, "WRONG_TAKE");
}

export const STAGE_ORDER: TestStage[] = ["physical", "signal", "rehearsal", "delivery"];
/** Physical-layer, signal, operator-rehearsal and stream/record tests, in order. */
export function runTest(state: TrainingState, test: TestStage): TrainingState {
  if (!state.sim) return state;
  if (state.sim.paused) return { ...state, notice: notice("พักภารกิจอยู่", "ผ่านคำถามทบทวนก่อนทดสอบระบบ", "error") };
  state = settleSim(state);
  if (!state.sim) return state;
  const ctx = simContext(state)!;
  const idx = STAGE_ORDER.indexOf(test);
  const missing = STAGE_ORDER.slice(0, idx).find((s) => !state.sim!.testsPassed[s]);
  if (missing) return { ...state, notice: notice("ลำดับการทดสอบ", `ต้องผ่านการทดสอบ${simThai(missing)}ก่อน`, "error") };
  const routed = testRoute(ctx, test);
  const results = routed.results.filter((r) => r.id !== "signoff");
  const pass = results.every((r) => r.result.ok);
  let sim: SimRuntime = { ...state.sim, tick: state.sim.tick + 1, diagnosed: [...new Set([...state.sim.diagnosed, ...state.sim.activeFaults])], testsPassed: { ...state.sim.testsPassed, [test]: pass } };
  if (pass && test === "signal" && sim.cueStart === undefined) sim.cueStart = sim.pgmHistory.length;
  sim.log = [...sim.log, { t: sim.tick, kind: "test", text: `${test} test: ${pass ? "PASS" : `FAIL (${results.filter((r) => !r.result.ok).length})`}` }];
  let cables = state.cables;
  let extra = "";
  const scenario = scenarioOf(state);
  if (pass && test === "rehearsal" && scenario.stage?.surpriseFaults?.length && !sim.surpriseArmed) {
    const pool = scenario.stage.surpriseFaults;
    const f = pool[sim.seed % pool.length];
    sim = applyFaultConfig({ ...sim, surpriseArmed: true, activeFaults: [...sim.activeFaults, f.id], testsPassed: { ...sim.testsPassed, delivery: false } }, f);
    if (f.unplug?.length) {
      cables = cloneCables(cables);
      for (const [from, to] of f.unplug) for (const c of Object.values(cables)) {
        const joins = (c.a.portId === from && c.b.portId === to) || (c.a.portId === to && c.b.portId === from);
        if (!joins) continue;
        const at = portPosition(state, to);
        for (const end of CABLE_ENDS) if (c[end].portId === to) { c[end].portId = null; c[end].loosePosition = [+(at[0] + 0.05).toFixed(3), +Math.max(0.03, at[1] - 0.3).toFixed(3), +(at[2] + 0.1).toFixed(3)]; }
      }
    }
    sim.log = [...sim.log, { t: sim.tick, kind: "fault", text: "เกิดปัญหาไม่คาดคิดระหว่างรายการ ต้องตรวจหาสาเหตุ" }];
    extra = " ⚠ เกิดปัญหาระหว่างออกอากาศ ให้ตรวจหาสาเหตุ";
  }
  const cert = scenario.stage?.guidance === "certification";
  const firstFail = results.find((r) => !r.result.ok);
  const detail = pass ? `ผ่านครบ ${results.length} รายการ${extra}` : `${firstFail!.label}: ${firstFail!.result.reason ?? ""}${cert ? "" : ` → ${firstFail!.result.fix ?? ""}`}`;
  return settleSim({ ...state, cables, sim, notice: notice(`ทดสอบ${simThai(test)}: ${pass ? "ผ่าน" : "ไม่ผ่าน"}`, detail, pass ? "success" : "error") });
}

/** Signal trace requested by the learner: logs the diagnosis of any live fault. */
export function markTrace(state: TrainingState, dest: string): TrainingState {
  if (!state.sim) return state;
  return { ...state, sim: { ...state.sim, diagnosed: [...new Set([...state.sim.diagnosed, ...state.sim.activeFaults])], log: [...state.sim.log, { t: state.sim.tick, kind: "test", text: `ตรวจเส้นทาง → ${dest}` }] } };
}

/** Timed stream test against the local private ingest (simulated duration). */
export function streamTest(state: TrainingState, seconds: number): TrainingState {
  const ctx = simContext(state);
  if (!ctx || !state.sim) return state;
  const ingest = Object.keys(ctx.view).find((d) => scenarioOf(state).simDevices?.[d]?.model === "generic-test-ingest");
  const v = ingest ? ctx.view[ingest] : undefined;
  if (!v?.live) return { ...state, notice: notice("ทดสอบสตรีมไม่ผ่าน", v?.status ?? "งานนี้ไม่มีจุดรับสตรีม", "error") };
  const text = `STREAM TEST ${seconds} s · ${v.picture} · audio: ${(v.audio ?? []).join(" + ") || "none"}`;
  return { ...state, sim: { ...state.sim, evidence: [...state.sim.evidence, text] }, notice: notice("ทดสอบสตรีมผ่าน", text, "success") };
}

/** Outdoor: hold for the all-clear (only after recording NO-GO). */
export function requestAllClear(state: TrainingState): TrainingState {
  if (!state.sim) return state;
  if (state.sim.config.site?.decision !== "NO-GO (hold)") return { ...state, notice: notice("บันทึกการหยุดงานก่อน", "หยุดงานและรอก่อนขอยืนยันว่าปลอดภัย", "error") };
  return { ...state, sim: { ...state.sim, weatherNow: "clear", log: [...state.sim.log, { t: state.sim.tick, kind: "config", text: "รอ 30 นาทีในระบบจำลอง: ไม่มีฟ้าผ่าแล้ว" }] }, notice: notice("ยืนยันว่าปลอดภัยแล้ว", "พายุผ่านแล้ว จำลองการรอ 30 นาที ให้ประเมินพื้นที่ใหม่ก่อนอนุมัติเริ่มงาน", "success") };
}

export function answerQuiz(state: TrainingState, choice: number): TrainingState {
  const q = scenarioOf(state).stage?.quiz;
  if (!state.sim || !q) return state;
  const ok = choice === q.answer;
  return { ...state, sim: { ...state.sim, quizOk: ok || state.sim.quizOk }, notice: notice(ok ? "ถูกต้อง" : "ยังไม่ถูกต้อง", q.why, ok ? "success" : "error") };
}

/** Targeted Learning Review → Mini Mastery Check → Resume. */
export function answerReview(state: TrainingState, choice: number): TrainingState {
  if (!state.sim?.paused || !state.sim.reviewConcept) return state;
  const c = CONCEPTS[state.sim.reviewConcept];
  if (choice !== c.check.answer) return { ...state, notice: notice("ยังไม่ผ่าน", c.check.why, "error") };
  return { ...state, sim: { ...state.sim, paused: false, errors: 0, log: [...state.sim.log, { t: state.sim.tick, kind: "review", text: `ทบทวนแล้ว: ${c.title}` }] }, notice: notice("กลับไปฝึกต่อได้", `ผ่านการทบทวน: ${c.title}`, "success") };
}

/** Sign-off: every objective (except sign-off itself) must pass on the CURRENT graph. */
export function signOff(state: TrainingState): TrainingState {
  if (!state.sim) return state;
  if (scenarioOf(state).designIssues?.length) return { ...state, notice: notice("ใบงานยังไม่พร้อมตรวจรับ", "พบข้อมูลอุปกรณ์หรือสายไม่สอดคล้องกัน กรุณาแจ้งผู้ดูแลพร้อมรหัสด่าน", "error") };
  if (state.sim.paused) return { ...state, notice: notice("พักภารกิจอยู่", "ผ่านคำถามทบทวนก่อนตรวจรับงาน", "error") };
  state = settleSim(state);
  if (!state.sim) return state;
  const ctx = simContext(state)!;
  const missing = STAGE_ORDER.find((s) => !state.sim!.testsPassed[s]);
  if (missing) return { ...state, notice: notice("ยังไม่พร้อมตรวจรับงาน", `ทดสอบ${simThai(missing)}ให้ผ่านก่อน`, "error") };
  const failed = validateLevel(ctx).filter((r) => r.id !== "signoff" && !r.result.ok);
  if (failed.length) return { ...state, notice: notice("ยังไม่พร้อมตรวจรับงาน", failed.slice(0, 3).map((r) => r.label).join(" · "), "error") };
  const sim: SimRuntime = { ...state.sim, signedOff: true, log: [...state.sim.log, { t: state.sim.tick, kind: "test", text: "ตรวจรับและเก็บงานเสร็จแล้ว" }] };
  const signed: TrainingState = { ...state, sim };
  const score = scoreOf(validateLevel(simContext(signed)!), sim);
  if (!score.criticalOk || score.score < 70) return { ...state, notice: notice("ทบทวนคำแนะนำแล้วลองใหม่", `คะแนน ${score.score}/100 · เงื่อนไขสำคัญ${score.criticalOk ? "ผ่าน" : "ไม่ผ่าน"}`, "error") };
  return { ...signed, completed: true, notice: notice(`${simThai(score.grade)} · ${score.score}/100`, `${scenarioOf(state).stage!.reward} — ผลการฝึกในระบบจำลอง`, "success") };
}

export function stageScore(state: TrainingState) {
  const ctx = simContext(state);
  return ctx && state.sim ? scoreOf(validateLevel(ctx), state.sim) : null;
}
