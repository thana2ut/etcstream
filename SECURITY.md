# etcstream Security

## V12 cloud proposal (not migrated/deployed)

`ARENA_BACKEND=supabase` selects the additive cloud API. It accepts only the owner-confirmed project `abtzrovcsomghbuwdmrr`. Supabase Auth supplies identity; nickname/localStorage never supplies account ownership. New tables are accessible to players only through narrow authenticated RPCs. The server-only secret evaluates game commands against the existing deterministic game engine and uses revision checks to serialize updates. No cloud RPC promotes a result to VERIFIED; every completion remains unranked pending independent replay/eligibility review and owner acceptance. Seasons and 1v1 remain disabled.

Cloud owner sessions store only token digests and stage-scoped preview grants in PostgreSQL. Every external `/admin` entry revokes its prior admission; all three chambers share the same main session. A newly generated scrypt hash and explicit rotation flag are required. Login uses a shared database rate budget, same-origin JSON, HttpOnly secure cookies and an eight-hour expiry. Moderation and audit insert occur in one transaction. Hard deletion is unavailable. The owner must provision secrets privately; no setup script was run.

Realtime private-channel broadcasts are refresh hints only. Visible roster and online indicators come from server-stamped 90-second TTL records with consent and block checks. They do not prove continuous connectivity; raw broadcast identity is never trusted. Retention/cleanup, independent final replay, 25-stage eligibility and production acceptance remain launch gates.

> V10 is the current owner override: all three `/admin` chambers use the live MAIN administrator session. Separate Competition credential requirements in historical V8/V9 notes are superseded. See `docs/ETCSTREAM_ADMIN_V10_IMPLEMENTATION_TH.md`. NOT TESTED — OWNER TEST REQUIRED.

## Current security model

The original training game stores a nickname and local mission progress. Those saves are not an authentication or grade authority. The additional Arena module uses server-issued opaque sessions and a private shared SQLite store on one Node server. It does not import local scores as verified competition results.

## Implemented protections

- Content Security Policy (CSP) and HTTP security headers restrict resource loading and framing.
- Play routes accept only known modes, catalog missions, and difficulties 1–5.
- Nicknames and stored player/progress/audio data are validated before use.
- Friendly error and 404 pages avoid showing internal details.
- Dependencies are reviewed with `npm audit` during security checks.

The static Next.js pages require `script-src 'unsafe-inline'` for hydration, and existing React inline styles require `style-src 'unsafe-inline'`. The current 3D room uses troika text rendered in a blob worker, which calls `importScripts` on generated blob URLs, so `script-src blob:` and `worker-src blob:` are required. Three.js GLTFLoader decodes textures embedded in local GLB files through temporary blob URLs, so `img-src blob:` and `connect-src blob:` are required. Room labels use a local font to avoid troika's remote font resolver. Rapier compiles WebAssembly, so `wasm-unsafe-eval` is allowed. `unsafe-eval` is limited to Next.js development tooling. These exceptions are confined to the current game architecture and should be removed if those dependencies are replaced. Google Fonts CSS and font files are the only external resources allowed by the policy.

## Trust boundary

Client-side progress is convenience state only. Players can modify `localStorage`; it cannot prove exam or certification results. Formal assessment requires server-side validation and database storage.

## Reporting vulnerabilities

Report a suspected vulnerability privately to the project maintainer. Include the affected page, steps to reproduce, and expected versus actual behavior. Do not post secrets or exploit details publicly.

## Arena and unified administrator portal (V3)

- `/admin` is the only administrator login. All private pages and APIs enforce server session/role checks; `/missions/admin` only redirects through the same authorization. The former browser password hash and sessionStorage privilege marker have been removed.
- Provisioning is a local masked operator prompt, not an HTTP endpoint. Salted scrypt credentials are stored only in the ignored private database. First login must rotate the numeric bootstrap secret to a new strong secret. No credential is supplied by the repository. Administrative sessions expire after eight hours and are revoked on password rotation.
- Opaque player sessions preserve duplicate nicknames as distinct principals. Public directory and presence require consent. Presence expires after 90 seconds without a fresh server heartbeat. Clearing a name locks server-side name updates so a stale browser preference cannot resurrect it.
- Mutations require same-origin JSON, bounded request bodies and server authorization. Persistent rate budgets protect registration, friend actions, competition starts and admin login. Production cookies require HTTPS. Canonical origin must be configured behind a trusted reverse proxy.
- Time Attack timestamps and penalties are server-stored. Submitted state is independently graph-checked but is not trusted action replay: **all current finishes are unranked UNDER_REVIEW**, including apparently valid browser state. The admin has no button to promote an untrusted submission to verified rank. Duel is disabled pending an authoritative command ledger and multiplayer lifecycle validation.
- SQLite is a local/shared-single-server deployment path, not a hosted multi-region service. Keep its file and backups outside `public`, with restrictive operator filesystem permissions and persistent storage. Multi-instance/cloud hosting needs a supported shared database/auth/transport deployment and separate review.
- Name moderation and anonymization retain attempt identity/history; audit records are append-only through database triggers. There is no automatic hard-deletion or last-superadmin removal endpoint. Public DTOs do not expose credential hashes, sessions, internal notes or raw validation evidence.

See `docs/ETCSTREAM_ARENA_ADMIN_IMPLEMENTATION.md` for setup gates, precise verification and unfinished functionality. No production database migration or administrator provisioning was run by the coding agent.

## Arena V6 source additions (not deployed or tested)

