# Tasks: HomiGO Modern Business Frontend

**Input**: Design documents from `.specify/specs/002-modern-business-frontend/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Tests are required by FR-018. Within each story, write the listed tests first, confirm they fail for the intended reason, then implement.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated as a usable vertical slice.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it uses different files and does not depend on an incomplete task.
- **[Story]**: Maps to the numbered user story in `spec.md`.
- Every task contains an exact output path.

## Phase 1: Setup and Truthful Baseline

**Purpose**: Make the existing prototype reproducible before changing architecture or visuals.

- [x] T001 Run `npm ci`, `npm run lint`, and `npm run build` in `frontend/` and record failures, warnings, stale routes, and stale endpoints in `.specify/specs/002-modern-business-frontend/evidence/frontend-baseline.md`
- [x] T002 Add runtime dependencies for query/form/schema handling and development dependencies for Vitest, Testing Library, MSW, Playwright, and axe in `frontend/package.json` and `frontend/package-lock.json`
- [x] T003 Configure unit-test scripts, DOM environment, coverage include/exclude rules, and test setup in `frontend/vite.config.ts`, `frontend/package.json`, and `frontend/tests/setup.ts`
- [x] T004 [P] Configure browser projects for 360 px, 768 px, and 1440 px plus local webServer behavior in `frontend/playwright.config.ts`
- [x] T005 [P] Add public-only frontend environment documentation in `frontend/.env.example` and Vite environment typing in `frontend/src/vite-env.d.ts`
- [x] T006 Remove Vite starter assets/styles and replace the CSS entry with valid Tailwind 4 imports in `frontend/src/index.css`, `frontend/src/App.css`, `frontend/src/assets/react.svg`, and `frontend/src/assets/vite.svg`
- [x] T007 Configure `@/` source aliases consistently in `frontend/tsconfig.app.json` and `frontend/vite.config.ts`

**Checkpoint**: Dependencies install deterministically; the original prototype baseline is documented; test and build commands are available.

---

## Phase 2: Foundational Architecture and Design System

**Purpose**: Blocking infrastructure required before any user story UI is implemented.

**âš ï¸ CRITICAL**: No user story phase starts until this checkpoint passes.

- [x] T008 [P] Define shared `ApiResponse`, `PageResponse`, role, status, pagination, and field-error types in `frontend/src/types/api.ts` and `frontend/src/types/domain.ts`
- [x] T009 [P] Implement Vietnamese currency, area, date, address, and project-status formatters with unit tests in `frontend/src/lib/formatters/index.ts` and `frontend/src/lib/formatters/index.test.ts`
- [x] T010 [P] Implement normalized `ApiError` creation and safe Vietnamese fallback messages with tests in `frontend/src/lib/api/apiError.ts` and `frontend/src/lib/api/apiError.test.ts`
- [x] T011 [P] Implement session persistence helpers that never persist application secrets in `frontend/src/lib/auth/sessionStorage.ts` and `frontend/src/lib/auth/sessionStorage.test.ts`
- [x] T012 Implement the environment-based Axios client, response unwrapping, Authorization header, single-flight refresh queue, and terminal logout behavior in `frontend/src/lib/api/client.ts`
- [x] T013 [P] Configure TanStack Query defaults and combined application providers in `frontend/src/app/queryClient.ts` and `frontend/src/app/providers.tsx`
- [x] T014 Implement typed session/user/role state and restore/login/logout/refresh actions using React Context in `frontend/src/context/AuthContext.tsx`
- [x] T015 [P] Create anonymous, authenticated, seller, and admin route guards with intended-destination preservation in `frontend/src/app/guards.tsx`
- [x] T016 Implement the route tree and lazy page boundaries from the UI route contract in `frontend/src/app/router.tsx` and replace routing in `frontend/src/App.tsx`
- [x] T017 [P] Define HomiGO color, typography, spacing, radius, shadow, breakpoint, focus, and listing-status tokens in `frontend/src/styles/tokens.css` and `frontend/src/styles/globals.css`
- [x] T018 [P] Add failing integration tests for paginated public category access in `backend/src/test/java/com/batdongsan/controller/CategoryControllerIntegrationTest.java`
- [x] T019 Add read-only paginated `GET /api/v1/categories` through DTO/service/controller/security layers and update the API contract in `backend/src/main/java/com/batdongsan/controller/CategoryController.java`, `backend/src/main/java/com/batdongsan/service/CategoryService.java`, `backend/src/main/java/com/batdongsan/config/SecurityConfig.java`, and `.specify/specs/001-core-features/contracts/api.md`
- [x] T020 Add typed public category queries in `frontend/src/features/categories/categoryApi.ts` and `frontend/src/features/categories/categoryQueries.ts`
- [x] T021 [P] Create deterministic MSW server, envelope/page builders, and auth/listing/project/location/admin fixtures in `frontend/tests/mocks/server.ts`, `frontend/tests/mocks/handlers.ts`, and `frontend/tests/fixtures/apiFixtures.ts`
- [x] T022 [P] Write accessibility and interaction tests for buttons, form controls, modal, pagination, and status badge in `frontend/src/components/ui/uiPrimitives.test.tsx`
- [x] T023 Implement and export Button, Input, Select, Textarea, Badge, Card, Modal, Table, and Pagination primitives in `frontend/src/components/ui/index.tsx`
- [x] T024 [P] Implement and export ToastProvider, Skeleton, EmptyState, ErrorState, and ErrorBoundary plus NotFoundPage in `frontend/src/components/feedback/index.tsx` and `frontend/src/pages/NotFoundPage.tsx`
- [x] T025 Implement responsive PublicLayout, AccountLayout, SellerLayout, and AdminLayout with Vietnamese navigation in `frontend/src/components/layout/PublicLayout.tsx`, `frontend/src/components/layout/AccountLayout.tsx`, `frontend/src/components/layout/SellerLayout.tsx`, and `frontend/src/components/layout/AdminLayout.tsx`
- [x] T026 Run frontend lint/test/build plus backend category integration test and record the foundational checkpoint in `.specify/specs/002-modern-business-frontend/evidence/foundation.md`

**Checkpoint**: Typed API/auth boundary, design system, route guards, layouts, test infrastructure, and public category dependency are ready.

---

## Phase 3: User Story 1 â€” TÃ¬m vÃ  xem báº¥t Ä‘á»™ng sáº£n (Priority: P1) ðŸŽ¯ MVP

**Goal**: Guest completes home â†’ search â†’ filters/sort/page â†’ public-code detail with complete loading, empty, error, and unavailable states.

**Independent Test**: From the home page, search BUY/RENT, change at least three filters, paginate, then open one ACTIVE listing by `publicCode` and inspect gallery, facts, description, location, and contact.

### Tests for User Story 1

- [x] T027 [P] [US1] Write failing MSW contract tests for listing search parameters, `PageResponse`, public-code detail, 404, and network failure in `frontend/src/features/listings/listingApi.test.ts`
- [x] T028 [P] [US1] Write failing unit tests for URL parsing, invalid-range normalization, sort whitelist, and page reset behavior in `frontend/src/features/listings/listingSearchState.test.ts`
- [x] T029 [P] [US1] Write failing component/integration tests for Home search, ListingCard, filter drawer, results states, gallery, and detail contact card in `frontend/tests/integration/publicListings.test.tsx`
- [x] T030 [P] [US1] Write the failing guest browser journey for home â†’ search â†’ filter â†’ detail in `frontend/e2e/public-discovery.spec.ts`

### Implementation for User Story 1

- [x] T031 [US1] Implement typed listing search/detail functions and query keys in `frontend/src/features/listings/listingApi.ts` and `frontend/src/features/listings/listingQueries.ts`
- [x] T032 [US1] Implement URL-backed listing filter parsing, serialization, defaults, and page reset in `frontend/src/features/listings/listingSearchState.ts`
- [x] T033 [P] [US1] Replace the old card with a typed, responsive `publicCode` ListingCard, internal image fallback, lazy loading, formatting, and semantic metadata in `frontend/src/features/listings/components/ListingCard.tsx`
- [x] T034 [P] [US1] Build the modern business hero search, BUY/RENT shortcuts, recent listings, project preview, and state feedback in `frontend/src/pages/HomePage.tsx`
- [x] T035 [US1] Build desktop ListingFilterPanel and keyboard-accessible mobile ListingFilterDrawer using category/location cascading options in `frontend/src/features/listings/components/ListingFilters.tsx`
- [x] T036 [US1] Implement result count, sort, grid/list responsive layout, pagination, and loading/empty/error states in `frontend/src/pages/ListingPage.tsx`
- [x] T037 [P] [US1] Implement image gallery, property facts, description, location/project summary, and sticky contact card in `frontend/src/features/listings/components/ListingGallery.tsx` and `frontend/src/features/listings/components/ListingDetails.tsx`
- [x] T038 [US1] Implement public-code detail, unavailable/not-found handling, document title, and responsive composition in `frontend/src/pages/ListingDetailPage.tsx`
- [x] T039 [US1] Run US1 unit/integration/browser tests at 360/768/1440 and record the MVP checkpoint in `.specify/specs/002-modern-business-frontend/evidence/us1-public-discovery.md`

**Checkpoint**: A polished, independently demonstrable guest property-discovery MVP works without mock IDs or stale endpoints.

---

## Phase 4: User Story 2 â€” KhÃ¡m phÃ¡ dá»± Ã¡n (Priority: P1)

**Goal**: Guest browses/filter projects by URL, opens a project by slug, and sees its paginated ACTIVE listings.

**Independent Test**: Filter projects by keyword, district, and status; open a slug detail; paginate the project listings and verify only active content is shown.

### Tests for User Story 2

- [x] T040 [P] [US2] Write failing MSW contract tests for project search filters, slug detail, nested listing pagination, and 404 in `frontend/src/features/projects/projectApi.test.ts`
- [x] T041 [P] [US2] Write failing page tests for project URL filters, list states, status labels, detail composition, and pagination in `frontend/tests/integration/projects.test.tsx`
- [x] T042 [P] [US2] Write the failing project browse/filter/detail browser journey in `frontend/e2e/projects.spec.ts`

### Implementation for User Story 2

- [x] T043 [US2] Implement typed project list/detail services, query keys, and URL search state in `frontend/src/features/projects/projectApi.ts`, `frontend/src/features/projects/projectQueries.ts`, and `frontend/src/features/projects/projectSearchState.ts`
- [x] T044 [P] [US2] Implement ProjectCard and ProjectFilters with Vietnamese status/price/address presentation in `frontend/src/features/projects/components/ProjectCard.tsx` and `frontend/src/features/projects/components/ProjectFilters.tsx`
- [x] T045 [US2] Implement paginated/filterable project browsing with responsive states in `frontend/src/pages/ProjectListPage.tsx`
- [x] T046 [US2] Implement slug-based project detail and nested ACTIVE listing pagination in `frontend/src/pages/ProjectDetailPage.tsx`
- [x] T047 [US2] Register project routes/navigation and add project preview links from home in `frontend/src/app/router.tsx`, `frontend/src/components/layout/PublicLayout.tsx`, and `frontend/src/pages/HomePage.tsx`
- [x] T048 [US2] Run US2 tests and record the independent project checkpoint in `.specify/specs/002-modern-business-frontend/evidence/us2-projects.md`

**Checkpoint**: Project discovery works independently and uses slug/public listing identifiers throughout.

---

## Phase 5: User Story 3 â€” TÃ i khoáº£n vÃ  tin Ä‘Ã£ lÆ°u (Priority: P1)

**Goal**: User completes register/login/session restore/profile/security/logout and manages saved listings consistently.

**Independent Test**: Register, login, reload, save/remove a listing, edit profile, change password, and logout; a revoked refresh token returns to login without a request loop.

### Tests for User Story 3

- [x] T049 [P] [US3] Write failing tests for auth API field names, token rotation, one refresh for concurrent 401 responses, terminal logout, and safe errors in `frontend/src/features/auth/authApi.test.ts` and `frontend/src/lib/api/client.test.ts`
- [x] T050 [P] [US3] Write failing form/page tests for login, register, intended destination, profile update, seller upgrade, password change, and revoked session in `frontend/tests/integration/account.test.tsx`
- [x] T051 [P] [US3] Write failing tests for saved-listing pagination, idempotent save/remove, unauthenticated redirect, and optimistic rollback in `frontend/tests/integration/savedListings.test.tsx`
- [x] T052 [P] [US3] Write the failing register/login/reload/favorite/profile/logout browser journey in `frontend/e2e/account.spec.ts`

### Implementation for User Story 3

- [x] T053 [P] [US3] Define auth/profile/password validation schemas and request/response types in `frontend/src/features/auth/authSchemas.ts` and `frontend/src/features/auth/authTypes.ts`
- [x] T054 [US3] Implement register/login/refresh/logout/profile/password/upgrade operations in `frontend/src/features/auth/authApi.ts`
- [x] T055 [US3] Complete AuthContext rehydration, rotated-token replacement, role updates, and cross-tab logout behavior in `frontend/src/context/AuthContext.tsx`
- [x] T056 [US3] Replace the combined prototype form with dedicated accessible login/register pages and field-level server errors in `frontend/src/pages/LoginPage.tsx` and `frontend/src/pages/RegisterPage.tsx`
- [x] T057 [P] [US3] Implement profile query/mutations and cache synchronization in `frontend/src/features/account/accountQueries.ts`
- [x] T058 [US3] Implement profile view/edit and seller-upgrade callout in `frontend/src/pages/ProfilePage.tsx`
- [x] T059 [US3] Implement password change, confirmation, success feedback, and session cleanup behavior in `frontend/src/pages/SecurityPage.tsx`
- [x] T060 [P] [US3] Implement saved-listing API functions, queries, mutations, and optimistic rollback in `frontend/src/features/saved-listings/savedListingApi.ts` and `frontend/src/features/saved-listings/savedListingQueries.ts`
- [x] T061 [US3] Implement reusable FavoriteButton and integrate it with property cards/detail while preserving intended destination in `frontend/src/features/saved-listings/components/FavoriteButton.tsx`, `frontend/src/features/listings/components/ListingCard.tsx`, and `frontend/src/features/listings/components/ListingDetails.tsx`
- [x] T062 [US3] Implement paginated SavedListingsPage and account/auth routes/navigation in `frontend/src/pages/SavedListingsPage.tsx`, `frontend/src/app/router.tsx`, and `frontend/src/components/layout/AccountLayout.tsx`
- [x] T063 [US3] Run US3 tests including revoked refresh behavior and record the checkpoint in `.specify/specs/002-modern-business-frontend/evidence/us3-account-favorites.md`

**Checkpoint**: Identity, session, profile, and favorites are independently usable and no auth refresh loop remains.

---

## Phase 6: User Story 4 â€” Seller quáº£n lÃ½ vÃ²ng Ä‘á»i tin Ä‘Äƒng (Priority: P1)

**Goal**: Seller completes USER upgrade â†’ DRAFT â†’ images â†’ PENDING and can handle edit, rejection, resubmit, deactivate, delete, and version conflict.

**Independent Test**: Upgrade to SELLER, create a complete DRAFT, upload two images, submit, inspect PENDING status, then edit/resubmit a REJECTED listing.

### Tests for User Story 4

- [x] T064 [P] [US4] Write failing contract tests for seller list/detail/create/update/submit/deactivate/delete/image operations and status errors in `frontend/src/features/seller/sellerListingApi.test.ts`
- [x] T065 [P] [US4] Write failing schema tests for required fields, numeric ranges, coordinates, phone, version, and dependent location resets in `frontend/src/features/seller/listingFormSchema.test.ts`
- [x] T066 [P] [US4] Write failing uploader tests for MIME, 5 MB, duplicate selection, preview cleanup, delete failure, and 10-image limit in `frontend/src/features/seller/components/ListingImageUploader.test.tsx`
- [x] T067 [P] [US4] Write failing seller dashboard/form/action-matrix integration tests in `frontend/tests/integration/sellerWorkspace.test.tsx`
- [x] T068 [P] [US4] Write the failing USER upgrade â†’ DRAFT â†’ upload â†’ PENDING browser journey in `frontend/e2e/seller-publication.spec.ts`

### Implementation for User Story 4

- [x] T069 [P] [US4] Define seller listing types, lifecycle action matrix, and complete form schema in `frontend/src/features/seller/sellerTypes.ts`, `frontend/src/features/seller/listingActions.ts`, and `frontend/src/features/seller/listingFormSchema.ts`
- [x] T070 [US4] Implement seller listing and multipart image services plus query/mutation cache rules in `frontend/src/features/seller/sellerListingApi.ts` and `frontend/src/features/seller/sellerListingQueries.ts`
- [x] T071 [US4] Build seller summary/status tabs, paginated owned listings, rejection reasons, and row/card actions in `frontend/src/pages/SellerDashboardPage.tsx`
- [x] T072 [P] [US4] Build reusable cascading Category/Province/District/Ward/Project selectors in `frontend/src/features/seller/components/ListingClassificationFields.tsx` and `frontend/src/features/locations/locationQueries.ts`
- [x] T073 [P] [US4] Build listing content, pricing, property attributes, location, and contact form sections in `frontend/src/features/seller/components/ListingForm.tsx`
- [x] T074 [US4] Implement create-DRAFT flow, draft persistence on validation failure, and redirect to owned detail in `frontend/src/pages/CreateListingPage.tsx`
- [x] T075 [US4] Implement image previews, sequential upload feedback, delete, retry, and client constraints in `frontend/src/features/seller/components/ListingImageUploader.tsx`
- [x] T076 [US4] Implement owned listing detail with status timeline, rejection reason, valid actions, images, and version display in `frontend/src/pages/SellerListingDetailPage.tsx`
- [x] T077 [US4] Implement edit flow with optimistic `version`, 409 reload choice, ACTIVEâ†’PENDING notice, and server field errors in `frontend/src/pages/EditListingPage.tsx`
- [x] T078 [US4] Implement submit, resubmit, deactivate, and delete confirmation mutations with status-aware cache invalidation in `frontend/src/features/seller/components/ListingLifecycleActions.tsx`
- [x] T079 [US4] Register seller routes, USER upgrade screen, role navigation, and owner-only loading states in `frontend/src/app/router.tsx`, `frontend/src/pages/SellerUpgradePage.tsx`, and `frontend/src/components/layout/SellerLayout.tsx`
- [x] T080 [US4] Run seller schema/component/integration/E2E tests and record the lifecycle checkpoint in `.specify/specs/002-modern-business-frontend/evidence/us4-seller-lifecycle.md`

**Checkpoint**: Seller publication lifecycle is fully demonstrable without Swagger and invalid actions are unavailable in the UI.

---

## Phase 7: User Story 6 â€” Tráº£i nghiá»‡m business nháº¥t quÃ¡n (Priority: P1)

**Goal**: The completed public/account/seller surfaces are responsive, keyboard accessible, visually consistent, and fast enough for demonstration.

**Independent Test**: Complete primary navigation and forms at 360/768/1440 using keyboard only; automated accessibility scans have no serious/critical issues.

### Tests for User Story 6

- [x] T081 [P] [US6] Add failing axe checks for public, account, seller, modal, form, and data-table representatives in `frontend/tests/accessibility/accessibility.test.tsx`
- [x] T082 [P] [US6] Add failing responsive overflow, mobile navigation, filter drawer, gallery, and sticky-action browser checks in `frontend/e2e/responsive.spec.ts`
- [x] T083 [P] [US6] Add failing keyboard order, visible focus, Escape close, focus return, heading, label, and error-announcement checks in `frontend/e2e/accessibility.spec.ts`

### Implementation for User Story 6

- [x] T084 [P] [US6] Finalize accessible desktop/mobile headers, menus, breadcrumb, footer, skip link, and active navigation in `frontend/src/components/layout/PublicLayout.tsx` and `frontend/src/components/layout/Navigation.tsx`
- [x] T085 [P] [US6] Apply the business typography, imagery, card density, status language, and motion rules consistently in `frontend/src/styles/globals.css` and `frontend/src/styles/components.css`
- [x] T086 [US6] Resolve responsive overflow and interaction issues across public/account/seller routes using shared overrides in `frontend/src/styles/responsive.css` and page-level fixes in `frontend/src/components/layout/PublicLayout.tsx`
- [x] T087 [US6] Fix labels, focus management, semantic headings, ARIA announcements, non-color status cues, and contrast defects in `frontend/src/components/ui/index.tsx`, `frontend/src/components/feedback/index.tsx`, and `frontend/src/styles/accessibility.css`
- [x] T088 [US6] Add route lazy-loading, image loading hints, stable skeleton dimensions, and bundle-size reporting in `frontend/src/app/router.tsx`, `frontend/src/features/listings/components/ListingCard.tsx`, and `frontend/vite.config.ts`
- [x] T089 [US6] Run responsive/accessibility/performance checks and record results in `.specify/specs/002-modern-business-frontend/evidence/us6-business-experience.md`

**Checkpoint**: Public, account, and seller journeys meet the visual/responsive/accessibility acceptance criteria.

---

## Phase 8: User Story 5 â€” Admin váº­n hÃ nh ná»™i dung (Priority: P2)

**Goal**: Admin moderates listings, manages users, and completes validated CRUD for categories, projects, and locations in a dedicated workspace.

**Independent Test**: Approve one PENDING listing, reject another with reason, ban/unban a user, and complete create/update/delete for one master-data type.

### Tests for User Story 5

- [x] T090 [P] [US5] Write failing contract tests for moderation, users, category, project, and location admin APIs including 400/403/409 responses in `frontend/src/features/admin/adminApi.test.ts`
- [x] T091 [P] [US5] Write failing component tests for DataTable, confirmation dialog, rejection dialog, admin forms, and conflict reload in `frontend/src/features/admin/components/adminComponents.test.tsx`
- [x] T092 [P] [US5] Write failing integration tests for moderation queue, user management, and one complete master-data CRUD flow in `frontend/tests/integration/adminWorkspace.test.tsx`
- [x] T093 [P] [US5] Write the failing ADMIN moderation/ban/master-data browser journey and non-admin access case in `frontend/e2e/admin.spec.ts`

### Implementation for User Story 5

- [x] T094 [US5] Implement typed moderation/user/category/project/location services, query keys, and mutation invalidation in `frontend/src/features/admin/adminApi.ts` and `frontend/src/features/admin/adminQueries.ts`
- [x] T095 [P] [US5] Build admin overview metrics/navigation from available paginated data without inventing unsupported analytics in `frontend/src/pages/admin/AdminOverviewPage.tsx`
- [x] T096 [US5] Build status-filtered moderation queue with pagination, listing context, approve action, and refresh feedback in `frontend/src/pages/admin/ModerationPage.tsx`
- [x] T097 [US5] Build required-reason rejection dialog and transactional approve/reject feedback in `frontend/src/features/admin/components/ModerationActions.tsx`
- [x] T098 [US5] Build paginated user table, ban reason confirmation, unban action, and current-state guards in `frontend/src/pages/admin/UserManagementPage.tsx`
- [x] T099 [P] [US5] Build reusable validated components in `frontend/src/features/admin/components/AdminDataTable.tsx`, `frontend/src/features/admin/components/EntityFormDialog.tsx`, `frontend/src/features/admin/components/DeleteConfirmation.tsx`, and `frontend/src/features/admin/components/ConflictNotice.tsx`
- [x] T100 [US5] Implement category CRUD page with duplicate/conflict/usage handling in `frontend/src/pages/admin/CategoryManagementPage.tsx`
- [x] T101 [US5] Implement project CRUD page with district/ward validation and full project fields in `frontend/src/pages/admin/ProjectManagementPage.tsx`
- [x] T102 [US5] Implement province/district/ward CRUD tabs with cascading context and dependency-safe deletion feedback in `frontend/src/pages/admin/LocationManagementPage.tsx`
- [x] T103 [US5] Register admin routes, ADMIN-only navigation, access-denied state, and mobile admin sidebar in `frontend/src/app/router.tsx` and `frontend/src/components/layout/AdminLayout.tsx`
- [x] T104 [US5] Run admin tests and record the operations checkpoint in `.specify/specs/002-modern-business-frontend/evidence/us5-admin-operations.md`

**Checkpoint**: Admin can perform publication moderation and master-data operations entirely from the frontend.

---

## Phase 9: Polish, Traceability, and Graduation Demo

**Purpose**: Verify the complete feature against contracts and create reproducible evidence without introducing Docker.

- [x] T105 [P] Create FR/SC-to-task/test traceability for frontend requirements in `.specify/specs/002-modern-business-frontend/evidence/traceability.md`
- [x] T106 Remove obsolete routes/pages, stale Axios client usage, hardcoded IDs, external placeholder URLs, mojibake, console statements, and TODO comments from `frontend/src/App.tsx`, `frontend/src/services/api.ts`, `frontend/src/pages/AuthPage.tsx`, `frontend/src/pages/PostListingPage.tsx`, and `frontend/src/pages/SellerDashboard.tsx`
- [x] T107 [P] Add missing regression tests discovered during story checkpoints in `frontend/tests/regression/regression.test.tsx`
- [x] T108 Run `npm run lint`, `npm run test`, `npm run build`, and deterministic Playwright tests and save output in `.specify/specs/002-modern-business-frontend/evidence/final-quality.md`
- [x] T109 Execute guest/account/seller/admin quickstart scenarios against the real local backend and record results in `.specify/specs/002-modern-business-frontend/evidence/real-backend-validation.md`
- [x] T110 [P] Run final axe/keyboard/responsive checks and save the accessibility report in `.specify/specs/002-modern-business-frontend/evidence/accessibility.md`
- [x] T111 Capture approved 360/768/1440 screenshots and write the graduation demo script in `.specify/specs/002-modern-business-frontend/evidence/demo-script.md`
- [x] T112 Update local frontend setup, environment, test, route, account, and demo instructions in `frontend/README.md` and root `README.md`

**Final Checkpoint**: All required commands pass; quickstart scenarios and SC-001â€“SC-008 have evidence; no Docker validation is required in this feature.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependency; starts immediately.
- **Phase 2 Foundation**: Depends on Phase 1 and blocks every user story.
- **US1 Public discovery**: Starts after Foundation and defines the MVP boundary.
- **US2 Projects**: Starts after Foundation; can run beside US1, but may reuse the completed ListingCard.
- **US3 Account/favorites**: Starts after Foundation; can run beside US1/US2.
- **US4 Seller**: Depends on Foundation, US3 session/role behavior, and the public category dependency.
- **US6 Business experience**: Runs after the target public/account/seller surfaces exist.
- **US5 Admin**: Depends on Foundation and US3 ADMIN session/guard behavior; otherwise independent of seller UI.
- **Phase 9 Polish**: Depends on every story selected for the final release.

### User Story Graph

```text
Setup -> Foundation -> US1 (MVP)
                    -> US2
                    -> US3 -> US4
                          -> US5
              US1 + US2 + US3 + US4 -> US6
              all selected stories -> Polish
