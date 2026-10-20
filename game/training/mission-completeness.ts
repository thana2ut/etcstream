import type { Connector, PortDef, Scenario } from "./scenarios";
import { canConnect, modelOf } from "./sim/engine";

const fits = (plug: Connector, port: PortDef) => port.connector === "XLR"
  ? plug === (port.direction === "INPUT" ? "XLR-M" : "XLR-F")
  : port.connector === "COMBO" ? plug === "XLR-M" || plug === "6.35mm" : plug === port.connector;

/** Authoring guard: never installs cables, changes config, evaluates objectives or runs a solver. */
export function missionDesignIssues(scenario: Scenario): string[] {
  if (!scenario.stage || !scenario.simDevices) return [];
  const issues: string[] = [];
  const devices = new Set(scenario.devices.map((d) => d.id));
  const cableIds = new Set(scenario.cables.map((c) => c.id));
  if (devices.size !== scenario.devices.length) issues.push("รหัสอุปกรณ์ซ้ำ");
  if (cableIds.size !== scenario.cables.length) issues.push("รหัสสายซ้ำ");
  const occupied = new Set<string>();
  const assigned = new Set<string>();
  for (const route of scenario.canonical ?? []) {
    const from = scenario.ports[route.from], to = scenario.ports[route.to];
    const cable = scenario.cables.find((c) => c.id === route.cableId);
    if (!from || !to || !cable) { issues.push(`เส้นทางขาดพอร์ตหรือสาย: ${route.from} → ${route.to}`); continue; }
    if (!devices.has(from.device) || !devices.has(to.device)) issues.push(`ไม่พบอุปกรณ์ประจำเส้นทาง: ${route.cableId}`);
    if (assigned.has(cable.id)) issues.push(`ใช้สายเส้นเดิมซ้ำ: ${cable.id}`);
    assigned.add(cable.id);
    for (const id of [route.from, route.to]) {
      if (occupied.has(id)) issues.push(`พอร์ตใช้งานเกินหนึ่งเส้น: ${id}`);
      occupied.add(id);
    }
    if (!fits(cable.ends[0], from) || !fits(cable.ends[1], to)) issues.push(`หัวสายไม่ตรงเส้นทาง: ${cable.id}`);
    const verdict = canConnect(scenario.simDevices, route.from, route.to);
    if (!verdict.ok) issues.push(`สัญญาณไม่รองรับ: ${cable.id} · ${verdict.title}`);
  }
  for (const [id, port] of Object.entries(scenario.ports)) {
    if (!devices.has(port.device) || !port.position.every(Number.isFinite)) issues.push(`พอร์ตไม่มีอุปกรณ์หรือตำแหน่งถูกต้อง: ${id}`);
  }
  for (const setting of scenario.stage.solutionConfig) {
    if (setting.device === "site") continue;
    const control = modelOf(scenario.simDevices, setting.device)?.controls.find((c) => c.key === setting.key);
    if (!control || (control.kind === "select" ? !control.options?.includes(String(setting.value)) : typeof setting.value !== "boolean")) issues.push(`ค่าตั้งเป้าหมายไม่มีในอุปกรณ์: ${setting.device}.${setting.key}`);
  }
  return issues;
}
