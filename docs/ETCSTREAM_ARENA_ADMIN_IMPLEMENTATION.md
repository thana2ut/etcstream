# ETCSTREAM V3 — Arena and unified administrator implementation

Date: 2026-10-20 (Asia/Bangkok). This records actual source work and isolated verification, not a production deployment or a physical gameplay certification.

## Delivery status and explicit gates

| Phase | Actual state |
|---|---|
| Gate 0 | Read the entire V3 brief including carried-forward V2 contract. Inspected current routes, stores, validators, CLAUDE.md, AGENTS.md, SECURITY.md, project-state notes and supplied ZIP. No existing database/provider/ORM was present. Existing valuable uncommitted work preserved. |
| 1 — supplied art / Welcome / portal | Implemented, source/build checked. Exactly one Arena action added immediately after the existing main Welcome action. Original image files preserved byte-for-byte. Not visually inspected in a browser. |
| 2 — shared identity/data | SQLite schema, operator initialization, server-issued guest sessions, canonical profiles, consent directory/presence and friends APIs/UI implemented. **Owner's real store has NOT been initialized.** Shared multi-browser behavior NOT TESTED. |
| 3 — unified Admin | Server guards, masked operator bootstrap, mandatory first-use rotation, server-only scrypt, all admin API guards, safe compatibility redirect and mission integration implemented. Owner credentials/session have NOT been provisioned or tested. |
| 4 — Time Attack | Isolated real 25-stage 3D route, preflight/cable preparation, assets readiness, 3-second server countdown, timing, typed error penalties, result/history implemented. **All current submissions remain UNDER_REVIEW/unranked. Independent full action replay is NOT IMPLEMENTED.** Public accepted rankings deliberately remain empty. |
| 5 — friends/duel | Real request/accept/decline/cancel/remove/block, consent presence and shared roster implemented. **Live duel is disabled, NOT IMPLEMENTED**, as expressly permitted by V3 when authoritative multiplayer cannot safely be completed. No invented peers/rooms/results. |
| 6 — operations | Guarded player moderation, audit, result invalidation/reinstatement, rules versioning and status pages implemented. Basic server-side search and 100-row admin pagination implemented; advanced typed filters, large-scale optimization, seasons, recovery and full multiplayer dispute tools remain follow-up work. |

Do not represent this as a fully verified ranked competition or a hosted multiuser service. The disabled/unranked fallbacks are intentional safety boundaries; the complete authoritative action ledger and actual two-browser/gameplay verification are still required before ranked/duel rollout.

## Architecture and source of truth

- Original Academy/local progress remains in its original repositories. No local result, nickname match, unfinished-run snapshot or browser `success=true` can create a verified Arena score.
- The additional online identity is server-generated UUID + random 16-hex friend code. Different browsers with duplicate nicknames are distinct principals. Browser nickname can prefill the explicit first-registration form only; it never supplies a roster or authenticates a principal.
- Shared records live in a private SQLite file on ONE Node server (`server/arena/db.ts`, `schema.sql`). Native `node:sqlite` requires a supported Node runtime; implementation/build used Node 24.19.0. No new npm dependency or paid provider was added.
- This follows the V3 explicit small local SQLite/custom opaque-session deployment option. No Supabase deployment/auth configuration exists here; do not claim Supabase Auth/RLS integration. A future hosted Supabase deployment must use Supabase Auth and proper database role/RLS policies rather than transferring this local file to browser storage.
- Player cookies are opaque 256-bit tokens, hashed in storage, HttpOnly, SameSite=Strict, Secure in production, 30-day rolling active lifetime. Administrator tokens expire after eight hours. No role originates in browser registration.
- Native DB transactions serialize friend mutations, attempt transitions and moderation. Unique friend codes, pair records, event sequence keys, append-only audit triggers and indices are in the reviewed schema. SQLite/WAL is a single-server deployment choice, not a multi-instance database service.
- No public initialization endpoint. The runtime refuses an absent/unreviewed store and returns an honest setup-needed message. Production store, administrator or test/demo users were NOT initialized by the agent.

## Owner setup — review FIRST, then execute locally

Repository owner rules prohibit the agent running data migrations/seed/provisioning. V3 also requires the owner to enter the previously supplied bootstrap code in a masked local prompt. Both gates are respected.

1. Review `server/arena/schema.sql` and `scripts/provision-arena.mjs`. The schema creates a NEW isolated Arena store only, not a migration of old browser saves. The script refuses to overwrite any existing target file.
2. In PowerShell verify the project directory is `D:\etcstream`. Run the following separately, yourself:

```powershell
node scripts/provision-arena.mjs
```

