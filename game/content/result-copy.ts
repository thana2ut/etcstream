/** Content foundation for the future result overlay; no scoring or grade UI is enabled here. */
export const resultCopy = {
  heading: "Trial complete", player: (name: string) => `Trainee ${name}`,
  metrics: { completion: "Mission completion", correct: "Checks passed", incorrect: "Wrong connections", hints: "Hints used", duration: "Time taken", accuracy: "Accuracy" },
  training: { strengths: "What you did well", review: "What to review", examples: ["Chose the correct leads", "Understood OUTPUT → INPUT", "Checked destination ports before connecting", "Planned the whole path before picking up leads"] },
  actions: { return: "Back to the academy", retry: "Train again", next: "Take a new mission" },
  grades: [
    { min: 85, label: "Excellent", narrative: "The signal flows steadily — you now see the system as one connected path." },
    { min: 70, label: "Good", narrative: "Solid basics; check a few points more carefully before connecting." },
    { min: 50, label: "Fair", narrative: "You are on the right path but still hesitate over ports and signal direction." },
    { min: 0, label: "Needs work", narrative: "Practise INPUT, OUTPUT and signal paths again." },
  ],
} as const;
