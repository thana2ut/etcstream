"use client";

import { useEffect, useRef } from "react";

/**
 * Drifting cloud layers with depth. Each layer is a seamless procedural cloud tile
 * (SVG feTurbulence, stitched so it repeats without seams) that scrolls sideways at
 * its own speed; nearer layers are larger, faster and move more with the pointer.
 */
function cloudTile(seed: number, frequency: number, octaves: number, density: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='700'>
<filter id='c' x='0' y='0' width='100%' height='100%'>
<feTurbulence type='fractalNoise' baseFrequency='${frequency} ${frequency * 2.2}' numOctaves='${octaves}' seed='${seed}' stitchTiles='stitch'/>
<feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${density} 0 0 0 ${-density * 0.52}'/>
<feGaussianBlur stdDeviation='2'/>
</filter>
<rect width='100%' height='100%' filter='url(#c)'/>
</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const LAYERS = [
  { tile: cloudTile(7, 0.0022, 5, 2.4), className: "cloud-layer-far" },
  { tile: cloudTile(19, 0.0032, 4, 2.8), className: "cloud-layer-mid" },
  { tile: cloudTile(41, 0.0045, 4, 3.2), className: "cloud-layer-near" },
];

export function CloudSky() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        node.style.setProperty("--sky-px", ((event.clientX / window.innerWidth) - 0.5).toFixed(3));
        node.style.setProperty("--sky-py", ((event.clientY / window.innerHeight) - 0.5).toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", onMove); };
  }, []);

  return (
    <div ref={root} className="cloud-sky" aria-hidden="true">
      {LAYERS.map((layer) => (
        <div key={layer.className} className={`cloud-layer ${layer.className}`}>
          <div className="cloud-layer-drift" style={{ backgroundImage: layer.tile }} />
        </div>
      ))}
    </div>
  );
}
