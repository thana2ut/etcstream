"use client";
import { useState } from "react";
import { AdminPanel, adminLabels, adminSections } from "./admin-panel";
export function CompetitionChamber() {
  const [section, setSection] = useState("overview");
  return <div className="admin-competition-layout"><nav className="admin-subnav" aria-label="ส่วนจัดการแข่งขัน">{adminSections.map((s) => <button key={s} aria-pressed={section === s} onClick={() => setSection(s)}>{adminLabels[s]}</button>)}</nav><div><AdminPanel key={section} section={section} /></div></div>;
}
