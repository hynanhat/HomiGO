# Advanced Property Insights traceability

Validated on 2026-08-17 against `spec.md`, `plan.md`, the REST contract and all 37 tasks.

## Functional requirements

| Requirement | Implementation evidence | Automated evidence | Status |
|---|---|---|---|
| FR-001 | `NotificationService.notifyListingSubmitted`, active-admin repository lookup, submit/re-review hooks | `NotificationServiceTest`, full backend suite | Pass |
| FR-002 | approve/reject workflow hooks create one owner notification inside the state-transition transaction | `NotificationServiceTest`, `AdminServiceTest` | Pass |
| FR-003 | private paginated inbox ordered by `createdAt DESC` | `NotificationControllerIntegrationTest`, notification API/component tests | Pass |
| FR-004 | unread filter/count, idempotent mark-one and bulk mark-all | controller/service tests and advanced Playwright inbox scenario | Pass |
| FR-005 | every notification lookup/update is scoped by authenticated recipient ID | cross-account controller/service rejection tests | Pass |
| FR-006 | unique `(listing_id, viewer_hash, viewed_on)` constraint plus atomic insert-ignore | analytics service/controller tests and clean MySQL index validation | Pass |
| FR-007 | authenticated user ID takes precedence; anonymous UUID is HMAC-SHA256 hashed before storage | analytics and visitor-ID unit tests | Pass |
| FR-008 | record-view service resolves only ACTIVE, unexpired public listings | analytics service/controller tests | Pass |
| FR-009 | seller-owner and admin endpoints return total/today/last-seven/daily data for validated 7–90 days | analytics controller/service/component tests | Pass |
| FR-010 | service constructs every date in the selected range and fills missing counts with zero | `ListingAnalyticsServiceTest` | Pass |
| FR-011 | seller ownership check and admin route authorization | analytics cross-owner integration/unit tests and security suite | Pass |
| FR-012 | public endpoint defaults to 6, validates 1–12 and uses deterministic descending score order | recommendation service/controller/API tests | Pass |
| FR-013 | weighted category, transaction, district/province, project, price and area signals; publication/id tie-break | `RecommendationServiceTest` | Pass |
| FR-014 | repository and defensive service filters exclude target, inactive and expired listings | recommendation service/controller tests | Pass |
| FR-015 | navigation badge/inbox, seller metric cards/chart and public recommendation section | component tests plus 360/768/1440 Playwright suite | Pass |
| FR-016 | automated positive, validation, idempotency and authorization coverage for all three capabilities | backend 96/96, frontend 84/84, deterministic Playwright 36/36 | Pass |

## Acceptance scenarios

- **US1:** submit/re-review notifies all active admins; approve/reject/expiration notifies the owner; one/all read mutations update private state; cross-recipient access returns not found. Covered by notification, listing and admin service/controller tests and the notification browser scenario.
- **US2:** the first daily viewer is inserted, repeat viewer is ignored, another viewer hashes differently; owner/admin receive complete statistics and another seller is denied. Covered by analytics service/controller tests, MySQL uniqueness validation and seller browser scenario.
- **US3:** controlled candidates rank by similarity, deterministic tie-break and requested limit; target/inactive/expired items are excluded; frontend has loading, empty and non-blocking error states. Covered by recommendation service/controller/API/component tests and public-detail browser scenario.

## Success criteria

- **SC-001:** 30-second default polling is below the 60-second target and query invalidation refreshes immediately after read actions.
- **SC-002/SC-003/SC-006:** deterministic authorization, deduplication and ranking tests pass without an excluded or cross-account result.
- **SC-004:** seller list → listing detail → visible statistics is within three interactions; the detail view exposes all requested metrics and textual daily data.
- **SC-005:** normal local automated requests completed without timeout; bounded indexed queries and a 200-candidate recommendation cap protect the path. A formal concurrent-load benchmark remains a deployment-capacity activity, not a functional release blocker.
- **SC-007:** all deterministic scenarios pass at 360, 768 and 1440 px, including explicit horizontal-overflow validation on the advanced public page.

## Validation summary

- Backend: 96 tests passed; clean MySQL 8.0.46 Flyway V1→V6 and Hibernate schema validation passed.
- Frontend: 84 tests passed; lint and production build passed.
- Browser: 36 deterministic scenarios passed across all three target widths; 9 opt-in real-backend scenarios were skipped because external demo credentials were intentionally absent.
- Docker remains outside this feature, matching the project decision.
