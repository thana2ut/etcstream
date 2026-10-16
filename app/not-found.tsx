import Link from "next/link";

export default function NotFound() {
  return (
    <main className="fantasy-viewport" style={{ display: "grid", placeItems: "center", padding: 24 }}>
      <section className="glass-card gold-border-frame" style={{ maxWidth: 520, padding: 32, textAlign: "center" }}>
        <h1>Route not found</h1>
        <p>The page you opened does not exist in the academy.</p>
        <Link className="cultivation-btn btn-gold btn-md" href="/">Back to home</Link>
      </section>
    </main>
  );
}
