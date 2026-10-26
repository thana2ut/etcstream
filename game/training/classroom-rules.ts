export const CLASSROOM_REVIVE_COST = 200;
export type ClassroomLearning = { mistakes: number; failed: boolean; question: null };
export const freshClassroomLearning = (): ClassroomLearning => ({ mistakes: 0, failed: false, question: null });
