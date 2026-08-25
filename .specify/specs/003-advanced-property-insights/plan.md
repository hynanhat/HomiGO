# Implementation Plan: Advanced Property Insights

**Branch**: `[003-advanced-property-insights]` | **Date**: 2026-08-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `.specify/specs/003-advanced-property-insights/spec.md`

## Summary

Extend the existing HomiGO web application with three independently deliverable capabilities: in-app workflow notifications, privacy-conscious unique daily listing view analytics, and explainable content-based property recommendations. The implementation adds a Flyway migration, isolated Spring services/controllers/DTOs with ownership checks, and React Query-backed frontend modules integrated into the existing navigation, public listing detail and seller listing detail pages.

## Technical Context

**Language/Version**: Java 17; TypeScript 6.0; React 19

**Primary Dependencies**: Spring Boot 4.1, Spring Data JPA, Spring Security/JWT, Bean Validation, Flyway; React Router 7, TanStack Query 5, Axios, Lucide React

**Storage**: MySQL 8 for notifications and unique daily view records; browser local storage for a random anonymous visitor identifier

**Testing**: JUnit 5, Mockito, Spring MVC/JPA integration tests and H2 test database; Vitest, React Testing Library, MSW and Playwright

**Target Platform**: Spring web server and modern evergreen desktop/mobile browsers

**Project Type**: Full-stack web application with REST API

**Performance Goals**: 95% of notification, statistics and recommendation interactions complete within two seconds; notification badge becomes current within 60 seconds

**Constraints**: No Docker requirement in this phase; no email/push broker, WebSocket, external AI/ML service or new charting dependency; all analytics authorization is server-side; anonymous identifiers are never stored directly

**Scale/Scope**: Graduation-project deployment sized for up to 100,000 listings, 1,000,000 unique daily view rows, 12 recommendations per request and paginated notification history

## Constitution Check

*GATE: Passed before Phase 0 and re-checked after Phase 1 design.*

- **I. Backend Architecture — PASS**: New controllers delegate to notification, analytics and recommendation services; repositories and entities remain isolated by layer.
- **II. Security — PASS**: Existing JWT authentication remains unchanged. The analytics HMAC secret is environment-provided and no raw visitor identifier is stored.
- **III. Authorization — PASS**: Notification ownership and listing statistics ownership/admin authorization are enforced in services; public writes are limited to idempotent view recording.
- **IV. Data Validation — PASS**: Visitor identifiers, paging, date ranges and recommendation sizes are validated at DTO/controller boundaries.
- **V. Error Handling — PASS**: New failures use existing domain exceptions and centralized JSON handling.
- **VI. Database Standards — PASS**: Migration V6 uses snake_case, explicit foreign keys, unique constraints and indexes.
- **VII. API Standards — PASS**: All endpoints use `/api/v1`, response envelopes and pagination for notification lists.
- **VIII. Frontend Architecture — PASS**: React Router, shared Axios client, AuthContext and TanStack Query patterns are reused.
- **IX. Testing — PASS**: Core service unit tests and API/frontend integration tests are included in tasks.
- **X. Language Policy — PASS**: Source identifiers remain English; user-facing labels and messages are Vietnamese.

No constitutional exception is required.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/003-advanced-property-insights/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/batdongsan/
│   ├── config/
│   ├── controller/
│   ├── dto/
│   │   ├── analytics/
│   │   ├── notification/
│   │   └── recommendation/
│   ├── entity/
│   ├── repository/
│   └── service/
├── src/main/resources/db/migration/
└── src/test/java/com/batdongsan/
    ├── controller/
    └── service/

frontend/
├── src/
│   ├── app/
│   ├── components/layout/
│   ├── features/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   └── recommendations/
│   ├── pages/
│   ├── styles/
│   └── types/
├── tests/
└── e2e/
```

**Structure Decision**: Retain the current backend/frontend split and feature-folder frontend organization. New backend classes follow the existing controller → service → repository → entity/DTO layering; new frontend API/query/component modules live under their business feature.

## Complexity Tracking

No constitution violations or additional project layers are introduced.

## Post-Design Constitution Re-check

The data model, contracts and validation guide retain all ten gates. In particular, public view recording is constrained to active listings and a validated opaque visitor ID, duplicate writes are idempotent, notification access is recipient-scoped, and analytics access is owner/admin-scoped.
