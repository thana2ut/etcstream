import { LAYOUTS, VENUE_SCALE, type LayoutId, type Point3 } from "./venue-layouts";

/** Classroom local leads descend outside worktops before crossing the floor. Visual routing only, not a length/power simulation. */
export function classroomCableRoute(a: Point3, b: Point3, venue: LayoutId = "classroom"): Point3[] {
  function drop(p: Point3): Point3 {
    const f = LAYOUTS[venue].furniture.find((f) => p[0] >= f.center[0] - f.size[0] / 2 - 0.08 && p[0] <= f.center[0] + f.size[0] / 2 + 0.08 && p[2] >= f.center[2] - f.size[2] / 2 - 0.08 && p[2] <= f.center[2] + f.size[2] / 2 + 0.08);
    if (!f) return [p[0], p[1], p[2]];
    const candidates: Point3[] = [
      [f.center[0] - f.size[0] / 2 - 0.12, p[1], p[2]], [f.center[0] + f.size[0] / 2 + 0.12, p[1], p[2]],
      [p[0], p[1], f.center[2] - f.size[2] / 2 - 0.12], [p[0], p[1], f.center[2] + f.size[2] / 2 + 0.12],
    ];
    return candidates.sort((a, b) => Math.hypot(a[0] - p[0], a[2] - p[2]) - Math.hypot(b[0] - p[0], b[2] - p[2]))[0];
  }
  const da = drop(a), db = drop(b);
  const service = venue === "auditorium" || venue === "outdoor" || venue === "stadium";
  const lane = LAYOUTS[venue].bounds.maxX - 0.35;
  const insideControl = (p: Point3) => p[0] < -1.1 * VENUE_SCALE.stadium && p[2] < 2.1 * VENUE_SCALE.stadium;
  const crossesControlDoor = venue === "stadium" && insideControl(da) !== insideControl(db);
  const bothInControl = venue === "stadium" && insideControl(da) && insideControl(db);
  const perimeter: Point3[] = !bothInControl && service && Math.abs(da[2] - db[2]) > 4 ? [[lane, 0.025, da[2]], [lane, 0.025, db[2]]] : [];
  let points: Point3[] = [[...a], da, [da[0], 0.025, da[2]], ...perimeter, [db[0], 0.025, db[2]], db, [...b]];
  if (crossesControlDoor) {
    const forward = insideControl(da), origin = forward ? a : b, destination = forward ? b : a;
    const source = forward ? da : db, target = forward ? db : da;
    const k = VENUE_SCALE.stadium, insideX = -1.5 * k, outsideX = -0.5 * k, doorZ = -0.2 * k;
    points = [[...origin], source, [source[0], 0.025, source[2]], [insideX, 0.025, doorZ], [outsideX, 0.025, doorZ], [outsideX, 0.025, target[2]], [target[0], 0.025, target[2]], target, [...destination]];
    if (!forward) points.reverse();
  }
  // Exactly nine sections, including the corner vertices, matching the existing cable mesh budget.
  while (points.length < 10) {
    let longest = -1, at = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const length = Math.hypot(...points[i].map((v, j) => v - points[i + 1][j]));
      if (length > longest) { longest = length; at = i; }
    }
    points.splice(at + 1, 0, points[at].map((v, j) => (v + points[at + 1][j]) / 2) as Point3);
  }
  return points;
}
