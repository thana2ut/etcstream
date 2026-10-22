import { Fragment } from "react";

/** Wraps text without splitting a "(…)" group or a hyphenated code ("Type-A", "L-SW") across lines. */
export function NoSplit({ text }: { text: string }) {
  return <>{text.replace(/([A-Za-z0-9])-(?=[A-Za-z0-9])/g, "$1‑").split(/(\([^()]*\))/).map((part, i) =>
    i % 2 ? <span key={i} style={{ whiteSpace: "nowrap" }}>{part}</span> : <Fragment key={i}>{part}</Fragment>)}</>;
}
