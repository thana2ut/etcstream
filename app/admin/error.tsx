"use client";
import Link from "next/link";

export default function AdminError({ retry }: { error: unknown; retry: () => void }) {
  return <main className="arena-shell is-admin"><section className="arena-panel admin-master-gate" role="alert">
    <h1>ไม่สามารถแสดงข้อมูลผู้ดูแลส่วนนี้ได้</h1>
    <p>โปรดลองโหลดหน้าใหม่ หากยังพบปัญหา ให้กลับเข้าศูนย์ควบคุมอีกครั้ง</p>
    <div className="arena-actions"><button onClick={retry}>ลองอีกครั้ง</button><Link href="/admin" prefetch={false}>กลับศูนย์ควบคุม</Link></div>
  </section></main>;
}
