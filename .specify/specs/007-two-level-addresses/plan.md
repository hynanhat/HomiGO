# Implementation Plan: Two-Level Production Addresses

**Branch**: `007-two-level-addresses` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `.specify/specs/007-two-level-addresses/spec.md`

## Summary

Perform a one-way clean cutover from the unused province → district → ward schema to province → commune-level unit. Flyway V1–V9 remain immutable. A fail-fast V10 checks `listings` and `projects` before any DDL; if either is non-empty, migration stops. If both are empty, V10 removes the old location tables and listing/project district/ward columns, creates the new release-aware two-level catalog, and adds required province/commune references to the empty business tables. ADMIN then validates and explicitly activates the immutable `vn-administrative-units-2025-07-01` artifact (34 provinces, 3,321 commune-level units) and the approved 16-category catalog. No demo business records, legacy mapping, review queue, dual-read behavior, or district compatibility surface is built.

## Technical Context

**Language/Version**: Java 17 with Spring Boot 4.1; TypeScript 6 with React 19

**Primary Dependencies**: Spring WebMVC, Spring Data JPA, Spring Security/JWT, Bean Validation, Flyway; React Router, TanStack React Query, Axios, React Hook Form, Zod

**Storage**: MySQL 8.4/InnoDB; immutable normalized JSON artifacts and manifests bundled in backend resources

**Testing**: JUnit 5, Mockito, Spring MVC integration tests, Flyway/MySQL Testcontainers; Vitest, React Testing Library, MSW, Playwright

**Target Platform**: Docker Compose on Linux VPS; modern desktop and mobile browsers

**Project Type**: Full-stack web application with REST API

**Performance Goals**: Selected-province commune choices available within 2 seconds; indexed province/commune filters; complete selector results assembled from paginated APIs

**Constraints**: V1–V9 immutable; destructive V10 only after a zero-row listing/project preflight; official codes remain strings; no runtime scraping; no demo data; validation and activation are separate ADMIN actions; V10 has no down migration

**Scale/Scope**: 3,355 official administrative units, 16 categories, two addressed business entities, public discovery, seller/admin forms, AI trusted context, recommendations, admin release operations, and full-stack tests

## Constitution Check

*GATE: Passed before Phase 0 and re-checked after Phase 1.*

- **I. Backend Architecture**: PASS — validation, activation, location, listing, project, search, recommendation, and AI logic remain in services behind controller/service/repository/entity/DTO layers. Flyway infrastructure is isolated from business services.
- **II. Security**: PASS — JWT/security remain unchanged; artifacts contain no secrets; production credentials stay in environment variables.
- **III. Authorization**: PASS — public/seller users can read the active catalog; only ADMIN can validate or activate dataset/category releases; existing listing ownership and project administration remain enforced.
- **IV. Data Validation**: PASS — request DTOs validate shapes and required codes; services validate active release and province/commune membership.
- **V. Error Handling**: PASS — validation, checksum, state, relation, and activation failures use centralized error handling and Vietnamese messages.
- **VI. Database Standards**: PASS — MySQL tables/columns use `snake_case` with explicit foreign keys, unique constraints, checks, and indexes; V1–V9 are not edited.
- **VII. API Standards**: PASS — `/api/v1`, response envelopes, and paginated collections are retained; selectors aggregate pages.
- **VIII. Frontend Architecture**: PASS — React/Vite/Router remain; Axios is centralized; React Query manages catalog data.
- **IX. Testing**: PASS — core services receive JUnit/Mockito tests, destructive migration behavior uses MySQL Testcontainers, and UI workflows use unit/integration/E2E tests.
- **X. Language Policy**: PASS — source identifiers are English and visible labels/errors are Vietnamese.
- **Post-design re-check**: PASS — no constitutional exception is required.

## Technical Strategy

### 1. Immutable baseline and V10 safety boundary

- Do not edit V1–V9.
- Implement V10 as a fail-fast Flyway migration whose first database reads count rows in `listings` and `projects`.
- Throw a descriptive migration exception before issuing any DDL when either count is non-zero.
- Test the failure path by comparing schema objects before and after the attempted migration.
- Because MySQL DDL auto-commits, the preflight must be complete before the first `ALTER`, `DROP`, or `CREATE` statement.

### 2. Destructive clean schema

After preflight succeeds:

1. Create the release-aware `administrative_provinces` and `commune_units` target schema and its catalog controls.
2. Add required `administrative_province_id` and `commune_unit_id` columns plus parent-consistent foreign keys to the empty business tables.
3. Drop listing/project foreign keys, indexes, `district_id`, and legacy `ward_id` that reference the old hierarchy.
4. Drop `wards`, `districts`, and legacy `provinces` in dependency order.