3. The terminal asks for the previously supplied numeric initialization code and confirmation with masked input. Do not pass it as a command argument/environment variable or send it in chat. The script stores a salted scrypt hash; it does NOT embed a default credential. It does not independently prove that a numeric value matches the historical code: the operator must enter the correct prior code.
4. If no server is already using port 3000, start the existing normal development command. Do not create a duplicate server:

```powershell
npm run dev
```

5. Open `/admin`. Sign in using the initialized secret. Before private pages open, rotate to a DIFFERENT owner-selected strong secret (14–128 characters, Latin letters plus digits or symbols). Rotation revokes prior administrator sessions. No secret is repeated in this report.
6. Open `/admin/missions` for the existing 25-level mission tools. Existing nickname entry is still needed by that original local module. Legacy `/missions/admin` redirects to `/admin` while signed out, and to `/admin/missions` with an authorized non-rotation session.
7. Open `/arena`. Register an actual guest and opt in to public listing/presence only if desired. An empty database does not show fake players or times.

**Current setup status: NOT RUN / OWNER ACTION REQUIRED.** A successful build or ephemeral test database is not administrator provisioning.

## Environment and deployment

Optional SERVER-ONLY variable names (no secrets/default credentials are defined): `ARENA_DB_PATH`, `ARENA_PUBLIC_ORIGIN`. No `.env.local` was read or edited. Database defaults to the ignored `.arena/arena.sqlite` directory and is forbidden beneath `public`. Restrict filesystem access/Windows ACLs to the service/operator account. Do not expose database/WAL files or backups through a web directory.

For two real browsers/devices to see one another, both must reach the SAME Node server with the SAME persistent database file. `localhost` on two computers is two unrelated servers. Production requires HTTPS (Secure cookies), a trusted reverse proxy/canonical `ARENA_PUBLIC_ORIGIN`, persistent storage, operator-managed backups, supported Node runtime, and a single writable service deployment. Do not use static export or ephemeral/multi-instance hosting for this SQLite mode. A managed shared database/auth/transport adapter remains an external deployment task, not a completed hosted service.

Backup before future migrations: stop the server and back up the private database together with any remaining WAL files to operator-controlled storage. Never copy a live WAL database as a single file and assume it is consistent. No backup, migration, destructive SQL, seed or real provisioning was executed. Existing schema version is 1; future deployed changes require a new corrective migration, not editing an already applied schema.

## Route / authorization / data matrix

| Route | Server guard | Source of truth / actual behavior |
|---|---|---|
| `/` Welcome | Existing original flow | Original local player UI plus exactly one new Arena action; no public admin action |
| `/arena` | Public shell; profile read requires player cookie | Real private profile or explicit guest-registration/setup/error states |
| `/arena/time-attack` | Guest required for attempt create | Existing five chapter keys × five nested levels; immutable attempt rule/version/seed |
| `/arena/time-attack/[id]` | Every read/mutation checks attempt owner | Isolated GameCanvas using existing engine; no Academy completion or run-autosave writes |
| `/arena/friends` | Session required on all data/mutations | DB friend requests, pairs, blocks, consent roster; 30-second bounded polling |
| `/arena/profile` | Session required | DB-owned name/privacy, actual starts/finishes/accepted best/history |
| `/arena/leaderboard` | Privacy-scoped public DTO | Only VERIFIED + non-invalid + eligible public players, exact current scenario/rules version; pagination 25 |
| `/arena/duel` | Public status only | Explicit disabled feature; no match creation, transport or simulated wins |
| `/admin` | Login gate on this SAME route | Server-only password/session/rotation; no alternate login |
| `/admin/overview`, `/admin/players`, `/admin/competitions`, `/admin/leaderboards`, `/admin/matches`, `/admin/friends`, `/admin/settings`, `/admin/audit` | requireAdminPage before private render; API role guard on EVERY call | Actual private DB statistics/moderation/rules/audit; matches disabled |
| `/admin/missions` | Same server guard | Reuses existing MissionHall admin module; no duplicated mission catalog |
| `/missions/admin` | Same session check, redirect only | No browser hash, no independent credential form, no sessionStorage privilege |
| `/api/arena/[...path]` | Server session except register/public accepted board | Explicit public/private DTOs, origin/JSON/body checks for mutations |
| `/api/admin/[...path]` | Only login is public; all others role-guarded | Session/logout/rotation allowed while rotation pending; all private data/mutations otherwise blocked |

All API responses are no-store. Same-origin JSON and bounded 256 KiB bodies are required for mutations; cookies are not readable in JavaScript. Persistent admin login budget is eight attempts per 15 minutes, not evadable via forged proxy-IP headers. Session tokens/hashes/raw evidence/internal moderation notes are not public DTO fields. The private mission launch checks the server session rather than a client tab marker. Original local unlock state is convenience gameplay state, never server authorization.

## Competition contract and honest limitations

