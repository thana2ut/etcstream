import { Fragment } from "react";

/** Keep short labels together without changing their original, copyable characters. */
export function NoSplit({ text }: { text: string }) {
  return <>{text.split(/(\([^()]*\)|\b[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+\b)/).map((part, i) =>
    i % 2 && part.length <= 14 ? <span key={i} className="no-split">{part}</span> : <Fragment key={i}>{part}</Fragment>)}</>;
}
