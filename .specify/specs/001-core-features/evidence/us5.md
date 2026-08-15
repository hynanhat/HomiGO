# US5 evidence — Project browsing

Date: 2026-08-15

## Automated verification

- `ProjectServiceTest`: 4 tests, 0 failures.
- The deterministic fixture contains three projects in two districts and four
  associated listings covering ACTIVE, expired and PENDING visibility states.
- Project list filtering is verified for district and status with stable
  pagination and DTO-only responses.
- Project detail is resolved by slug and returns a paginated `ListingRes` page
  containing only ACTIVE, unexpired listings.
- Invalid project status returns HTTP 400 and an unknown slug returns HTTP 404
  using the standard API error envelope.

## Schema verification

Flyway V1–V5 was executed against an isolated MySQL 8.0.46 database. Hibernate
schema validation succeeded after all migrations. Verification found:

- all 10 new project detail columns;
- unique project slug;
- district and ward foreign keys;
- project status/update-time index.

The isolated migration database was deleted after verification and the normal
`homigo` database was not modified.

**Checkpoint:** project endpoints are public, paginated, filterable, slug-based
and do not expose JPA entities.
