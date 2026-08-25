# Tasks: Advanced Property Insights

**Input**: Design documents from `.specify/specs/003-advanced-property-insights/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Automated service, controller and frontend tests are required by FR-016 and the project constitution.

**Organization**: Tasks are grouped by user story so notifications, analytics and recommendations remain independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can be implemented in parallel because it targets different files and has no dependency on an incomplete task.
- **[Story]**: Maps a task to User Story 1, 2 or 3.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add storage and environment configuration used by the advanced feature set.

- [x] T001 Create the V6 notification and unique daily view schema with foreign keys, uniqueness constraints and indexes in `backend/src/main/resources/db/migration/V6__notifications_views.sql`
- [x] T002 [P] Add business-zone and analytics HMAC-secret configuration to `backend/src/main/resources/application.yml`, `.env.example`, and `frontend/.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Prepare shared repository/security contracts before user-story endpoints are exposed.

**⚠️ CRITICAL**: User story implementation begins only after this phase passes backend compilation.

- [x] T003 Add active-admin lookup and bounded public recommendation candidate query foundations in `backend/src/main/java/com/batdongsan/repository/UserRepository.java` and `backend/src/main/java/com/batdongsan/repository/ListingRepository.java`
- [x] T004 Register authenticated notification access and the explicit public listing-view action in `backend/src/main/java/com/batdongsan/config/SecurityConfig.java`
- [x] T005 Compile the backend foundation and record the checkpoint in `.specify/specs/003-advanced-property-insights/evidence/foundation.md`

**Checkpoint**: Flyway schema, configuration, repository contracts and endpoint authorization rules compile.

---

## Phase 3: User Story 1 - Theo dõi thông báo trong ứng dụng (Priority: P1) 🎯 MVP

**Goal**: Notify active administrators about pending listings, notify owners about moderation/expiration outcomes, and let every authenticated user manage a private inbox.

**Independent Test**: Submit and moderate a listing, verify correct recipients/unread count, mark messages read and confirm cross-account access is denied.

### Tests for User Story 1

- [x] T006 [P] [US1] Write notification creation, recipient ownership and idempotent read unit tests in `backend/src/test/java/com/batdongsan/service/NotificationServiceTest.java`
- [x] T007 [P] [US1] Write notification inbox/count/read authorization integration tests in `backend/src/test/java/com/batdongsan/controller/NotificationControllerIntegrationTest.java`

### Implementation for User Story 1

- [x] T008 [US1] Create notification enum/entity/repository and response DTOs in `backend/src/main/java/com/batdongsan/entity/NotificationType.java`, `backend/src/main/java/com/batdongsan/entity/Notification.java`, `backend/src/main/java/com/batdongsan/repository/NotificationRepository.java`, and `backend/src/main/java/com/batdongsan/dto/notification/`
- [x] T009 [US1] Implement private inbox queries, unread counts, read actions and workflow notification factories in `backend/src/main/java/com/batdongsan/service/NotificationService.java`
- [x] T010 [US1] Connect submit/re-review/expiration and approve/reject transitions to notifications in `backend/src/main/java/com/batdongsan/service/ListingService.java` and `backend/src/main/java/com/batdongsan/service/AdminService.java`
- [x] T011 [US1] Expose paginated inbox, unread count, mark-one and mark-all endpoints in `backend/src/main/java/com/batdongsan/controller/NotificationController.java`
- [x] T012 [P] [US1] Add typed notification API calls and 30-second query polling in `frontend/src/features/notifications/notificationApi.ts` and `frontend/src/features/notifications/notificationQueries.ts`
- [x] T013 [US1] Build the unread badge and accessible notification menu in `frontend/src/features/notifications/components/NotificationBell.tsx` and integrate it in `frontend/src/components/layout/Navigation.tsx`
- [x] T014 [US1] Build the paginated/filterable notification inbox and route in `frontend/src/pages/NotificationsPage.tsx` and `frontend/src/app/router.tsx`
- [x] T015 [US1] Add notification UI/API tests in `frontend/src/features/notifications/notificationApi.test.ts` and `frontend/src/features/notifications/components/NotificationBell.test.tsx`

