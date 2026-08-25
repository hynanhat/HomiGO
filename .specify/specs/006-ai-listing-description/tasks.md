# Tasks: AI Listing Description

**Input**: Design documents from `.specify/specs/006-ai-listing-description/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included because the specification defines explicit concurrency, security, output-validation and failure-safety success criteria.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it targets different files and has no incomplete dependency.
- **[Story]**: Maps the task to User Story 1, 2 or 3.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add safe configuration and migration foundations without enabling the feature by default.

- [X] T001 Add server-only Gemini feature/model/timeout/retry settings with disabled defaults in backend/src/main/resources/application.yml, backend/src/main/resources/application-prod.yml, backend/src/test/resources/application-test.yml, and .env.example
- [X] T002 [P] Add typed Gemini configuration and RestClient/Clock beans in backend/src/main/java/com/batdongsan/config/GeminiProperties.java, backend/src/main/java/com/batdongsan/config/GeminiClientConfig.java, and backend/src/main/java/com/batdongsan/config/TimeConfig.java
- [X] T003 [P] Add Flyway quota schema, constraints, and indexes in backend/src/main/resources/db/migration/V9__ai_description_quota.sql

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Provide shared quota persistence, DTOs, errors and AI abstractions required by all stories.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [X] T004 [P] Create quota entities and reservation status enum in backend/src/main/java/com/batdongsan/entity/AiDailyUsage.java, backend/src/main/java/com/batdongsan/entity/AiDescriptionReservation.java, and backend/src/main/java/com/batdongsan/entity/AiDescriptionReservationStatus.java
- [X] T005 [P] Create pessimistic-lock and expiry repositories in backend/src/main/java/com/batdongsan/repository/AiDailyUsageRepository.java and backend/src/main/java/com/batdongsan/repository/AiDescriptionReservationRepository.java
- [X] T006 [P] Create validated request/response DTOs in backend/src/main/java/com/batdongsan/dto/ai/AiDescriptionGenerateReq.java, backend/src/main/java/com/batdongsan/dto/ai/AiDescriptionDraftRes.java, and backend/src/main/java/com/batdongsan/dto/ai/AiDescriptionQuotaRes.java
- [X] T007 Add AI error codes and centralized safe exception handling in backend/src/main/java/com/batdongsan/exception/ErrorCode.java, backend/src/main/java/com/batdongsan/exception/ApiException.java, and backend/src/main/java/com/batdongsan/exception/GlobalExceptionHandler.java
- [X] T008 [P] Define provider-neutral AI contracts and exceptions in backend/src/main/java/com/batdongsan/service/ai/AiDescriptionClient.java, backend/src/main/java/com/batdongsan/service/ai/AiDescriptionClientRequest.java, backend/src/main/java/com/batdongsan/service/ai/AiDescriptionClientException.java, and backend/src/main/java/com/batdongsan/service/ai/AiDescriptionFailureType.java
- [X] T009 Implement transactional reserve/finalize/release/expiry state machine in backend/src/main/java/com/batdongsan/service/ai/AiQuotaService.java
- [X] T010 [P] Add lazy/scheduled expired-reservation cleanup in backend/src/main/java/com/batdongsan/service/ai/AiQuotaCleanupJob.java

**Checkpoint**: Quota slots can be safely reserved and recovered without any Gemini call or long database transaction.

---

## Phase 3: User Story 1 — Generate an accurate listing draft (Priority: P1) 🎯 MVP

**Goal**: SELLER submits keywords and allowed form values, receives a validated Vietnamese 600–900-character draft, and can apply it to the listing form.

**Independent Test**: With valid category, district, price, area and keywords, a SELLER receives a 2–3 paragraph preview based only on supplied/resolved facts; USER/ADMIN and invalid input cannot invoke Gemini.

### Tests for User Story 1

- [X] T011 [P] [US1] Write prompt and output-validator unit tests, including injection/HTML/contact/length cases, in backend/src/test/java/com/batdongsan/service/ai/AiDescriptionPromptFactoryTest.java and backend/src/test/java/com/batdongsan/service/ai/AiDescriptionOutputValidatorTest.java
- [X] T012 [P] [US1] Write Gemini Interaction parsing/error/retry tests with a local mock HTTP server in backend/src/test/java/com/batdongsan/service/ai/GeminiInteractionsClientTest.java
- [X] T013 [P] [US1] Write seller API authorization, validation and success contract tests in backend/src/test/java/com/batdongsan/controller/AiDescriptionControllerIntegrationTest.java

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement allowlisted trusted listing-context resolution and prompt construction in backend/src/main/java/com/batdongsan/service/ai/AiDescriptionPromptFactory.java
- [X] T015 [P] [US1] Implement structured response normalization and 600–900 character/2–3 paragraph safety validation in backend/src/main/java/com/batdongsan/service/ai/AiDescriptionOutputValidator.java
- [X] T016 [US1] Implement stateless Gemini Interactions v1 client with x-goog-api-key, store=false, structured JSON, bounded timeout/retry and redacted errors in backend/src/main/java/com/batdongsan/service/ai/GeminiInteractionsClient.java
- [X] T017 [US1] Implement generation orchestration outside transactions with reserve/release/finalize semantics in backend/src/main/java/com/batdongsan/service/ai/AiDescriptionService.java
- [X] T018 [US1] Add SELLER quota and draft endpoints in backend/src/main/java/com/batdongsan/controller/AiDescriptionController.java
- [X] T019 [P] [US1] Add frontend AI description API types/client/hooks in frontend/src/features/seller/aiDescriptionTypes.ts, frontend/src/features/seller/aiDescriptionApi.ts, and frontend/src/features/seller/aiDescriptionQueries.ts
- [X] T020 [US1] Build the accessible keywords/generate/preview/apply assistant in frontend/src/features/seller/components/AiDescriptionAssistant.tsx
- [X] T021 [US1] Integrate the assistant with current form values and description updates in frontend/src/features/seller/components/ListingForm.tsx
- [X] T022 [US1] Add frontend generate/apply/authorization-safe error tests in frontend/src/features/seller/components/AiDescriptionAssistant.test.tsx

**Checkpoint**: User Story 1 is independently usable on both Create and Edit because they share ListingForm.

---

## Phase 4: User Story 2 — Preview, cancel and regenerate safely (Priority: P2)

**Goal**: Existing description remains unchanged until Apply; seller can cancel or regenerate using current form values.

**Independent Test**: Start with an existing description, generate and cancel, then regenerate and apply; only Apply changes the description and every successful regenerate consumes exactly one attempt.

### Tests for User Story 2

- [X] T023 [P] [US2] Extend component tests for existing-description preservation, cancel, dirty-form preview warning, regenerate confirmation and duplicate-click prevention in frontend/src/features/seller/components/AiDescriptionAssistant.test.tsx

### Implementation for User Story 2

- [X] T024 [US2] Add cancel/regenerate/current-form snapshot behavior and dirty-preview messaging in frontend/src/features/seller/components/AiDescriptionAssistant.tsx and frontend/src/features/seller/components/ListingForm.tsx

**Checkpoint**: AI remains an explicit suggestion workflow and never silently overwrites seller content.

---

## Phase 5: User Story 3 — Enforce and display the daily limit (Priority: P3)

**Goal**: Persistently enforce five successful generations per SELLER/Vietnam day and display remaining/reset information.

**Independent Test**: Fire 10 concurrent requests for one SELLER and observe exactly 5 successes, then verify the sixth completed-use request is rejected until Vietnam midnight while a different SELLER remains independent.

### Tests for User Story 3

- [X] T025 [P] [US3] Add quota lifecycle/idempotency and 10-request concurrency tests in backend/src/test/java/com/batdongsan/service/ai/AiQuotaServiceTest.java
- [X] T026 [P] [US3] Add MySQL Testcontainers coverage for 10-request concurrency, mixed provider failures, crash expiry and cross-seller isolation in backend/src/test/java/com/batdongsan/integration/AiDescriptionQuotaConcurrencyTest.java
- [X] T027 [P] [US3] Add frontend exhausted/temporary-reservation/reset-time/manual-fallback tests in frontend/src/features/seller/components/AiDescriptionAssistant.test.tsx

### Implementation for User Story 3

- [X] T028 [US3] Complete quota status responses, temporary-capacity retryAt and Vietnam reset semantics in backend/src/main/java/com/batdongsan/service/ai/AiQuotaService.java and backend/src/main/java/com/batdongsan/controller/AiDescriptionController.java
- [X] T029 [US3] Display x/5 remaining, reset time, exhausted and temporary-capacity states without disabling manual description in frontend/src/features/seller/components/AiDescriptionAssistant.tsx

**Checkpoint**: All three user stories are functional, persistent across restart and concurrency-safe.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify security, configuration, migration and end-to-end behavior across the complete feature.

- [X] T030 [P] Add Create/Edit end-to-end AI preview coverage with mocked HomiGO endpoints in frontend/e2e/ai-listing-description.spec.ts
- [X] T031 [P] Update setup and operational documentation without secrets in README.md and .specify/specs/006-ai-listing-description/quickstart.md
- [X] T032 Run backend Maven tests including MySQL integration/Flyway validation and fix regressions reported from backend/pom.xml
- [X] T033 Run frontend test, build, lint and Playwright suites and fix regressions reported from frontend/package.json
- [X] T034 Perform secret/log/API contract checks and mark every completed task in .specify/specs/006-ai-listing-description/tasks.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) starts immediately.
- Foundational (Phase 2) depends on Setup and blocks all stories.
- US1 depends on Foundational and delivers the MVP.
- US2 depends on the US1 preview component.
- US3 depends on Foundational quota infrastructure and the US1 endpoint/UI; its tests validate the complete limit behavior.
- Polish depends on US1–US3.

### Parallel Opportunities

- T002 and T003 can run together after T001 scope is known.
- T004–T006 and T008 target separate foundational files; T009 follows entity/repository work.
- US1 tests T011–T013 can be written in parallel; T014 and T015 can be implemented in parallel.
- Frontend API work T019 can proceed while backend provider/orchestration T016–T018 is implemented.
- US3 backend tests T025–T026 and frontend tests T027 are independent.
- E2E documentation T030–T031 can proceed in parallel before final suite runs.

## Parallel Example: User Story 1

```text
Task T011: prompt/output tests
Task T012: Gemini HTTP client tests
Task T013: seller API contract tests

Task T014: trusted prompt builder
Task T015: output validator
Task T019: frontend API layer
```

## Implementation Strategy

### MVP first

1. Complete Setup and Foundational phases.
2. Complete US1 and verify generate → preview → apply on shared ListingForm.
3. Add US2 explicit control behavior.
4. Add US3 complete persistent concurrency guarantee and quota UX.
5. Finish cross-cutting validation before enabling Gemini in an environment.

### Safety rules during implementation

- Never place a real API key in repository files or test fixtures.
- Never hold a database transaction across a Gemini HTTP call.
- Never store/log prompts, keywords, generated drafts or raw provider errors.
- Do not modify unrelated existing work in the dirty worktree.
