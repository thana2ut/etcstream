# etcstream Security

## Current security model

etcstream is a client-side educational game. It stores a nickname and local mission progress. It has no password, authentication, or server-side grade authority.

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
