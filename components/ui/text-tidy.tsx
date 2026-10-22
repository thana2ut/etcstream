"use client";

import { useEffect } from "react";

const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE", "NOSCRIPT"]);
const WJ = "⁠"; // word joiner: invisible, forbids a line break at that point

/** Site-wide line-break rules: no split inside "(…)", hyphenated codes, or "กด F" key hints. Text-only; never changes DOM structure. */
export function tidyText(text: string) {
  return text
    .replace(/([A-Za-z0-9])-(?=[A-Za-z0-9])/g, "$1‑")
    .replace(/(กด|ปุ่ม|คีย์) ([A-Za-z0-9]{1,5})\b/g, "$1 $2")
    .replace(/ตัว(ผู้|เมีย)/g, `ตัว${WJ}$1`)
    // only short groups are held together; long ones wrap normally so they never overflow a card
    .replace(/\([^()\n]{1,14}\)/g, (group) => group.replace(/ /g, " ").replace(/([฀-๿])(?=[฀-๿])/g, `$1${WJ}`).replace(new RegExp(`${WJ}+`, "g"), WJ));
}

function fix(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentElement;
    if (!parent || SKIP.has(parent.tagName) || parent.isContentEditable) return;
    const before = node.nodeValue ?? "";
    const after = tidyText(before);
    if (after !== before) node.nodeValue = after;
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE || SKIP.has((node as Element).tagName)) return;
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) fix(n);
}

export function TextTidy() {
  useEffect(() => {
    fix(document.body);
    const observer = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "characterData") fix(r.target);
        else r.addedNodes.forEach(fix);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