- Additive schema 2 is owner-applied only; the app never migrates on startup. Public rank participation requires separate explicit consent plus public profile visibility. Private histories remain owned-session-only.
- V6 boards require VERIFIED, non-invalid, internally consistent timing, verification timestamp and validation version. Legacy browser evidence is not promoted. The gameplay still lacks authoritative command replay, so current submissions remain UNDER_REVIEW and receive no official points. There is no administrative trust bypass.
- Season rules/stage versions are immutable; transactional closing freezes stage and season snapshots. Moderation can suppress public display without silently rewriting frozen scores. Live scores are derived on the server; no browser-authored season points are accepted.
- Optional high-entropy recovery credentials are returned once to their authenticated owner, stored hashed, expire in 30 days and are single-use. Redeeming revokes previous device sessions. Friend codes and nicknames never grant account access. Do not log request bodies or recovery responses.
- Production mutations require a configured HTTPS canonical origin. SQLite remains a single-server persistent-volume deployment, not an ephemeral/serverless or multi-instance database. See `docs/ARENA_ONLINE_DEPLOY_TH.md` for backup, migration and hosting requirements.


## Unified administrator interface V7 (source implementation; owner QA pending)

- `/admin` is the only administrator UI/login. Three in-page rooms reuse the existing server-authorized session. Legacy `/admin/missions`, `/admin/[section]` and `/missions/admin` are fixed redirect-only handlers to `/admin`; no query flag grants permissions.
- Existing competition APIs retain their authorization, mutation-origin checks and audit logic. The read-only training endpoint runs after the same admin guard and exposes configuration only, never other players' browser saves.
- The authorized root passes only actor identity and session expiry, not credential or session tokens. Expiry/auth-loss/failed periodic session confirmation unmounts protected panels. Server checks remain the actual authority for every admin API.
- Mission Admin reuses the original MissionHall, catalogue and launch contract. Admin inspection completion does not grant player progress or merit. Public gameplay completion keeps its existing path.
- No provisioning, migration, credential changes, tests or runtime security validation were performed for V7. See `docs/ETCSTREAM_ADMIN_V7_IMPLEMENTATION_TH.md`.


## Administrator chambers V8 — current owner override (NOT TESTED)

This supersedes conflicting V7 entry/preview notes above. `/admin` always starts with a locked entry component and no protected server data. An origin-checked entry-reset POST revokes the previous admin cookie/session before enabling code submission. Successful master verification creates a new ephemeral server entry bound to the existing opaque HttpOnly session; a saved cookie alone cannot recreate an entry after process restart. Main-entry identifiers prevent another entry's UI silently continuing after its session changes.

Competition reads and mutations additionally require a separate server-verified competition grant bound to that main entry. The distinct salted credential is stored outside public/source in an ignored private file, never substituted with the main password. Existing files are never overwritten by the new owner-only setup script. Leaving Competition revokes its grant; logout revokes the entry, competition and preview privileges. Explicit public exit waits for logout; pagehide also sends best-effort keepalive logout. Browser/network termination cannot guarantee delivery of an unload request; a new page entry always resets prior access before login. Server session expiry remains enforced.

Training/Mission previews are process-local, expiring stage-scoped grants created by authenticated POST only. The original GameCanvas/controller/graph/bag/console render inside the authenticated `/admin` view. Preview does not hydrate an academy profile, write run saves, call completion/merit/rank services or post competition results. Only real predefined infrastructure connections remain; no solution is auto-connected. The public `/play` no longer auto-packs based on a locally saved admin selection. Ambiguous training stock/requirements fail with a diagnostic instead of guessed inventory.

Process-local grants intentionally fail closed on restart and require a single Node server (consistent with the current SQLite deployment). Multi-instance/serverless deployments need a shared grant store and separate infrastructure review. V8 was not executed, deployed, provisioned, browser-checked or tested. See `docs/ETCSTREAM_ADMIN_V8_IMPLEMENTATION_TH.md`.


## V9 shared ranked recovery and command evidence (current; NOT TESTED)

V9 supersedes older notes that no action ledger exists: the new path persists ordered, append-only commands and server-owned replay state in SQLite, replays from the initial stage/bag/seed on finish, and computes timing/penalties on the server. Only the classroom xs-1 slice is eligible, and only after owner QA and explicit ARENA_VERIFIED_SLICE_ENABLED=1; default is off. The other 24 stages and all legacy snapshot evidence remain unverified. This validates AV game commands, not human identity, movement or bot resistance. Admin previews and demo content never create ranked results.

Readiness checks actual schema objects with schema-contract.json, not just a version marker. Owner-only setup-online-ranked.mjs creates a consistent backup and applies additive repairs/V9 transactionally; the application never auto-migrates. The agent did not run it. DB exceptions are mapped to safe Thai categories; no connection paths/SQL/credentials are exposed publicly.

New nickname claims are NFC-normalized and uniqueness-guarded without merging historical duplicate identities. Recovery, privacy, consent and immutable player IDs retain their existing server owners. Five DEMO names live in a separate sample source, never production player/session/run tables. Visibility requires both environment opt-in and Competition Admin authorization with an audit reason. V8 master entry, separate competition gate and three-chamber scope remain in force.

SQLite plus process-local V8 grants still require one persistent Node instance. Public internet availability, migration and all runtime/security verification await the owner. See docs/ONLINE_RANKED_SETUP_TH.md and docs/ONLINE_RANKED_MANUAL_CHECKLIST_TH.md.
> Legacy competition gate endpoints still require the main session; logout/expiry revokes all chamber access. Existing private credential files are untouched and no separate secret is read or required.
