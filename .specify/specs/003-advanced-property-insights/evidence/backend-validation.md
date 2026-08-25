# Backend validation evidence

Validated on 2026-08-17 (Asia/Ho_Chi_Minh).

## Automated regression

Command: `mvn -o test`

- Result: **BUILD SUCCESS**
- Tests: **96 run, 0 failures, 0 errors, 0 skipped**
- Includes notification service/controller, analytics service/controller, recommendation service/controller and all existing regression/security tests.

## Clean MySQL Flyway validation

MySQL 8.0.46 was used with the isolated temporary schema `homigo_feature003_verify_20260817`.

- Spring Boot started successfully and `/v3/api-docs` returned HTTP 200.
- Hibernate `ddl-auto=validate` completed without a schema mismatch.
- Flyway history contained successful versions V1, V2, V3, V4, V5 and V6.
- `notifications` and `listing_views` were present.
- The daily uniqueness index covered `(listing_id, viewer_hash, viewed_on)`.
- Notification inbox indexes covered `(user_id, created_at)` and `(user_id, read_at, created_at)`.
- Foreign-key delete rules were verified: listing views cascade with the listing; notifications cascade with the recipient and set the optional listing reference to null.

The temporary application process was stopped and the exact temporary schema was removed after validation (`TEMP_SCHEMA_REMAINING=0`). After that isolated check passed, the local `homigo` schema was migrated in place from V5 to V6 through normal application startup. Flyway reports V6 successful, both feature tables are present, existing application data was preserved, and the migration-only backend process was stopped.
