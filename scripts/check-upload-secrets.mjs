// Read-only pre-push guard. Never prints a matching secret or file content.
import { execFileSync } from "node:child_process";
const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 96 * 1024 * 1024 });
const patterns = [
  /sb_secret_[A-Za-z0-9_-]{12,}/,
  /gh[pousr]_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /eyJhbGciOi[A-Za-z0-9_-]{50,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  /postgres(?:ql)?:\/\/[^\s]+:[^\s]+@/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];
const legacyAdminPattern = /(?:ADMIN_HASH|PASSWORD_HASH)\s*=\s*["'][a-f0-9]{64}["']/i;
const paths = git("diff", "--cached", "--name-only", "-z").split("\0").filter(Boolean);
const violations = [];
for (const path of paths) {
  if (/(^|\/)(\.env(?:\..*)?|\.arena|\.vercel)(\/|$)/.test(path) && path !== ".env.example") { violations.push(path); continue; }
  if (/\.(?:sqlite(?:-wal|-shm)?|pem|har|zip)$/i.test(path)) { violations.push(path); continue; }
  if (!/\.(?:tsx?|mjs|cjs|js|json|md|sql|ya?ml|txt)$/.test(path) && path !== ".env.example") continue;
  const value = git("show", ":" + path);
  if (patterns.some((p) => p.test(value)) || legacyAdminPattern.test(value)) violations.push(path);
}
const historical = git("log", "--all", "-p", "--format=COMMIT:%H", "--", "*.ts", "*.tsx", "*.mjs", "*.md", "*.json", ".env*");
const historicalMatch = patterns.some((p) => p.test(historical));
const legacyAdminHashInHistory = legacyAdminPattern.test(historical);
// Use this flag only after the owner confirms rotation. It never bypasses current-file or other secret findings.
const rotationAcknowledged = process.argv.includes("--acknowledge-rotated-legacy-admin");
if (violations.length || historicalMatch || (legacyAdminHashInHistory && !rotationAcknowledged)) {
  console.error(JSON.stringify({ blocked: true, stagedPaths: violations, historyRequiresPrivateReview: historicalMatch, legacyAdminHashInHistory, ownerRotationRequired: legacyAdminHashInHistory && !rotationAcknowledged })); process.exitCode = 1;
} else console.log(JSON.stringify({ stagedPathsChecked: paths.length, knownSecretPatterns: "no matches in staged text", legacyAdminHashInHistory, rotationAcknowledged, note: "History is retained. Pattern scanning cannot guarantee absence of every secret." }));
