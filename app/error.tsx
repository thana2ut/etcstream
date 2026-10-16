"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="fantasy-viewport" style={{ display: "grid", placeItems: "center", padding: 24 }}>
      <section className="glass-card gold-border-frame" style={{ maxWidth: 520, padding: 32, textAlign: "center" }}>
        <h1>The training room stopped</h1>
        <p>Something went wrong while loading. Please try again.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <button type="button" className="cultivation-btn btn-gold btn-md" onClick={reset}>Try again</button>
          <Link className="cultivation-btn btn-glass btn-md" href="/">Back to home</Link>
        </div>
      </section>
    </main>
  );
}
