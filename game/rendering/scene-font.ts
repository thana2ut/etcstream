/** Local Kart Thai + Geist Latin composite; original font files and Thai shaping tables stay intact. */
export const SCENE_FONT = "/fonts/scene-thai-latin.ttf";
export const SCENE_FONT_FAMILY = "EtcstreamSceneThai";
export const SCENE_CANVAS_FONT = "'EtcstreamSceneThai','Leelawadee UI','Tahoma',sans-serif";

// Kart has Thai and Latin letters but lacks some technical Unicode symbols.
// Use equivalent readable notation in 3D labels instead of fetching remote fallback fonts.
const SYMBOLS: Record<string, string> = {
  "→": " -> ", "⟶": " -> ", "←": " <- ", "↔": " <-> ",
  "·": " | ", "Ω": " ohm", "✓": "OK", "✔": "OK", "°": " deg",
  "‑": "-", "–": "-", "—": "-", "…": "...", "≥": ">=", "≤": "<=", "−": "-", "×": "x", "≈": "~",
};
export function sceneText(text: string): string {
  return text.replace(/[→⟶←↔·Ω✓✔°‑–—…≥≤−×≈]/gu, (symbol) => SYMBOLS[symbol]).replace(/[ \t]{2,}/gu, " ");
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
