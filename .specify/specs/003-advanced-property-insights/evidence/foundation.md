# Foundation Checkpoint

**Date**: 2026-08-17

- Added Flyway V6 with notification and unique daily listing-view storage.
- Added environment-driven business time zone, analytics HMAC secret and frontend notification polling interval.
- Added repository contracts for active administrators and bounded recommendation candidates.
- Explicitly protected notification routes and permitted only the idempotent public view-recording action.
- Backend offline compilation completed successfully with Maven 3.9.6 and Java 17.

MySQL migration execution is intentionally repeated against a clean V1→V6 schema in T035.
