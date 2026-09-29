import Link from "next/link";

export default function NotFound() {
  return (
    <main className="fantasy-viewport" style={{ display: "grid", placeItems: "center", padding: 24 }}>
      <section className="glass-card gold-border-frame" style={{ maxWidth: 520, padding: 32, textAlign: "center" }}>
        <h1>ไม่พบเส้นทางนี้</h1>
        <p>เส้นทางที่คุณเปิดไม่มีอยู่ในสำนัก</p>
        <Link className="cultivation-btn btn-gold btn-md" href="/">กลับหน้าหลัก</Link>
      </section>
    </main>
  );
}
