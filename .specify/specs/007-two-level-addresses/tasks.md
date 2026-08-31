# Tasks: Two-Level Production Addresses

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Scope boundary**: Clean cutover only. Do not implement legacy mapping, review queues, dual reads, district compatibility, or demo business data. Never edit Flyway V1–V9.

## Phase 1: Setup and Safety Baseline

**Purpose**: Freeze current behavior, inventory every district dependency, and make the destructive boundary reviewable before implementation.

- [ ] T001 Confirm `.specify/feature.json` selects `007-two-level-addresses` and review the feature artifacts/checklist without changing unrelated work
- [ ] T002 Record current V1–V9 schema objects, foreign-key/index names, and every backend/frontend district/ward reference in `.specify/specs/007-two-level-addresses/evidence/baseline.md`
- [ ] T003 [P] Add a production deployment evidence template covering backup identity, maintenance mode, operator counts, V10 outcome, ADMIN release IDs/checksums, health, and recovery decision in `.specify/specs/007-two-level-addresses/evidence/deployment.md`
- [ ] T004 [P] Verify the normalization/source artifact directories are ignored only where appropriate and that immutable normalized artifacts will be committed, without changing unrelated ignore rules

---

## Phase 2: Foundational Types and Test Fixtures

**Purpose**: Establish shared release/location/category concepts and clean two-level fixtures used by all stories.

- [ ] T005 Add administrative/category release status, province type, and commune-level type enums under `backend/src/main/java/com/batdongsan/entity/`
- [ ] T006 [P] Add ADMIN release/catalog request and response DTOs under `backend/src/main/java/com/batdongsan/dto/admin/location/` with Bean Validation and Vietnamese messages
- [ ] T007 [P] Add public `ProvinceRes` and `CommuneUnitRes` DTO contracts using string official codes under `backend/src/main/java/com/batdongsan/dto/location/`
- [ ] T008 Replace legacy three-level SQL fixtures with deterministic two-level test fixtures in `backend/src/test/resources/db/listing-search-fixture.sql`, `project-browsing-fixture.sql`, and `search-benchmark-seed.sql`
- [ ] T009 [P] Replace shared frontend location fixtures/types with province/commune string codes and add release/category fixtures in `frontend/tests/fixtures/apiFixtures.ts`
- [ ] T010 Add stable dataset/catalog error codes and centralized Vietnamese response assertions in `backend/src/main/java/com/batdongsan/exception/ErrorCode.java` and relevant exception-handler tests

**Checkpoint**: Tests can describe the clean two-level domain without relying on district entities or legacy review data.

---

## Phase 3: User Story 1 — Safe Empty-Database Cutover (Priority: P1)

**Goal**: V10 aborts before DDL when listings/projects are non-empty and otherwise replaces the legacy schema completely.

**Independent Test**: Migrate controlled V9 databases containing a listing, a project, and no business rows; prove fail-with-zero-schema-change for the first two and complete clean schema for the third.

### Tests

- [ ] T011 [US1] Expand `backend/src/test/java/com/batdongsan/e2e/MySqlMigrationIntegrationTest.java` to migrate to V9, insert one listing, attempt V10, and compare legacy tables/columns/FKs before and after failure
- [ ] T012 [US1] Add the equivalent non-empty-project V10 abort case in `backend/src/test/java/com/batdongsan/e2e/MySqlMigrationIntegrationTest.java`
- [ ] T013 [US1] Add the empty V9 success case asserting no `districts`/legacy `wards`, no `district_id`/legacy `ward_id`, required new tables/columns/FKs/indexes, and successful Hibernate validation
- [ ] T014 [P] [US1] Add a migration naming/checksum test proving V1–V9 remain unchanged and V10 is the only new schema version

### Implementation

- [ ] T015 [US1] Implement `backend/src/main/resources/db/migration/V10__two_level_addresses_clean_cutover.sql` with prepared fail-fast `listings` and `projects` count checks before the first DDL statement
- [ ] T016 [US1] In V10, create administrative/category release and singleton state tables plus clean `administrative_provinces` and `commune_units` tables with required keys/checks/indexes
- [ ] T017 [US1] In V10, add required `administrative_province_id`/`commune_unit_id` and composite parent-consistency foreign keys/indexes to empty `listings` and `projects`
- [ ] T018 [US1] In V10, remove listing/project legacy location FKs/indexes/columns and drop `wards`, `districts`, and legacy `provinces` in dependency order
- [ ] T019 [US1] Add `AdministrativeProvince`, `CommuneUnit`, and release/catalog-state entities, update `Listing`/`Project`, and delete active legacy `Province`/`District`/`Ward` mappings in `backend/src/main/java/com/batdongsan/entity/`
- [ ] T020 [US1] Replace `DistrictRepository`/`WardRepository` with clean province/commune and release/catalog repositories under `backend/src/main/java/com/batdongsan/repository/`