**Checkpoint**: User Story 1 works independently across backend and frontend.

---

## Phase 4: User Story 2 - Xem thống kê lượt xem tin đăng (Priority: P2)

**Goal**: Record one privacy-conscious view per viewer/listing/day and show authorized owners/admins totals plus a complete daily series.

**Independent Test**: Repeatedly view one active listing from two visitor IDs, verify exactly two daily views, owner/admin access and non-owner denial.

### Tests for User Story 2

- [x] T016 [P] [US2] Write HMAC identity, daily deduplication, zero-fill statistics and authorization unit tests in `backend/src/test/java/com/batdongsan/service/ListingAnalyticsServiceTest.java`
- [x] T017 [P] [US2] Write public recording and seller/admin statistics endpoint integration tests in `backend/src/test/java/com/batdongsan/controller/ListingAnalyticsControllerIntegrationTest.java`

### Implementation for User Story 2

- [x] T018 [US2] Create listing-view entity/repository projections and validated analytics DTOs in `backend/src/main/java/com/batdongsan/entity/ListingView.java`, `backend/src/main/java/com/batdongsan/repository/ListingViewRepository.java`, and `backend/src/main/java/com/batdongsan/dto/analytics/`
- [x] T019 [US2] Implement active-listing recording, HMAC pseudonyms, daily deduplication, ownership/admin checks and zero-filled statistics in `backend/src/main/java/com/batdongsan/service/ListingAnalyticsService.java`
- [x] T020 [US2] Expose public record-view and seller/admin statistics contracts in `backend/src/main/java/com/batdongsan/controller/ListingController.java`, `backend/src/main/java/com/batdongsan/controller/SellerListingController.java`, and `backend/src/main/java/com/batdongsan/controller/AdminController.java`
- [x] T021 [P] [US2] Add persistent anonymous visitor ID, analytics API calls and queries in `frontend/src/features/analytics/visitorId.ts`, `frontend/src/features/analytics/analyticsApi.ts`, and `frontend/src/features/analytics/analyticsQueries.ts`
- [x] T022 [US2] Record a view after public detail success in `frontend/src/pages/ListingDetailPage.tsx`
- [x] T023 [US2] Build responsive metric cards and an accessible daily bar chart in `frontend/src/features/analytics/components/ListingStatistics.tsx` and integrate it in `frontend/src/pages/SellerListingDetailPage.tsx`
- [x] T024 [US2] Add visitor ID, analytics API and statistics component tests in `frontend/src/features/analytics/visitorId.test.ts`, `frontend/src/features/analytics/analyticsApi.test.ts`, and `frontend/src/features/analytics/components/ListingStatistics.test.tsx`

**Checkpoint**: User Story 2 works independently and repeated views remain idempotent.

---

## Phase 5: User Story 3 - Khám phá bất động sản phù hợp (Priority: P3)

**Goal**: Rank explainable similar active listings and show them on the public detail page.

**Independent Test**: Use controlled candidates to verify category/location/project/price/area ordering and exclusion of target, inactive and expired listings.

### Tests for User Story 3

- [x] T025 [P] [US3] Write deterministic scoring, reasons, limit and tie-break unit tests in `backend/src/test/java/com/batdongsan/service/RecommendationServiceTest.java`
- [x] T026 [P] [US3] Write public recommendation endpoint validation tests in `backend/src/test/java/com/batdongsan/controller/RecommendationControllerIntegrationTest.java`

### Implementation for User Story 3