```

### Within Each User Story

1. Write tests and verify they fail for the intended missing behavior.
2. Add types/schema and API/query boundary.
3. Build domain components.
4. Compose pages/routes and integrate states.
5. Run independent tests and record evidence before moving on.

## Parallel Opportunities

- In Setup, T004 and T005 can run while T003 is being prepared.
- In Foundation, shared types/formatters/errors/session/tokens, backend category test, and MSW fixtures use separate files.
- After Foundation, US1, US2, and US3 may be assigned independently.
- Within every story, tasks marked `[P]` are test/model/component files that do not overlap.
- US5 API/component tests can run in parallel before admin implementation.
- Traceability, regression tests, and accessibility evidence can run in parallel during final polish.

### Parallel Example: User Story 1

```text
T027 listing API contract tests
T028 listing URL-state tests
T029 public listing component/integration tests
T030 guest Playwright journey
```

### Parallel Example: User Story 4

```text
T064 seller API contract tests
T065 listing form schema tests
T066 uploader tests
T067 seller workspace integration tests
T068 seller Playwright journey
```

### Parallel Example: User Story 5

```text
T090 admin API contract tests
T091 reusable admin component tests
T092 admin workspace integration tests
T093 admin Playwright journey
```

## Implementation Strategy

### MVP First

1. Complete T001â€“T007 (Setup).
2. Complete T008â€“T026 (Foundation).
3. Complete T027â€“T039 (US1 Public discovery).
4. Stop and validate the guest MVP independently before auth/seller/admin expansion.

### Incremental Delivery

1. Foundation â†’ typed, tested shell and design system.
2. US1 â†’ guest property-search MVP.
3. US2 â†’ project discovery.
4. US3 â†’ account and favorites.
5. US4 â†’ seller publication workflow.
6. US6 â†’ full business/responsive/accessibility quality.
7. US5 â†’ admin operations.
8. Polish â†’ evidence-ready graduation release.

### Solo-Student Daily Rule

1. Open this file and find the first unchecked task whose dependencies are checked.
2. Work on no more than two substantial tasks per day.
3. For test-first tasks, confirm the expected failure before implementation.
4. Run the nearest relevant test after each task.
5. At each checkpoint, run the complete story suite, update evidence, mark tasks `[x]`, and commit a logical group.

## Notes

- `[P]` means different files and no dependency on incomplete work; it does not require parallel execution.
- Story labels provide traceability to `spec.md` and must remain unchanged.
- Do not hardcode data to unblock UI; resolve the contract dependency instead.
- Route guards improve UX but never replace backend authorization.
- Docker remains outside this feature by explicit user decision.

## Phase 10: Convergence

**Purpose**: Close backend/frontend contract, lifecycle, storage, security, and performance gaps found during the post-implementation audit.

- [x] T113 Permit public read access to `/uploads/**` and add backend security/integration regression coverage per US1/AC3 and FR-005 (contradicts)
- [x] T114 Enforce one seller lifecycle policy for update, submit, deactivate, delete, and image mutations, then align the frontend action matrix and tests per US4/AC3 and FR-008 (contradicts)
- [x] T115 Delete listing image files only after a successful listing-delete transaction and cover cleanup behavior with tests per FR-008 (partial)
- [x] T116 Return a structured uploaded-image DTO containing the persistent image ID and update frontend upload/delete state and contract tests per SC-006 (partial)
- [x] T117 Validate listing project-to-district/ward consistency and expose all editable project fields required by the admin project form per FR-009 (partial)
- [x] T118 Externalize CORS origins and runtime profile behavior, align the upload resource handler with `file.upload-dir`, and allow multipart envelope overhead per FR-019 (partial)
- [x] T119 Serialize refresh-token rotation, reject token replay deterministically, and schedule cleanup of expired/revoked token rows per US3/AC2 and FR-011 (partial)
- [x] T120 Add bounded association fetching for seller/admin listing pages and regression coverage for page behavior per SC-005 (partial)
- [x] T121 Run backend and frontend regression suites, production builds, and a real-local-backend smoke check, then update validation evidence per FR-018, SC-006, and SC-008 (partial)





