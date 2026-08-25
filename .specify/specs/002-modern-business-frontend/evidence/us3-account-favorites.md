# US3 — Account and favorites checkpoint

- Date: 2026-08-17
- Delivered: dedicated register/login, safe intended destination, refresh-token rotation and single-flight retry, cross-tab/terminal logout, profile editing, password change, seller upgrade and saved listings.
- Unit/integration: 14 test files and 40 tests passed before the browser checkpoint; includes auth field contracts, concurrent 401 refresh, revoked-session termination and anonymous favorite redirect.
- Browser: `e2e/account.spec.ts` passed 3/3 at 360, 768 and 1440 widths for register → login → reload → favorite → profile → logout.
- Static gates: TypeScript production build and oxlint passed.

Account/favorites checkpoint: PASS.