**Checkpoint**: V10 has a proven fail-before-DDL path and a proven complete clean-cutover path; there is no dual schema.

---

## Phase 4: User Story 2 — Verified Reference Data (Priority: P1)

**Goal**: ADMIN validates and activates the pinned 34/3,321 official snapshot and 16-category catalog idempotently without business data.

**Independent Test**: Validate and activate both bundled artifacts twice; verify provenance, exact counts, one active release per catalog, unchanged repeated counts, and zero business rows.

### Artifact and Validator Tests

- [ ] T021 [P] [US2] Add exact global/type/per-province count, code format/uniqueness, Unicode, parent, sentinel, Ia Mơ correction, checksum, and malformed-artifact tests in `backend/src/test/java/com/batdongsan/service/AdministrativeDatasetValidatorTest.java`
- [ ] T022 [P] [US2] Add exact 16/8/8, slug uniqueness, name/type conflict, checksum, and malformed-artifact tests in `backend/src/test/java/com/batdongsan/service/ProductionCategoryCatalogValidatorTest.java`
- [ ] T023 [P] [US2] Add validate/activate/state/idempotency/version-conflict/concurrency/rollback tests in `AdministrativeDatasetServiceTest.java`, `ProductionCategoryCatalogServiceTest.java`, and `integration/CatalogActivationConcurrencyTest.java`
- [ ] T024 [P] [US2] Add ADMIN-only endpoint/OpenAPI/error-envelope tests in `backend/src/test/java/com/batdongsan/controller/AdminLocationDatasetIntegrationTest.java` and `OpenApiContractIntegrationTest.java`
- [ ] T025 [P] [US2] Add fresh-database activation proof for 34/3,321/16 and zero users/projects/listings/payments/views/analytics in `backend/src/test/java/com/batdongsan/e2e/ProductionBootstrapIntegrationTest.java`

### Artifacts and Backend Implementation

- [ ] T026 [US2] Implement reviewed offline normalization and manifest generation in `scripts/administrative-data/normalize.mjs`; never fetch data at application startup
- [ ] T027 [US2] Commit pinned `manifest.json`, `provinces.json`, and `commune-units.json` under `backend/src/main/resources/administrative-data/vn-administrative-units-2025-07-01/`
- [ ] T028 [P] [US2] Commit `manifest.json` and the exact 16 entries under `backend/src/main/resources/production-data/categories-v1/`
- [ ] T029 [US2] Implement artifact parsing and all official administrative validation gates in `backend/src/main/java/com/batdongsan/service/AdministrativeDatasetValidator.java`
- [ ] T030 [P] [US2] Implement category artifact validation in `backend/src/main/java/com/batdongsan/service/ProductionCategoryCatalogValidator.java`
- [ ] T031 [US2] Implement transactional staged validation, immutable release rows, activation locking, singleton pointer switching, idempotency, conflict, and safe diagnostics in `AdministrativeDatasetService.java`
- [ ] T032 [US2] Implement category release membership, validate/activate/idempotency/conflict behavior, and active-category lookup in `ProductionCategoryCatalogService.java`
- [ ] T033 [US2] Add paginated ADMIN release/catalog inspection and validate/activate endpoints in `backend/src/main/java/com/batdongsan/controller/AdminLocationController.java`
- [ ] T034 [US2] Secure every reference-data mutation as ADMIN-only and retain public read-only active catalog access in `backend/src/main/java/com/batdongsan/config/SecurityConfig.java`
- [ ] T035 [US2] Implement active-release-only paginated public province/commune lookup in `LocationService.java` and `LocationController.java`; remove district routes and manual official-unit CRUD

### Admin Frontend

- [ ] T036 [P] [US2] Add release/category/catalog API types, calls, and query invalidation in `frontend/src/features/admin/adminApi.ts` and `adminQueries.ts`
- [ ] T037 [US2] Replace three-level CRUD with administrative/category release status, provenance, validation, activation confirmation, and read-only catalog tables in `frontend/src/pages/admin/LocationManagementPage.tsx`
- [ ] T038 [P] [US2] Add ADMIN release UI tests for validation, activation, exact counts, idempotency, failed diagnostics, disabled actions, concurrency reload, and accessibility in `frontend/tests/integration/adminWorkspace.test.tsx` and `frontend/src/features/admin/adminApi.test.ts`
- [ ] T039 [US2] Update MSW/admin Playwright fixtures for 34/3,321/16 activation and assert no direct official-unit CRUD in `frontend/tests/mocks/handlers.ts` and `frontend/e2e/admin.spec.ts`

