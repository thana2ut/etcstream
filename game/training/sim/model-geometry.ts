/**
 * Exact-proportion geometry for verified hardware that has its own 3D model (Phase 04).
 * Units: metres at REAL size, device origin = bottom centre, front edge (operator side) = +Z, rear panel = −Z,
 * X = the operator's right. Venue scenes draw the model at `displayScale` (uniform, so proportions stay exact) so every
 * socket can be aimed at in first person — the same convention as the studio HDS7105 (`STUDIO.switcherModel.scale`).
 * Values come only from the official manufacturer images listed in `source`; no port is added that is not in them.
 */
import { HARDWARE_GEOMETRY } from "./hardware-geometry";

export type V3 = [number, number, number];
export type SocketKind = "bnc" | "hdmi" | "rj45" | "usbc" | "usbb" | "xlr3f" | "xlr3m" | "xlr4" | "xlr5" | "trs" | "jack35" | "rca" | "dc" | "iec" | "db9" | "db25" | "sfp" | "smpte" | "sd" | "mcx" | "usba" | "multipin" | "optical-lc";
export interface ModelPortGeometry { at: V3; normal: V3; kind?: SocketKind; /** Socket on a supplied, attached lead (pigtail / breakout) rather than the chassis. */ lead?: boolean }
/** A lamp/key colour driven by a device control value (only while the device is powered). */
export interface Lit { key: string; eq: string | boolean; color: string }
/** A physical button that drives an existing simulation control (same path as the Operator Console). */
export interface Press { key: string; value: string | boolean | "toggle" | "cycle"; label: string }
/** Visual parts in metres at real size; `n` is the outward face normal the part sits on. */
export type Part = (
  | { t: "box"; p: V3; s: V3; c: string; round?: boolean }
  | { t: "prism"; profile: [number, number][]; x: [number, number]; c: string }
  /** Photo-derived taper: successive [z, centreY, width, height] sections; chamfer fraction is approximate. */
  | { t: "loft"; sections: [number,number,number,number][]; chamfer: number; c: string }
  | { t: "cyl"; p: V3; r: number; h: number; n: V3; c: string }
  | { t: "key"; p: V3; s: [number, number]; n: V3; c?: string; label?: string; lit?: Lit[]; press?: Press }
  | { t: "screen"; p: V3; s: [number, number]; n: V3; feed?: string }
  | { t: "text"; p: V3; n: V3; text: string; size: number; c?: string }
  | { t: "knob"; p: V3; r: number; n: V3 }
  | { t: "tally"; p: V3; s: V3 }
  | { t: "lathe"; p: V3; n: V3; profile: [number, number][]; c: string }
  | { t: "tube"; points: V3[]; r: number; c: string }
  /** Repeated face details share one instanced draw call (vents, screw wells, rack mounting holes). */
  | { t: "pattern"; p: V3; n: V3; points: [number, number][]; r: number; c: string }
) & { finish?: "metal" | "plastic" | "rubber" | "grille" };
export interface ModelGeometry {
  displayScale: number;
  /** Manufacturer dimensions (bounding box, metres). Gameplay size = size × displayScale. */
  size: V3;
  source: string[];
  /** Registry port key → socket centre on the real body. Every registry port of the model must appear here. */
  ports: Record<string, ModelPortGeometry>;
  /** Physical connectors visible on the real unit that the simulation does not enable (drawn, never connectable). */
  inert: { name: string; at: V3; normal?: V3; kind?: SocketKind }[];
  /** Mounted on a tripod head (cameras): the body origin sits TRIPOD_TOP above the floor/riser. */
  mount?: "tripod";
  parts?: Part[];
  /** Values that are estimated from official photos rather than read from a dimensioned drawing. */
  estimates?: string[];
  /** Optional full visual footprint including attached leads, in real metres; does not change registry dimensions. */
  stagingBounds?: { min: V3; max: V3 };
}
/** Tripod head height (scene metres) for modelled cameras. */
export const TRIPOD_TOP = 1.12;

// ATEM Mini Pro rear panel, measured on the official rear view (237.5 mm = 662 px → 0.3588 mm/px, image centre 331 px).
// The rear view is seen from behind, so image-left is the operator's right (+X).
const RX = (px: number) => +(-(px - 331) * 0.0003588).toFixed(4);
const REAR_Z = -0.1034 / 2;
const rear = (px: number, y: number): ModelPortGeometry => ({ at: [RX(px), y, REAR_Z], normal: [0, 0, -1] });

export const MODEL_GEOMETRY: Record<string, ModelGeometry> = {
  ...HARDWARE_GEOMETRY,
  "bmd-atem-mini-pro": {
    displayScale: 2.5,
    size: [0.2375, 0.035, 0.1034], // 9.35 × 1.38 × 4.07 in (official physical-specifications image)
    source: [
      "https://images.blackmagicdesign.com/images/products/atemmini/techspecs/physical-specifications/atem-mini-pro-imperial.jpg",
      "https://images.blackmagicdesign.com/images/products/atemmini/techspecs/connections/atem-mini-pro.png",
    ],
    ports: {
      "eth": rear(136, 0.016),
      "usb": rear(186, 0.011),
      "hdmi-out": rear(241, 0.0125),
      "hdmi-in-4": rear(308, 0.0125),
      "hdmi-in-3": rear(371, 0.0125),
      "hdmi-in-2": rear(434, 0.0125),
      "hdmi-in-1": rear(498, 0.0125),
      "mic-2": rear(548, 0.0125),
      "mic-1": rear(580, 0.0125),
    },
    inert: [{ name: "POWER (12V DC, locking)", at: [RX(83), 0.0125, REAR_Z] }],
  },
};

/** Smallest centre-to-centre distance between a port and its neighbours, at display scale (for aim-target radius). */
export function portClearance(geo: ModelGeometry, key: string): number {
  const a = geo.ports[key].at;
  let best = Infinity;
  for (const [k, p] of Object.entries(geo.ports)) if (k !== key) best = Math.min(best, Math.hypot(p.at[0] - a[0], p.at[1] - a[1], p.at[2] - a[2]));
  return best * geo.displayScale;
}
