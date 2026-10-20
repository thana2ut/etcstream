/** Intent channel subscribed ONLY by an authenticated Arena attempt. Public practice/admin stay local. */
export type CompetitionCommand = { method: string; args: unknown[] };
const listeners = new Set<(command: CompetitionCommand) => void>();
export function subscribeCompetitionCommands(listener: (command: CompetitionCommand) => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export const hasCompetitionCommandListeners = () => listeners.size > 0;
export function emitCompetitionCommand(command: CompetitionCommand) { for (const listener of listeners) listener(command); }
