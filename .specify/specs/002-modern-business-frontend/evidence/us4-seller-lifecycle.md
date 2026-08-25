# US4 — Seller listing lifecycle checkpoint

- Date: 2026-08-17
- Delivered: USER upgrade, DRAFT create, dependent classification fields, complete validated form, sequential image upload/retry/delete, owned list/detail/edit, optimistic version conflict handling and status-aware lifecycle actions.
- Backend contract correction: `ListingRes` now returns classification IDs and parallel image IDs so edit and image deletion can use real identifiers.
- Frontend: 18 test files / 53 tests passed; build and lint passed.
- Browser: `e2e/seller-publication.spec.ts` passed 3/3 at 360, 768 and 1440 for USER → SELLER → DRAFT → two uploads → PENDING.
- Backend: Maven test suite passed 66/66 using the H2 test profile; MySQL was not required.

Seller lifecycle checkpoint: PASS.