- Each actual scenario ID is validated against `SCENARIOS` (`xs/s/m/l/xl` × 1–5). Version is a SHA-256 fingerprint of the exact scenario data; seed and rules JSON/version freeze at attempt creation.
- Preparing/loading does not start the clock. Readiness sets one immutable server start three seconds in the future; repeated ready does not restart a running attempt. Server stores finish/elapsed/penalty/total. Browser interpolation is only a display.
- Existing 3D equipment, ports, inventories, signal simulator, console, physical actions and completion predicates are reused. Arena snapshots/restores the original in-memory training store and does not write original progress/unfinished-run slots.
- Connector/route error observations are queued to a server event sequence; penalties come from the frozen rules. Hint/final-test event types are supported by the API, but automatic comprehensive classification of EVERY gameplay action/hint is not complete. Client events can be withheld or forged and are not ranked authority.
- Submitted cable/item/simulator state is independently checked using server `simContext`/`validateLevel` through physical/signal stages. This is NOT trusted command replay: browser evidence may contain forged configuration/test state. **Every finish is UNDER_REVIEW, never VERIFIED**, even when the preliminary graph passes. No admin button bypasses that boundary.
- Duplicate finish returns the existing result; identity, owner, future start, four-hour cap and current scenario version are checked. Timer continues during pause, hidden tab or disconnect. Reload may reconstruct a fresh room while server time continues; exact reconnect state recovery/competitive action replay remains incomplete.
- Leaderboard selects one best accepted result per player, compares total, elapsed, mistakes, finish then immutable result ID; rejects private/hidden/suspended/deleted/inactivated results and filters friend/last-seven-day scope. Moderation reads fresh state rather than stale rank caches. Public board currently has no accepted records and must remain empty until trusted validation exists.
- Real 1v1, winner races, reconnect grace, authoritative ready/progress transport, seasons, recovery/passkeys and cosmetics are NOT IMPLEMENTED. Duel is hard-disabled, not an enabled setting with fake behavior.

## Moderation semantics and retention

Rename keeps identity, friend code and scores. Clear sets the public name to anonymous and locks player-side name replacement (stale browser nickname is not imported again). Hide removes public listing/board visibility. Suspend blocks player operations but retains evidence. Restore can unlock a nondeleted profile/name. Anonymize is a distinct typed-ID confirmation with reason: clear name, hide/soft-delete, revoke player sessions and remove friendships while retaining attempts by opaque ID. It does not hard-delete another player's records. UI shows the retained attempt count before confirmation. No endpoint removes the only active administrator; player IDs and admin accounts are separate.

Result invalidation/reinstatement changes eligibility with a reason/audit, not player identity and not UNDER_REVIEW-to-VERIFIED promotion. Rules edits create a new version; old attempt JSON is not reinterpreted. Append-only audit records actor, target, action, reason, UTC timestamp and request ID without secrets. Data/backup retention requires an owner-approved policy before any irreversible erasure; no automatic hard-delete job is claimed.

## Supplied artwork traceability

All copied runtime PNGs are byte-identical to the supplied ZIP. Landscape files are 1672×941, nine icons 418×418 with non-opaque alpha verified by Sharp. The original icon sheet, original Welcome screenshot and welcome alternative are reference-only and were NOT copied into runtime public assets. Nineteen existing `public/images` files were hashed before/after: zero changed. `docs/ARENA_V3_ASSET_TRACEABILITY.json` contains per-file SHA-256 and consumers.

