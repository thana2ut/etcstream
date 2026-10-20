import { simThai } from "@/game/content/sim-thai";

/** Sarabun Regular: existing Thai/Latin subsets merged locally, with original shaping tables. */
export const SCENE_FONT = "/fonts/scene-thai-latin.ttf";
export const SCENE_FONT_FAMILY = "EtcstreamSceneSarabun";
export const SCENE_CANVAS_FONT = "'EtcstreamSceneSarabun','Leelawadee UI','Tahoma',sans-serif";

// Preserve technical notation with readable equivalents for symbols absent from the scene font.
// Use equivalent readable notation in 3D labels instead of fetching remote fallback fonts.
const SYMBOLS: Record<string, string> = {
  "→": " -> ", "⟶": " -> ", "←": " <- ", "↔": " <-> ",
  "·": " | ", "Ω": " ohm", "✓": "OK", "✔": "OK", "°": " deg",
  "‑": "-", "–": "-", "—": "-", "…": "...", "≥": ">=", "≤": "<=", "−": "-", "×": "x", "≈": "~",
};
export function sceneText(text: string): string {
  return simThai(text).replace(/[→⟶←↔·Ω✓✔°‑–—…≥≤−×≈]/gu, (symbol) => SYMBOLS[symbol]).replace(/[ \t]{2,}/gu, " ");
}

let pending: Promise<void> | null = null;
/** Load before scene mount so cached canvas signs never capture a fallback Thai font. */
export function loadSceneFont(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (!pending) {
    pending = new FontFace(SCENE_FONT_FAMILY, `url("${SCENE_FONT}")`).load().then((font) => {
      document.fonts.add(font);
    }).catch((error: unknown) => {
      pending = null;
      throw error;
    });
  }
  return pending;
}

/** World-unit roles share one face and generous Thai line metrics. */
export const SCENE_TYPE = {
  equipmentTitle: { fontSize: 0.06, lineHeight: 1.65, maxWidth: 1.2, color: "#f6ddaa" },
  equipmentSubtitle: { fontSize: 0.04, lineHeight: 1.65, maxWidth: 1.2, color: "#c7e5ef" },
  portLabel: { fontSize: 0.04, lineHeight: 1.65, color: "#edf4ff" },
  statusLabel: { fontSize: 0.045, lineHeight: 1.65, color: "#edf4ff" },
  interactionPrompt: { lineHeight: 1.65, color: "#edf4ff" },
  monitorReadout: { fontSize: 0.05, lineHeight: 1.65, color: "#edf4ff" },
  mapLabel: { lineHeight: 1.65, color: "#edf4ff" },
  helpText: { lineHeight: 1.7, color: "#c7e5ef" },
} as const;
