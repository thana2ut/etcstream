import type { Metadata } from "next";
import "../arena/arena.css";
import "./admin.css";
export const metadata: Metadata = { title: "ผู้ดูแลสำนัก · etcstream", robots: { index: false, follow: false } };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
