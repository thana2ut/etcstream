// Cosmetic thresholds and transparent scoring; authority stays in server/arena/ranked.ts.
export const SEASON_RULES_V1 = {
  version: "cultivation-v1", maxStages: 5, stagePointCap: 1000,
  provisionalPlayers: 3, provisionalStages: 3,
  tiers: [
    { min: 0, name: "ศิษย์แรกเริ่ม" }, { min: 500, name: "ผู้ฝึกปราณ" },
    { min: 1250, name: "กระบี่เงิน" }, { min: 2250, name: "กระบี่ทอง" },
    { min: 3250, name: "ปรมาจารย์สัญญาณ" }, { min: 4250, name: "เซียนกระบี่สวรรค์" },
  ],
} as const;
