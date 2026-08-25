# Validation Evidence: SePay Seller Upgrade

Date: 2026-08-17

## Automated checks

- Backend: `mvn -q test` — 101 tests, 0 failures, 0 errors, 0 skipped.
- Frontend: `npm test` — 36 files / 89 tests passed.
- Frontend lint: `npm run lint` — passed.
- Frontend production build: `npm run build` — passed.
- Playwright SePay→Seller→listing flow: 3/3 passed at 360px, 768px and 1440px.

## Database

- Clean MySQL 8 migration V1→V7 succeeded in an isolated temporary schema.
- Result: 14 tables; `seller_upgrade_payments` includes provider order and transaction identifiers.
- Temporary validation schema was dropped after the check.
- Local `homigo` Flyway history reports V7 `seller upgrade payments` successful.

## Runtime

- Backend: `http://localhost:8080`, process 8200.
- Frontend dev server: `http://localhost:5173`, process 13720.
- Runtime intentionally has no SePay secret until the exposed credential is rotated.
