# Tasks & Schedule: HomiGO Backend Core

**Input**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/api.md`, `quickstart.md`

**Working rhythm**: 12 weeks, 5 working days/week, 2–4 focused hours/day. Every Friday is validation, documentation and commit day. Do not start the next phase while its checkpoint is failing.

## Checklist format

- `[P]`: may be done in parallel with adjacent tasks because files do not overlap.
- `[USn]`: maps to user story in `spec.md`.
- Each task has a concrete output path and must finish with relevant tests passing.

## Phase 1 — Week 1: Establish a truthful baseline

**Goal**: Know exactly what already works and make the project reproducible.

### Monday

- [x] T001 Run `mvnw.cmd test`, record the baseline and known warnings in `.specify/specs/001-core-features/evidence/baseline.md`
- [x] T002 Compare implemented endpoints with `.specify/specs/001-core-features/contracts/api.md` and record gaps in `.specify/specs/001-core-features/evidence/api-gap.md`

### Tuesday

- [x] T003 Add Flyway dependency and disable Hibernate schema mutation in `backend/pom.xml` and `backend/src/main/resources/application-dev.yml`
- [x] T004 Create baseline schema migration for current entities in `backend/src/main/resources/db/migration/V1__baseline_schema.sql`

### Wednesday

- [x] T005 Add follow-up constraints and indexes from `data-model.md` in `backend/src/main/resources/db/migration/V2__core_constraints_indexes.sql`
- [x] T006 Configure `application-test.yml` to use `create-drop` while dev/prod use `validate` in `backend/src/test/resources/application-test.yml` and `backend/src/main/resources/application.yml`

### Thursday

- [x] T007 [P] Add springdoc OpenAPI dependency and metadata in `backend/pom.xml` and `backend/src/main/java/com/batdongsan/config/OpenApiConfig.java`
- [x] T008 [P] Add `application-prod.yml` with environment-only secrets and production-safe JPA/logging settings in `backend/src/main/resources/application-prod.yml`

### Friday

- [x] T009 Verify migrations on an empty MySQL database and capture commands/results in `.specify/specs/001-core-features/evidence/week-01.md`

**Checkpoint**: `mvnw.cmd test` passes; an empty database can be created entirely by Flyway; OpenAPI loads.

---

## Phase 2 — Week 2: Foundational quality and security

**Purpose**: Blocking infrastructure required by every user story.

### Monday–Tuesday

- [x] T010 [P] Replace field injection with constructor injection in `backend/src/main/java/com/batdongsan/config/SecurityConfig.java` and `backend/src/main/java/com/batdongsan/security/JwtAuthFilter.java`
- [x] T011 [P] Replace field injection with constructor injection in all classes under `backend/src/main/java/com/batdongsan/service/`
- [x] T012 [P] Replace field injection with constructor injection in all classes under `backend/src/main/java/com/batdongsan/controller/`

### Wednesday

- [x] T013 Create standardized API error codes in `backend/src/main/java/com/batdongsan/exception/ErrorCode.java` and update `backend/src/main/java/com/batdongsan/exception/GlobalExceptionHandler.java`
- [x] T014 Add server-side exception logging without exposing internal messages in `backend/src/main/java/com/batdongsan/exception/GlobalExceptionHandler.java`

### Thursday

- [x] T015 Move page/range/filter validation into DTOs in `backend/src/main/java/com/batdongsan/dto/PageReq.java` and `backend/src/main/java/com/batdongsan/dto/ListingFilter.java`
- [x] T016 Normalize all user-facing validation/error messages to Vietnamese UTF-8 in `backend/src/main/java/com/batdongsan/dto/` and `backend/src/main/java/com/batdongsan/service/`

### Friday

- [x] T017 Add security integration tests for public/authenticated/admin routes in `backend/src/test/java/com/batdongsan/security/SecurityIntegrationTest.java`
- [x] T018 Run `mvnw.cmd verify` and document the Week 2 checkpoint in `.specify/specs/001-core-features/evidence/week-02.md`

**Checkpoint**: Error responses are consistent, secrets are external, access rules are tested, no mojibake remains.

---

## Phase 3 — Weeks 3–4: User Story 2 — Identity and profile (P1)

**Goal**: A user can register, manage a profile, become a seller, save listings and maintain a revocable session.

**Independent test**: Register → login → view/update profile → upgrade to SELLER → refresh token → logout; revoked token fails.

### Week 3 — Tests and data model

- [x] T019 [P] [US2] Write failing unit tests for register/login/password/banned-user behavior in `backend/src/test/java/com/batdongsan/service/AuthServiceTest.java`
- [x] T020 [P] [US2] Write failing API tests for profile and seller-upgrade endpoints in `backend/src/test/java/com/batdongsan/controller/UserControllerIntegrationTest.java`
- [x] T021 [US2] Add RefreshToken entity and repository in `backend/src/main/java/com/batdongsan/entity/RefreshToken.java` and `backend/src/main/java/com/batdongsan/repository/RefreshTokenRepository.java`
- [x] T022 [US2] Add refresh-token migration in `backend/src/main/resources/db/migration/V3__refresh_tokens.sql`
- [x] T023 [P] [US2] Create profile/auth refresh request-response DTOs in `backend/src/main/java/com/batdongsan/dto/`

### Week 4 — Services and endpoints

- [x] T024 [US2] Implement refresh rotation, logout and session revocation in `backend/src/main/java/com/batdongsan/service/AuthService.java`
- [x] T025 [US2] Implement profile read/update and USER-to-SELLER upgrade in `backend/src/main/java/com/batdongsan/service/UserService.java`
- [x] T026 [US2] Expose refresh/logout endpoints in `backend/src/main/java/com/batdongsan/controller/AuthController.java`
- [x] T027 [US2] Expose `/api/v1/users/me` endpoints in `backend/src/main/java/com/batdongsan/controller/UserController.java`
- [x] T028 [US2] Update authorization rules and OpenAPI descriptions in `backend/src/main/java/com/batdongsan/config/SecurityConfig.java`
- [x] T029 [US2] Run the independent US2 flow and record evidence in `.specify/specs/001-core-features/evidence/us2.md`

**Checkpoint**: AuthService unit suite passes; USER cannot post until upgraded; logout/revocation is demonstrable.

---

## Phase 4 — Weeks 5–6: User Story 3 — Complete listing lifecycle (P1)

**Goal**: A seller can create and manage an owned listing through its complete lifecycle with up to 10 safe images.

**Independent test**: SELLER creates DRAFT → uploads images → submits PENDING → tracks status; another seller receives 403.

### Week 5 — Tests, schema and DTOs

- [x] T030 [P] [US3] Write failing unit tests for ownership and state transitions in `backend/src/test/java/com/batdongsan/service/ListingServiceTest.java`
- [x] T031 [P] [US3] Write failing upload tests for MIME, size, traversal and 10-image limit in `backend/src/test/java/com/batdongsan/service/FileStorageServiceTest.java`
- [x] T032 [US3] Extend Listing, ListingImage and status history schema in `backend/src/main/resources/db/migration/V4__listing_lifecycle.sql`
- [x] T033 [P] [US3] Add Ward and ListingStatusHistory entities/repositories in `backend/src/main/java/com/batdongsan/entity/` and `backend/src/main/java/com/batdongsan/repository/`
- [x] T034 [P] [US3] Replace Listing request/response DTOs with lifecycle fields and Bean Validation in `backend/src/main/java/com/batdongsan/dto/ListingReq.java` and `backend/src/main/java/com/batdongsan/dto/ListingRes.java`

### Week 6 — Workflow and endpoints

- [x] T035 [US3] Implement DRAFT/PENDING/INACTIVE transitions, version checks and status-history writes in `backend/src/main/java/com/batdongsan/service/ListingService.java`
- [x] T036 [US3] Implement owner-only paginated “my listings” query in `backend/src/main/java/com/batdongsan/repository/ListingRepository.java` and `backend/src/main/java/com/batdongsan/service/ListingService.java`
- [x] T037 [US3] Attach image upload/delete to a listing with owner and image-count checks in `backend/src/main/java/com/batdongsan/service/FileStorageService.java`
- [x] T038 [US3] Split seller management endpoints into `backend/src/main/java/com/batdongsan/controller/SellerListingController.java`
- [x] T039 [US3] Add scheduled expiration of ACTIVE listings in `backend/src/main/java/com/batdongsan/service/ListingExpirationService.java`
- [x] T040 [US3] Run the independent US3 flow and record evidence in `.specify/specs/001-core-features/evidence/us3.md`

**Checkpoint**: ListingService and upload tests pass; no non-owner mutation succeeds; every status change is auditable.

---

## Phase 5 — Week 7: User Story 4 — Admin moderation (P1)

**Goal**: Admin can review, approve/reject listings and ban users with correct side effects.

**Independent test**: Admin approves PENDING listing; it becomes public for 30 days. Rejection requires a reason. Banning hides active listings and invalidates sessions.

- [x] T041 [P] [US4] Write failing moderation and ban unit tests in `backend/src/test/java/com/batdongsan/service/AdminServiceTest.java`
- [x] T042 [P] [US4] Create admin moderation DTOs in `backend/src/main/java/com/batdongsan/dto/admin/`
- [x] T043 [US4] Implement paginated moderation queue, approval timestamps and required rejection reason in `backend/src/main/java/com/batdongsan/service/AdminService.java`
- [x] T044 [US4] Revoke refresh tokens and deactivate active listings when banning a user in `backend/src/main/java/com/batdongsan/service/AdminService.java`
- [x] T045 [US4] Normalize admin endpoints to the contract in `backend/src/main/java/com/batdongsan/controller/AdminController.java`
- [x] T046 [US4] Run moderation end-to-end and record evidence in `.specify/specs/001-core-features/evidence/us4.md`

**Checkpoint**: Only ADMIN can moderate; PENDING/REJECTED listings never appear publicly; ban side effects are transactional.

---

## Phase 6 — Weeks 8–9: User Story 1 — Search and browse (P1 MVP)

**Goal**: Guests can accurately search, sort and view only active listings, including map bounds.

**Independent test**: With 30 seeded listings, every combination of location/price/area/type/sort/bounding-box returns only matching ACTIVE records.

### Week 8 — Query design and tests

- [x] T047 [P] [US1] Create deterministic listing/location seed fixture in `backend/src/test/resources/db/listing-search-fixture.sql`
- [x] T048 [P] [US1] Write failing repository integration tests for all filters and sorts in `backend/src/test/java/com/batdongsan/repository/ListingSearchIntegrationTest.java`
- [x] T049 [US1] Add keyword, ward, property attributes, coordinates and sort whitelist to `backend/src/main/java/com/batdongsan/dto/ListingFilter.java`
- [x] T050 [US1] Implement reusable JPA specifications in `backend/src/main/java/com/batdongsan/repository/specification/ListingSpecifications.java`

### Week 9 — Public API and performance

- [x] T051 [US1] Refactor public search/detail mapping to avoid lazy serialization and N+1 queries in `backend/src/main/java/com/batdongsan/service/ListingService.java`
- [x] T052 [US1] Implement public-code detail and map bounding-box API in `backend/src/main/java/com/batdongsan/controller/ListingController.java`
- [x] T053 [US1] Add cross-field validation for min/max price, area and coordinates in `backend/src/main/java/com/batdongsan/dto/ListingFilter.java`
- [x] T054 [US1] Benchmark search with 10,000 generated listings and record query plans/results in `.specify/specs/001-core-features/evidence/search-performance.md`
- [x] T055 [US1] Run the independent US1 flow and record evidence in `.specify/specs/001-core-features/evidence/us1.md`

**Checkpoint**: Search accuracy tests pass 100%; response target under 500 ms in the documented test environment.

---

## Phase 7 — Week 10: User Story 5 — Project browsing (P2)

**Goal**: Guests browse/filter projects and see their active listings without exposing JPA entities.

**Independent test**: Filter projects by district/status and open a project detail containing only active associated listings.

- [x] T056 [P] [US5] Write project service/API tests in `backend/src/test/java/com/batdongsan/service/ProjectServiceTest.java`
- [x] T057 [P] [US5] Create Project request/response DTOs in `backend/src/main/java/com/batdongsan/dto/project/`
- [x] T058 [US5] Extend project schema and indexes in `backend/src/main/resources/db/migration/V5__project_details.sql`
- [x] T059 [US5] Implement paginated project filters and detail mapping in `backend/src/main/java/com/batdongsan/service/ProjectService.java`
- [x] T060 [US5] Refactor project endpoints to return DTOs in `backend/src/main/java/com/batdongsan/controller/ProjectController.java`
- [x] T061 [US5] Record project validation evidence in `.specify/specs/001-core-features/evidence/us5.md`

**Checkpoint**: Project endpoints are paginated, filterable and entity-safe.

---

## Phase 8 — Week 11: Favorites, master data and API completion

**Purpose**: Finish cross-story contract gaps before release hardening.

- [x] T062 [P] [US2] Move favorites to paginated `/saved-listings` endpoints in `backend/src/main/java/com/batdongsan/controller/SavedListingController.java`
- [x] T063 [P] [US2] Add favorite integration tests including duplicate and unauthenticated cases in `backend/src/test/java/com/batdongsan/controller/SavedListingIntegrationTest.java`
- [x] T064 [P] Add public location query endpoints and DTOs in `backend/src/main/java/com/batdongsan/controller/LocationController.java` and `backend/src/main/java/com/batdongsan/dto/location/`
- [x] T065 Add validated admin CRUD for categories/projects/locations in `backend/src/main/java/com/batdongsan/controller/AdminController.java`
- [x] T066 Export and compare OpenAPI contract with `.specify/specs/001-core-features/contracts/api.md`, recording deviations in `.specify/specs/001-core-features/evidence/openapi-review.md`

**Checkpoint**: Every endpoint in the contract exists or has a documented reason for deferral.

---

## Phase 9 — Week 12: Release, demonstration and thesis evidence

**Purpose**: Produce a backend that can be demonstrated, graded and reproduced.

- [ ] T067 [P] Add MySQL Testcontainers dependency and shared integration-test base in `backend/src/test/java/com/batdongsan/support/MySqlContainerTest.java`
- [ ] T068 Convert critical publication-flow integration test to MySQL Testcontainers in `backend/src/test/java/com/batdongsan/e2e/PublicationFlowTest.java`
- [ ] T069 [P] Add CI workflow running `mvnw verify` in `.github/workflows/backend-ci.yml`
- [ ] T070 [P] Create deterministic development seed data in `backend/src/main/resources/db/migration/R__development_seed.sql` or a dev-only seeder documented in `README.md`
- [ ] T071 Validate Docker build, health checks, volumes and environment variables in `Dockerfile` and `docker-compose.yml`
- [ ] T072 Execute all scenarios in `.specify/specs/001-core-features/quickstart.md` and save results in `.specify/specs/001-core-features/evidence/final-validation.md`
- [ ] T073 Create FR/SC-to-test traceability matrix in `.specify/specs/001-core-features/evidence/traceability.md`
- [ ] T074 Update setup, API, demo accounts and deployment instructions in `README.md`
- [ ] T075 Tag unresolved post-core work for React frontend and price analytics in `.specify/specs/001-core-features/evidence/post-core-roadmap.md`

**Final checkpoint**: `mvnw.cmd verify` passes; clean Docker deployment works; core end-to-end flow is recorded and reproducible.

---

## Dependencies and execution order

```text
Week 1 baseline/migrations
  -> Week 2 foundations
    -> US2 identity (Weeks 3–4)
      -> US3 seller lifecycle (Weeks 5–6)
        -> US4 moderation (Week 7)
          -> US1 public discovery (Weeks 8–9)
            -> US5 projects (Week 10)
              -> contract completion (Week 11)
                -> release evidence (Week 12)
```

Although US1 is Priority P1 in the specification, implement it after listing publication because meaningful public search requires valid ACTIVE listings. This is an implementation dependency, not a priority downgrade.

## Parallel opportunities

- T007/T008, T010/T011/T012, and test/DTO pairs marked `[P]` can be performed independently.
- For a solo student, use `[P]` to alternate when blocked; do not work on more than two tasks simultaneously.
- Migration tasks remain sequential: V1 → V2 → V3 → V4 → V5.

## “What do I do today?” rule

1. Open this file.
2. Find the first unchecked task whose earlier tasks are checked.
3. Work only on that task until its test/output exists.
4. Run relevant tests.
5. Mark it `[x]`, record important evidence, and commit.
6. Stop after at most two substantial tasks per day.

## Suggested MVP boundary

The backend MVP is complete at the end of Week 9: identity, seller listing lifecycle, admin moderation and public search all work end-to-end. Weeks 10–12 improve project browsing, contract completeness and graduation-quality evidence.
