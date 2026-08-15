# US4 Evidence — Admin Moderation

Date: 2026-08-14

## Automated verification

- `mvnw.cmd verify`: **BUILD SUCCESS** — 38 tests, 0 failures, 0 errors, 0 skipped.
- `AdminServiceTest` verifies:
  - only PENDING listings can be approved or rejected;
  - approval stores the admin, approval/publication timestamps and an exact 30-day expiration;
  - rejection stores the required reason and status history;
  - banning a seller revokes active refresh tokens, deactivates all ACTIVE listings and audits each transition.
- `AdminModerationFlowIntegrationTest` verifies through HTTP:
  - paginated PENDING moderation queue;
  - invalid status filter returns HTTP 400;
  - approved listing becomes public;
  - blank rejection reason returns validation error;
  - valid rejection remains hidden and exposes the reason to the seller workflow;
  - banning hides the previously public listing and revokes the stored refresh token;
  - SELLER receives HTTP 403 for the moderation API.
- Existing security integration tests verify anonymous/USER access boundaries and ADMIN route authorization.

## Contract endpoints

- `GET /api/v1/admin/listings?status=PENDING&page=0&size=10`
- `POST /api/v1/admin/listings/{id}/approve`
- `POST /api/v1/admin/listings/{id}/reject` with `{ "reason": "..." }`
- `GET /api/v1/admin/users?page=0&size=10`
- `POST /api/v1/admin/users/{id}/ban` with `{ "reason": "..." }`
- `POST /api/v1/admin/users/{id}/unban`

All moderation mutations execute inside Spring transactions. Listing state transitions write `listing_status_history` with the authenticated admin as `changed_by`.

## Database note

Phase 5 introduces no schema change. The V1–V4 Flyway schema validated in Phase 4 already contains approval, expiration, rejection, refresh-token and status-history fields required by this phase, so no additional migration or live MySQL operation was necessary.
