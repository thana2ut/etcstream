"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="fantasy-viewport" style={{ display: "grid", placeItems: "center", padding: 24 }}>
      <section className="glass-card gold-border-frame" style={{ maxWidth: 520, padding: 32, textAlign: "center" }}>
        <h1>ห้องฝึกหยุดทำงานชั่วคราว</h1>
        <p>เกิดข้อผิดพลาดในการโหลด กรุณาลองใหม่อีกครั้ง</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <button type="button" className="cultivation-btn btn-gold btn-md" onClick={reset}>ลองอีกครั้ง</button>
          <Link className="cultivation-btn btn-glass btn-md" href="/">กลับหน้าหลัก</Link>
        </div>
      </section>
    </main>
  );
}
