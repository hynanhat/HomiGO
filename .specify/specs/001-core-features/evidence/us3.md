# US3 Evidence — Seller Listing Lifecycle

Date: 2026-08-14

## Automated verification

- `mvnw.cmd test`: **BUILD SUCCESS** — 32 tests, 0 failures, 0 errors, 0 skipped.
- `ListingServiceTest`: create as DRAFT, ownership denial, submit transition/audit, stale-version conflict, ACTIVE edit re-approval, scheduled expiration/audit.
- `FileStorageServiceTest`: empty file, MIME whitelist, 5 MB limit, traversal filename, non-owner and 10-image limit.
- `SellerListingFlowIntegrationTest`: authenticated SELLER creates DRAFT, uploads a JPEG, submits to PENDING, sees the listing in the paginated dashboard, and a second SELLER receives HTTP 403 when attempting an update.

## MySQL verification

- Used an isolated temporary database named `homigo_phase4_verify`; the existing `homigo` database was not modified.
- Flyway successfully validated and applied migrations V1, V2, V3 and `V4__listing_lifecycle.sql` from an empty schema.
- Application reached `Started BackendApplication` with `spring.jpa.hibernate.ddl-auto=validate` against MySQL 8.
- Temporary verification database was dropped after the check.

## Implemented API

- `POST /api/v1/seller/listings`
- `GET /api/v1/seller/listings`
- `GET|PUT|DELETE /api/v1/seller/listings/{id}`
- `POST /api/v1/seller/listings/{id}/submit`
- `POST /api/v1/seller/listings/{id}/deactivate`
- `POST /api/v1/seller/listings/{id}/images`
- `DELETE /api/v1/seller/listings/{id}/images/{imageId}`

All seller mutations validate listing ownership. State changes are written to `listing_status_history`, and updates require the current optimistic-lock `version`.