**Checkpoint**: Production reference data is verified, explicitly activated, auditable, and contains no demo business records.

---

## Phase 5: User Story 3 — Current Listing and Project Entry (Priority: P2)

**Goal**: Seller listings and ADMIN projects require active province/commune pairs and never carry a district.

**Independent Test**: Create/edit a listing and project with a valid pair, then reject cross-province and unavailable-catalog requests before persistence/provider use.

### Backend Tests

- [ ] T040 [P] [US3] Replace listing service/E2E tests with required active province/commune, mismatch, no-catalog, ownership, optimistic-lock, and no-district cases in `ListingServiceTest.java` and `SellerListingFlowIntegrationTest.java`
- [ ] T041 [P] [US3] Replace project tests with active pair, mismatch, no-catalog, create/update/filter, and response cases in `ProjectServiceTest.java` and `AdminMasterDataIntegrationTest.java`
- [ ] T042 [P] [US3] Update AI trusted-location tests to require province/commune, resolve server names, and reject invalid pairs before quota/provider use in `AiDescriptionPromptFactoryTest.java` and `AiDescriptionControllerIntegrationTest.java`

### Backend Implementation

- [ ] T043 [US3] Replace listing request/response location fields and Bean Validation with `provinceCode`/`communeCode` in `backend/src/main/java/com/batdongsan/dto/ListingReq.java` and `ListingRes.java`
- [ ] T044 [US3] Replace district repositories/relations with active province/commune resolution and parent validation in `backend/src/main/java/com/batdongsan/service/ListingService.java`
- [ ] T045 [US3] Replace project request/response location fields and service validation in `backend/src/main/java/com/batdongsan/dto/project/` and `ProjectService.java`
- [ ] T046 [US3] Replace AI location DTO/prompt context with trusted province/commune resolution in `dto/ai/AiDescriptionGenerateReq.java`, `service/ai/AiDescriptionService.java`, and `AiDescriptionPromptFactory.java`
- [ ] T047 [US3] Update listing/project/saved repository entity graphs for clean province/commune associations in `ListingRepository.java`, `ProjectRepository.java`, and `SavedListingRepository.java`

### Frontend Tests and Implementation

- [ ] T048 [P] [US3] Add active-catalog page aggregation, stale-request, reset, loading/error/empty, keyboard, and linked-error tests in `frontend/src/features/locations/locationQueries.test.ts` and `components/location/TwoLevelLocationFields.test.tsx`
- [ ] T049 [P] [US3] Replace seller form/schema/AI tests with province/commune payload and no district fields in `listingFormSchema.test.ts`, `ListingForm.test.tsx`, and `AiDescriptionAssistant.test.tsx`
- [ ] T050 [P] [US3] Replace admin project form/API tests with the shared two-level selector in `adminApi.test.ts` and `frontend/tests/integration/adminWorkspace.test.tsx`
- [ ] T051 [US3] Replace frontend domain location types and implement all-page active catalog queries in `frontend/src/types/domain.ts` and `frontend/src/features/locations/`
- [ ] T052 [US3] Implement accessible `frontend/src/components/location/TwoLevelLocationFields.tsx` with synchronous child/project reset and complete selected-province results
- [ ] T053 [US3] Replace seller listing schema/form/edit/AI payload location logic under `frontend/src/features/seller/` and `frontend/src/pages/EditListingPage.tsx`
- [ ] T054 [US3] Integrate the shared selector and two-level payload into admin project management under `frontend/src/pages/admin/` and `frontend/src/features/admin/`
- [ ] T055 [US3] Update seller/admin MSW and Playwright journeys to prove valid/mismatched/no-catalog behavior and no district payload/control in `frontend/tests/mocks/handlers.ts`, `seller-publication.spec.ts`, and `admin.spec.ts`

**Checkpoint**: All new listing/project writes use one active two-level model and AI receives only trusted current location names.

---

## Phase 6: User Story 4 — Two-Level Public Discovery (Priority: P3)

**Goal**: Search, recommendations, URLs, and all displays use province/commune only.

**Independent Test**: Publish controlled records in multiple locations, filter by province/commune, and inspect every response/card/detail surface for correct matches and zero district fields.

### Tests

