# Implementation Plan: Safe Listing Moderation and Multi-Image Workflow

**Branch**: `008-moderation-image-workflow` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

## Summary

Add a dedicated administrator listing-detail workflow, introduce an audited `ACTIVE -> REMOVED` soft-removal transition, and make the existing maximum-ten-image flow visibly batch-oriented and retry-safe. The backend remains a layered Spring Boot application backed by MySQL/Flyway; the React application keeps the existing single-file upload endpoint but orchestrates a stable, idempotent sequential batch.

## Technical Context

**Language/Version**: Java 17; TypeScript 6; React 19  
**Primary Dependencies**: Spring Boot 4.1, Spring Data JPA, Spring Security/JWT, Flyway, React Router 7, TanStack Query, Axios, React Hook Form, Zod  
**Storage**: MySQL 8.4 for records and moderation audit; filesystem volume for listing image binaries  
**Testing**: JUnit 5/Mockito/Testcontainers; Vitest/Testing Library/MSW; Playwright/axe  
**Target Platform**: Docker Compose on Ubuntu VPS behind host Nginx  
**Project Type**: Web application with Spring REST API and React SPA  
**Performance Goals**: Moderation detail should render after one detail request; image batches remain sequential to stay within current proxy and memory limits  
**Constraints**: Maximum 10 images per listing, 5 MB per image, JPEG/PNG/WebP only; all mutations require authorization and stale-write protection; no physical deletion for admin takedown  
**Scale/Scope**: One admin detail route, three moderation actions, existing seller listing editor, one schema migration, and focused backend/frontend regression coverage

## Constitution Check

*Gate passed before research and re-checked after design.*

- **Backend architecture**: Controllers only validate/route; transitions and ownership checks remain in services; repositories own persistence queries.
- **Security and authorization**: `/api/v1/admin/**` remains ADMIN-only; seller mutation paths retain ownership verification; no secrets are introduced.
- **Validation and errors**: New request DTOs use Bean Validation. Conflicts and invalid transitions use the existing centralized JSON error handling.
- **Database standards**: V11 uses MySQL, `snake_case`, explicit foreign keys, and preserves audit history.
- **API standards**: All new endpoints use `/api/v1` and the existing success envelope. The existing moderation queue remains paginated.
- **Frontend architecture**: React Router and the centralized Axios client are retained.
- **Testing**: New service, controller/API, component, and browser-level cases cover the core transitions and upload retry behavior.
- **Language policy**: Code identifiers are English; visible labels and errors are Vietnamese.

No constitutional exception is required.

## Project Structure

### Documentation

```text
.specify/specs/008-moderation-image-workflow/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- api.md
|   `-- ui.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code

```text
backend/src/main/java/com/batdongsan/backend/
|-- controller/
|-- dto/
|-- entity/
|-- repository/
`-- service/
backend/src/main/resources/db/migration/
backend/src/test/java/com/batdongsan/backend/

frontend/src/
|-- api/
|-- components/admin/
|-- components/listings/
|-- pages/admin/
|-- pages/seller/
|-- routes/
`-- types/
frontend/tests/
frontend/e2e/
```

**Structure Decision**: Extend the existing backend/frontend projects in place. No new application, storage service, or public API version is necessary.

## Design Phases

### Phase 0 - Research

Confirm moderation transitions, audit requirements, stale-write protection, existing public visibility filters, current upload limitations, and accessible interaction rules. Decisions are recorded in [research.md](./research.md).

### Phase 1 - Contracts and Data

Define the V11 schema additions, state transitions, response/request shapes, route behavior, and acceptance commands in [data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md), [contracts/ui.md](./contracts/ui.md), and [quickstart.md](./quickstart.md).

### Phase 2 - Implementation

Implement in independently testable user-story slices: admin inspection, audited removal/remediation, then batch image reliability. Write focused tests alongside each slice and finish with full regression/build validation.

## Risk Controls

- Use a pessimistic listing lock plus `expectedVersion` on moderation mutations so an old admin screen cannot overwrite a newer state.
- Keep admin removal as `REMOVED`, never physical deletion, and preserve history, actor, timestamp, and reason.
- Preserve the one-file request shape and add a client upload UUID, making timeouts/retries idempotent without raising proxy memory pressure.
- Allocate image ordering with `MAX(sort_order) + 1` under the listing lock; row count is unsafe after deletion.
- Filter saved/public discovery to active, unexpired listings; known image URLs remaining public is documented as an existing media architecture limitation, not silently treated as solved.

## Complexity Tracking

No constitution violations or new architectural layers are introduced.
