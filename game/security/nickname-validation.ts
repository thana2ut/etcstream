export function validateNickname(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const nickname = value.trim();
  if (nickname.length < 2 || nickname.length > 20) return null;
  // Keep the existing Thai/English name UX while excluding markup and controls.
  if (!/^[\p{Script=Thai}A-Za-z0-9 ]+$/u.test(nickname)) return null;
  return nickname;
}
