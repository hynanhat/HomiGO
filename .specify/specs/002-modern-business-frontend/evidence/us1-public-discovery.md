# US1 — Public property discovery checkpoint

- Date: 2026-08-17
- Scope: home search, URL-backed filters, responsive grid/list, public-code detail, gallery, facts and contact card.
- Contract/unit/integration result: `npm test` — 10 files, 33 tests passed (includes listing API, search-state and public page suites).
- Browser result: `npm run e2e -- e2e/public-discovery.spec.ts e2e/projects.spec.ts` — 6/6 passed across Chromium viewports 360×800, 768×1024 and 1440×1000.
- Static gates: `npm run build` and `npm run lint` passed.
- Data boundary: deterministic network-level API fixtures; no hard-coded database IDs in application navigation. Listing detail uses `publicCode`.

MVP checkpoint: PASS.
