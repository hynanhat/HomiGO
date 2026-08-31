# Tasks: Safe Listing Moderation and Multi-Image Workflow

**Input**: Design documents in `.specify/specs/008-moderation-image-workflow/`  
**Tests**: Required by the feature specification and written alongside each independently testable story.

## Phase 1: Setup and contracts

- [x] T001 Record the reviewed implementation design in `.specify/specs/008-moderation-image-workflow/plan.md`, `research.md`, `data-model.md`, `contracts/api.md`, `contracts/ui.md`, and `quickstart.md`
- [x] T002 Create the V11 migration for removed listings and idempotent image uploads in `backend/src/main/resources/db/migration/V11__moderation_removal_and_image_idempotency.sql`

## Phase 2: Foundational backend model

- [x] T003 Extend listing/notification enums and entities with removed-state and upload-id fields in `backend/src/main/java/com/batdongsan/entity/ListingStatus.java`, `NotificationType.java`, `Listing.java`, and `ListingImage.java`
- [x] T004 Add moderation request/detail/history/seller DTOs and mapping fields in `backend/src/main/java/com/batdongsan/dto/admin/` and `backend/src/main/java/com/batdongsan/dto/ListingRes.java`
- [x] T005 Add locked/detail/history/idempotency/order repository queries in `backend/src/main/java/com/batdongsan/repository/ListingRepository.java`, `ListingStatusHistoryRepository.java`, and `ListingImageRepository.java`

## Phase 3: User Story 1 - Inspect before moderating (P1)

**Goal**: An administrator must inspect complete listing, seller, image, and history data before approve/reject controls appear.

**Independent test**: Open a pending listing from the queue, verify complete content, then approve or reject only from detail.

- [x] T006 [P] [US1] Add backend detail and stale-moderation coverage in `backend/src/test/java/com/batdongsan/service/AdminServiceTest.java` and `backend/src/test/java/com/batdongsan/e2e/AdminModerationFlowIntegrationTest.java`
- [x] T007 [US1] Implement locked admin detail and version-aware approve/reject services in `backend/src/main/java/com/batdongsan/service/AdminService.java`
- [x] T008 [US1] Expose admin detail and version-aware moderation endpoints in `backend/src/main/java/com/batdongsan/controller/AdminController.java`
- [x] T009 [P] [US1] Add frontend admin detail contracts, API calls, and query hooks in `frontend/src/types/domain.ts`, `frontend/src/features/admin/adminApi.ts`, and `adminQueries.ts`
- [x] T010 [P] [US1] Add admin detail page/content/actions/history components in `frontend/src/pages/admin/AdminListingDetailPage.tsx` and `frontend/src/features/admin/components/`
- [x] T011 [US1] Route queue rows to detail and remove direct queue moderation controls in `frontend/src/app/router.tsx` and `frontend/src/pages/admin/ModerationPage.tsx`
- [x] T012 [US1] Add API/component/integration/accessibility tests for the admin inspection journey in `frontend/src/features/admin/adminApi.test.ts`, `frontend/tests/integration/adminWorkspace.test.tsx`, and `frontend/tests/accessibility/accessibility.test.tsx`

## Phase 4: User Story 2 - Remove a published listing safely (P1)

**Goal**: Admin removes an active listing from public discovery with reason/audit/notification, while its owner can remediate it.

**Independent test**: Remove an active listing, verify every public path excludes it, then edit or resubmit it as owner.

- [x] T013 [P] [US2] Add backend removal, validation, notification, and stale-state tests in `backend/src/test/java/com/batdongsan/service/AdminServiceTest.java` and `backend/src/test/java/com/batdongsan/e2e/AdminModerationFlowIntegrationTest.java`
- [x] T014 [US2] Implement the audited ACTIVE-to-REMOVED transition and seller notification in `backend/src/main/java/com/batdongsan/service/AdminService.java` and `NotificationService.java`
- [x] T015 [US2] Expose the validated remove endpoint in `backend/src/main/java/com/batdongsan/controller/AdminController.java`
- [x] T016 [P] [US2] Add owner remediation transitions and removal-reason mapping in `backend/src/main/java/com/batdongsan/service/ListingService.java`
- [x] T017 [P] [US2] Exclude non-public saved listings and add public/remediation regression tests in `backend/src/main/java/com/batdongsan/repository/SavedListingRepository.java`, `backend/src/test/java/com/batdongsan/controller/SavedListingIntegrationTest.java`, and seller/public flow tests
- [x] T018 [US2] Add removal dialog/action, removed badges/reason, seller actions, and notification text in frontend admin/seller/notification components and types
- [x] T019 [US2] Add frontend removal/remediation API, integration, accessibility, and E2E coverage in `frontend/src/features/admin/adminApi.test.ts`, `frontend/tests/integration/adminWorkspace.test.tsx`, `frontend/tests/integration/sellerWorkspace.test.tsx`, and `frontend/e2e/admin.spec.ts`

## Phase 5: User Story 3 - Upload multiple images clearly (P2)

**Goal**: Seller selects several files, sees capacity/progress per item, and retries failures without duplicates.

**Independent test**: Upload three images with one simulated failure, retry it, and verify exactly three server images after reload.

- [x] T020 [P] [US3] Add migration/idempotency/order tests in `backend/src/test/java/com/batdongsan/e2e/MySqlMigrationIntegrationTest.java` and `backend/src/test/java/com/batdongsan/service/FileStorageServiceTest.java`
- [x] T021 [US3] Implement optional upload UUID idempotency and max-plus-one ordering in `backend/src/main/java/com/batdongsan/controller/SellerListingController.java` and `backend/src/main/java/com/batdongsan/service/FileStorageService.java`
- [x] T022 [P] [US3] Extend seller image API with upload UUID/progress in `frontend/src/features/seller/sellerListingApi.ts` and its API tests
- [x] T023 [US3] Rework the image uploader with stable drafts, capacity, per-item status, mutex, retry, input reset, and object URL cleanup in `frontend/src/features/seller/components/ListingImageUploader.tsx`
- [x] T024 [US3] Add multi-select, double-click, partial-failure, retry, and accessibility tests in `frontend/src/features/seller/components/ListingImageUploader.test.tsx` and `frontend/tests/integration/sellerWorkspace.test.tsx`

## Phase 6: Polish and validation

- [x] T025 [P] Add Tab focus containment to the shared modal without regressing Escape/focus restoration in `frontend/src/components/ui/index.tsx` and `frontend/src/components/ui/uiPrimitives.test.tsx`
- [x] T026 [P] Update deployment guidance for host Nginx upload limits in `.specify/specs/008-moderation-image-workflow/quickstart.md`
- [x] T027 Run focused backend and frontend tests and resolve feature regressions
- [x] T028 Run complete backend tests, frontend test/build/lint checks, and document any environment-only validation gaps
- [x] T029 Review the final diff against the feature spec and verify unrelated working-tree changes remain untouched

## Dependencies and execution order

- T001 completes design; T002–T005 establish the shared data/model foundation.
- US1 (T006–T012) is the first functional slice and supplies the detail page reused by US2.
- US2 (T013–T019) depends on the admin detail foundation but remains independently testable from an active listing.
- US3 (T020–T024) only depends on T002–T005 and can be validated separately.
- T025–T029 follow the story implementations.
- Tasks marked `[P]` touch distinct files or test surfaces and are safe to execute concurrently when staffed.

## Implementation strategy

Deliver the responsible moderation view first, add post-publication enforcement/remediation second, then harden the image flow. Each slice must pass its focused tests before full regression validation.