- [x] T027 [US3] Create recommendation DTOs and implement bounded eligibility, normalized scoring, reasons and deterministic ordering in `backend/src/main/java/com/batdongsan/dto/recommendation/` and `backend/src/main/java/com/batdongsan/service/RecommendationService.java`
- [x] T028 [US3] Expose the validated public recommendation endpoint in `backend/src/main/java/com/batdongsan/controller/ListingController.java`
- [x] T029 [P] [US3] Add typed recommendation API/query modules and card section in `frontend/src/features/recommendations/recommendationApi.ts`, `frontend/src/features/recommendations/recommendationQueries.ts`, and `frontend/src/features/recommendations/components/RecommendationSection.tsx`
- [x] T030 [US3] Integrate recommendation loading, empty and error states in `frontend/src/pages/ListingDetailPage.tsx`
- [x] T031 [US3] Add recommendation API and component tests in `frontend/src/features/recommendations/recommendationApi.test.ts` and `frontend/src/features/recommendations/components/RecommendationSection.test.tsx`

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate migrations, regression safety, responsive behavior and demo readiness.

- [x] T032 Add responsive notification, analytics and recommendation styles with reduced-motion/accessibility handling in `frontend/src/styles/components.css`, `frontend/src/styles/responsive.css`, and `frontend/src/styles/accessibility.css`
- [x] T033 [P] Update feature setup and demo instructions in `README.md` and `.specify/specs/003-advanced-property-insights/quickstart.md`
- [x] T034 Add deterministic end-to-end scenarios for notification navigation, view recording/statistics and recommendations in `frontend/e2e/advanced-insights.spec.ts`
- [x] T035 Run the complete backend test suite and a clean MySQL V1→V6 Flyway validation, recording results in `.specify/specs/003-advanced-property-insights/evidence/backend-validation.md`
- [x] T036 Run frontend unit tests, lint, production build and Playwright at 360/768/1440 widths, recording results in `.specify/specs/003-advanced-property-insights/evidence/frontend-validation.md`
- [x] T037 Validate every requirement and acceptance scenario, mark all completed tasks, and record traceability in `.specify/specs/003-advanced-property-insights/evidence/traceability.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 and blocks all user stories.
- **User Story 1 (Phase 3)**: Starts after Phase 2; MVP notification slice.
- **User Story 2 (Phase 4)**: Starts after Phase 2 and is independently testable; implemented after US1 for sequential delivery.
- **User Story 3 (Phase 5)**: Starts after Phase 2 and is independently testable; implemented after US2 for sequential delivery.
- **Polish (Phase 6)**: Depends on all selected user stories.

### User Story Dependency Graph

```text
Setup → Foundation ┬→ US1 Notifications
                   ├→ US2 View analytics
                   └→ US3 Recommendations

US1 + US2 + US3 → Polish and full validation
```

### Within Each User Story

1. Write service/controller tests and confirm the new tests initially fail or do not compile.
2. Add entities/DTOs/repositories before services.
3. Add services before controllers.
4. Add frontend API/query modules before components/pages.
5. Run focused backend/frontend tests at the story checkpoint.

### Parallel Opportunities

- T001 and T002 can proceed in parallel.
- Test skeletons marked `[P]` can be written independently before their story implementation.
- Frontend API modules marked `[P]` can begin once the corresponding contract is stable.
- US1, US2 and US3 can be assigned to separate developers after Phase 2, though the current plan delivers them sequentially.

## Parallel Examples

### User Story 1

```text
T006 NotificationService unit tests
T007 NotificationController integration tests
```

### User Story 2

```text
T016 ListingAnalyticsService unit tests
T017 ListingAnalyticsController integration tests
```

### User Story 3

```text
T025 RecommendationService unit tests
T026 RecommendationController integration tests
```

## Implementation Strategy

### MVP First

1. Complete database/configuration setup and shared authorization.
2. Complete US1 notification workflow and inbox.
3. Run the US1 checkpoint; it is demoable without analytics or recommendations.

### Incremental Delivery

1. **MVP**: In-app notifications close the seller/admin moderation loop.
2. **Increment 2**: Unique view analytics give sellers measurable listing performance.
3. **Increment 3**: Explainable recommendations improve public discovery.
4. **Final**: Full migration, regression, accessibility and responsive validation.

## Notes

- No Docker task is included, matching the user's decision to postpone containerization.
- All user-facing copy is Vietnamese; code identifiers remain English.
- No WebSocket, external notification provider, analytics tracker, AI service or chart dependency is added.
- Completed tasks must be changed from `[ ]` to `[x]` immediately after their validation checkpoint.