| Supplied filename | Runtime destination | Actual consumer | Verification |
|---|---|---|---|
| bg-admin-command-hall.png | `public/assets/arena/bg-admin-command-hall.png` | ArenaShell /admin/* and AdminGate | Source/bytes checked; visual NOT TESTED |
| bg-arena-hub.png | `public/assets/arena/bg-arena-hub.png` | ArenaShell /arena/* | Source/bytes checked; visual NOT TESTED |
| card-duel.png | `public/assets/arena/card-duel.png` | ArenaPortal /arena, /arena/duel | Source/bytes checked; visual NOT TESTED |
| card-friends.png | `public/assets/arena/card-friends.png` | ArenaPortal /arena, /arena/friends | Source/bytes checked; visual NOT TESTED |
| card-leaderboard.png | `public/assets/arena/card-leaderboard.png` | ArenaPortal /arena, /arena/leaderboard | Source/bytes checked; visual NOT TESTED |
| card-time-attack.png | `public/assets/arena/card-time-attack.png` | ArenaPortal /arena, /arena/time-attack | Source/bytes checked; visual NOT TESTED |
| hero-celestial-gate.png | `public/assets/arena/hero-celestial-gate.png` | ArenaBanner /arena | Source/bytes checked; visual NOT TESTED |
| icon-admin.png | `public/assets/arena/icon-admin.png` | AdminGate/AdminShell | Source/bytes checked; visual NOT TESTED |
| icon-arena.png | `public/assets/arena/icon-arena.png` | Welcome new action | Source/bytes checked; visual NOT TESTED |
| icon-duel.png | `public/assets/arena/icon-duel.png` | Arena mode card | Source/bytes checked; visual NOT TESTED |
| icon-friends.png | `public/assets/arena/icon-friends.png` | Arena mode card | Source/bytes checked; visual NOT TESTED |
| icon-leaderboard.png | `public/assets/arena/icon-leaderboard.png` | Arena mode card | Source/bytes checked; visual NOT TESTED |
| icon-profile.png | `public/assets/arena/icon-profile.png` | real player profile summary | Source/bytes checked; visual NOT TESTED |
| icon-settings.png | `public/assets/arena/icon-settings.png` | admin RulesForm | Source/bytes checked; visual NOT TESTED |
| icon-time-attack.png | `public/assets/arena/icon-time-attack.png` | Arena mode card | Source/bytes checked; visual NOT TESTED |
| icon-trophy.png | `public/assets/arena/icon-trophy.png` | Leaderboard section heading (no player award) | Source/bytes checked; visual NOT TESTED |

## Files created / updated for this change

New: `server/arena/{schema.sql,db.ts,auth.ts,service.ts,admin-page.ts}`, `types/node-sqlite.d.ts`, `scripts/provision-arena.mjs`, `components/arena/{shell.tsx,client-api.ts,portal.tsx,play.tsx,admin-panel.tsx}`, `app/arena/{layout.tsx,page.tsx,arena.css,[section]/page.tsx,time-attack/[id]/page.tsx}`, `app/admin/{layout.tsx,page.tsx,[section]/page.tsx,missions/page.tsx}`, both catch-all API route files, supplied runtime assets, `tests/arena-server.test.mjs`, traceability/report files.

Updated locally and narrowly: Welcome `app/page.tsx`, `app/app-shell.css`, `app/play/page.tsx` admin-session check, `components/ui/mission-hall.tsx` admin back-navigation, `game/content/admin-loadout.ts`, legacy `app/missions/admin/page.tsx`, `.gitignore`, `SECURITY.md`. Previously uncommitted gameplay/typography/save changes were preserved. No commit/push or package-major upgrade.

## Actual checks and nonchecks

Executed:
- `npm run lint`: PASS, no remaining warnings in the final run.
- `npm run build`: PASS, including compilation, TypeScript, public and dynamic server route generation.
- `node --check scripts/provision-arena.mjs` (syntax only, does NOT initialize a database).
- `node --test tests/arena-server.test.mjs tests/mission-foundation-qa.test.mjs tests/bag-inventory.test.mjs tests/scene-typography.test.mjs`: 16/16 passed.
- `node --test tests/security-validation.test.mjs tests/mission-progress.test.mjs tests/admin-selection.test.mjs`: 8/8 passed.
- Isolated Arena tests create/remove ONLY a temporary OS-directory fixture database; never the real .arena store. They verify same-name identity separation, clear-name retention, blocking/recipient acceptance, forged/duplicate completion rejection, server timing, role/session/rotation enforcement, CSRF, immutable audit, presence expiry, actual admin API 401s and all 25 version mappings. Fixtures never enter production UI.
- ZIP/file-byte equality, all nine icon alpha channels, all 19 original image hashes; `git diff --check`, branch/status inspection.

NOT TESTED / OWNER VERIFICATION REQUIRED:
- Actual owner bootstrap credential, first-use browser rotation, logout/expiry through Chrome.
- Two independent real browser sessions seeing one shared reachable deployment, friend/presence behavior across tabs/devices.
- Full hands-on Time Attack/25-level Chrome gameplay, asset readiness/countdown/input/penalty UX, exact original-store restoration during route transitions.
- Browser visual checks at 1366×768, 1920×1080, narrow screens, new Welcome spacing, integrated admin mission layout, modal keyboard focus, approved image focal crops.
- Multi-process write races/load, active malicious-browser testing, live deployment backups/recovery/HTTPS proxy/cookie policies.
- 1v1 fairness/expiry/winner races/reconnect: feature not implemented.
- Complete trusted command-ledger/replay and ranked certification: not implemented.
- Full repository test suite was not rerun; historical unrelated test debt is not relabeled as passed.

Final combined regression command:
`node --test tests/arena-server.test.mjs tests/mission-foundation-qa.test.mjs tests/bag-inventory.test.mjs tests/scene-typography.test.mjs tests/security-validation.test.mjs tests/mission-progress.test.mjs tests/admin-selection.test.mjs`: **25/25 passed**, including the added ninth Arena case for authorized API search, immutable old rule snapshots and stale-name resurrection prevention.

No browser control, gameplay automation, real migration, seed, administrator login, hosted service or screenshots are claimed for this task.