- [ ] T056 [P] [US4] Replace listing search/repository tests with province/commune code, parent-required, mismatch, index, and active-release cases in `ListingSearchIntegrationTest.java`, `ListingRepositoryContractTest.java`, and `PublicListingSearchIntegrationTest.java`
- [ ] T057 [P] [US4] Replace recommendation tests with same-commune/same-province scoring and clean entity graphs in `RecommendationServiceTest.java`
- [ ] T058 [P] [US4] Replace listing/project URL-state, formatter, card, detail, and integration tests under `frontend/src/features/listings/`, `frontend/src/features/projects/`, `frontend/src/lib/formatters/`, and `frontend/tests/integration/`

### Implementation

- [ ] T059 [US4] Replace listing/project filter DTOs, specifications, query joins, and indexes with `provinceCode`/`communeCode` in `backend/src/main/java/com/batdongsan/dto/` and `repository/specification/`
- [ ] T060 [US4] Replace district-based candidate retrieval/scoring with commune/province signals in `ListingRepository.java` and `RecommendationService.java`
- [ ] T061 [US4] Replace frontend listing/project search state, URL parameters, dependent filters, and project API types under `frontend/src/features/listings/`, `frontend/src/features/projects/`, and public list pages
- [ ] T062 [US4] Replace shared address formatter and every listing/project display call site with address + commune + province in `frontend/src/lib/formatters/index.ts`, listing/project components, saved/seller/admin pages, and project details
- [ ] T063 [US4] Update public MSW and Playwright discovery/project/accessibility/responsive journeys in `frontend/tests/mocks/handlers.ts`, `public-discovery.spec.ts`, `projects.spec.ts`, `accessibility.spec.ts`, and `responsive.spec.ts`

**Checkpoint**: Public discovery and display expose exactly two structured levels and preserve unrelated filters/sorts.

---

## Phase 7: Cross-Cutting Verification and Deployment

- [ ] T064 Update `backend/src/test/java/com/batdongsan/controller/OpenApiContractIntegrationTest.java` to require new public/ADMIN paths and assert district paths are absent
- [ ] T065 [P] Update security integration tests for public active-catalog reads and ADMIN-only validate/activate operations in `backend/src/test/java/com/batdongsan/security/SecurityIntegrationTest.java`
- [ ] T066 [P] Add query-plan/performance evidence for active province/commune selectors and listing/project filters in `.specify/specs/007-two-level-addresses/evidence/performance.md`
- [ ] T067 Run all backend tests including non-skipped MySQL Testcontainers migration/bootstrap cases and record exact results in `.specify/specs/007-two-level-addresses/evidence/backend-validation.md`
- [ ] T068 Run frontend format/lint/unit/build/Playwright suites at 320/360/768/1024/1440px and record exact results in `.specify/specs/007-two-level-addresses/evidence/frontend-validation.md`
- [ ] T069 Rebuild Docker Compose, verify MySQL/backend/frontend health and the intentional `127.0.0.1` frontend healthcheck, and record results in `.specify/specs/007-two-level-addresses/evidence/docker-validation.md`
- [ ] T070 Execute [quickstart.md](./quickstart.md): backup, zero-count gate, V10 cutover, ADMIN 34/3,321 and 16-category activation, no-demo proof, API/UI journeys, and recovery evidence in `.specify/specs/007-two-level-addresses/evidence/deployment.md`

---

## Dependencies and Execution Order

```text
Setup → Foundation → US1 Cutover → US2 Reference Data → US3 Entry → US4 Discovery → Verification
```

- V10 and its failure/success tests block every application implementation task.
- Official/category validators can be developed in parallel after foundational DTO/enums but activation integration requires V10 tables.
- US3 requires an active controlled catalog fixture and active category fixture.
- US4 reuses US3 DTOs/entities and follows it.
- Production deployment is blocked until Testcontainers executes rather than skips both V10 failure paths and the success path.

## Parallel Opportunities

- T003/T004 can run beside T002.
- T005–T010 touch mostly independent types/fixtures/tests.
- T021–T025 validator/service/controller/E2E tests can be authored in parallel.
- T027 and T028 are independent artifacts.
- T029/T030 and T036/T038 are parallel backend/frontend tracks.
- US3 backend tests T040–T042 and frontend tests T048–T050 are independent.
- US4 backend tests T056–T057 and frontend T058 are independent.
- T064–T066 are independent final contract/security/performance checks.

## Implementation Rules

- Confirm a test fails for the intended changed behavior before implementation.
- Change schema/entities before repositories/services/controllers and API/types before UI integration.
- Do not add compatibility aliases for district or legacy ward fields.
- Do not seed demo users, projects, listings, prices, payments, views, or analytics.
- Do not edit `README.md` as part of this planning/implementation set; deployment guidance lives in this feature's quickstart/evidence.
- Do not edit V1–V9.
- Mark `[ ]` as `[X]` only after the task's validation passes.