There is no intermediate schema that accepts legacy writes and no retained audit structure.

### 3. Pinned artifacts and ADMIN workflow

- Normalize official material offline into a reviewed immutable artifact with manifest, source URLs, attribution, effective date, transform version, exact counts, sentinel rows, and SHA-256.
- Bundle the artifact; production never downloads administrative data at runtime.
- `validate` parses and verifies an artifact and records a `VALIDATED` release without changing the active pointer.
- `activate` requires a validated release, writes/retains its immutable unit rows, changes the singleton active pointer transactionally, and invalidates location caches.
- Same version/checksum is idempotent; same version/different checksum is `409 Conflict`.
- Apply the same validate/activate state discipline to the 16-category artifact.

### 4. Application cutover

- Replace district/ward entities and repositories with province/commune-level models.
- Require `provinceCode` and `communeCode` in listing/project/AI requests.
- Persist required province/commune associations and validate that both belong to the active release and the commune belongs to the province.
- Replace district fields in DTOs, repository graphs, specifications, recommendations, formats, filters, forms, test fixtures, and OpenAPI.
- Remove district routes and admin three-level CRUD; there is no compatibility resolver.

### 5. Verification and recovery

- Before deployment, stop business writes, verify counts manually, and take a MySQL backup/snapshot.
- Run the V10 success path only after the same zero-count check is observed operationally.
- Deploy the new backend before exposing the frontend; activate reference releases through an ADMIN session.
- Verify exact reference counts, empty business tables, API health, selectors, category choices, Docker health, and critical workflows.
- An old application binary is incompatible after V10. Recovery is either restore the pre-V10 backup or recreate the disposable database and rerun V1–V10 plus ADMIN validation/activation. Flyway downgrade is not supported.

## Project Structure

### Documentation

```text
.specify/specs/007-two-level-addresses/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── tasks.md
└── contracts/
    ├── api.md
    └── ui.md
```

### Source Code

```text
backend/
├── src/main/java/com/batdongsan/
│       ├── controller/{LocationController,AdminLocationController}.java
│       ├── dto/{location,project,ai,admin/location}/
│       ├── entity/{AdministrativeDatasetRelease,AdministrativeCatalogState,AdministrativeProvince,CommuneUnit,CategoryDatasetRelease,Listing,Project}.java
│       ├── repository/
│       └── service/{AdministrativeDatasetService,AdministrativeDatasetValidator,ProductionCategoryCatalogService,LocationService,ListingService,ProjectService,RecommendationService}.java
├── src/main/resources/
│   ├── db/migration/V10__two_level_addresses_clean_cutover.sql
│   ├── administrative-data/vn-administrative-units-2025-07-01/{manifest,provinces,commune-units}.json
│   └── production-data/categories-v1/{manifest,categories}.json
└── src/test/

frontend/
├── src/
│   ├── components/location/TwoLevelLocationFields.tsx
│   ├── features/{locations,listings,projects,seller,admin}/
│   ├── pages/admin/LocationManagementPage.tsx
│   ├── types/domain.ts
│   └── lib/formatters/
├── tests/
└── e2e/

scripts/
└── administrative-data/normalize.mjs
```

**Structure Decision**: Keep the existing Spring Boot and React applications. Add one fail-fast destructive V10 SQL migration, immutable data resources, and normal layered backend/frontend feature modules. Delete obsolete district code during implementation rather than retaining a parallel path.

## Phase Plan

1. **Safety baseline**: Capture current schema, dependency inventory, and pre-cutover/rollback checklist.
2. **Destructive schema foundation**: Implement and Testcontainers-test V10 preflight, drop/recreate sequence, constraints, and Hibernate validation.
3. **Reference data**: Produce pinned artifacts; implement validator, release state, ADMIN validate/activate endpoints, and exact-count/idempotency/security tests.
4. **Two-level backend**: Replace entity/DTO/repository/service/controller behavior for locations, listings, projects, search, recommendations, and AI.
5. **Two-level frontend**: Replace types, query state, selectors, seller/admin forms, displays, filters, and fixtures.
6. **Production verification**: Run backend/frontend/Docker suites, execute quickstart gates, activate artifacts, and capture evidence.

## Complexity Tracking

| Decision | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Fail-fast SQL V10 guard | Keeps the migration beside V1–V9 while checking both counts before the first DDL | Trusting an external/manual count leaves a race before deployment |
| Separate validate and activate operations | An ADMIN must inspect provenance and results before public cutover | Auto-seeding at startup removes the explicit approval gate |
| Release-aware catalog and singleton active pointer | Supports auditable activation and future official snapshots | Unversioned rows cannot prove which immutable source release is public |
