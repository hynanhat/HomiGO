# Research: HomiGO Modern Business Frontend

## Decision 1: Evolve the existing frontend instead of rebuilding the repository

**Decision**: Keep the existing React/Vite project and replace prototype pages incrementally behind a new app/router/provider structure.

**Rationale**: The repository already satisfies the mandated framework choices and contains useful auth/listing starting points. Incremental vertical slices reduce integration risk with the completed backend.

**Alternatives considered**: Delete and scaffold again; rejected because it discards working package/config context without solving contract or design problems.

## Decision 2: Internal design system over a large visual component framework

**Decision**: Build a small HomiGO design system with Tailwind/CSS tokens, semantic HTML and Lucide icons.

**Rationale**: A graduation project benefits from a distinctive visual identity. The required primitive set is manageable, while a large pre-styled framework would make the product generic and harder to customize consistently.

**Alternatives considered**: Material UI or Ant Design; useful for admin speed, but rejected as the primary UI layer because the public property experience needs stronger brand control.

## Decision 3: Separate auth, server and URL state

**Decision**: Use Auth Context only for session/user/role, TanStack Query for remote data, URL parameters for search filters, and local state for temporary UI.

**Rationale**: Each state category has a clear owner. This avoids a global store containing duplicated server data and keeps search pages linkable/bookmarkable.

**Alternatives considered**: One large Context or Redux store; rejected because it increases rerenders/boilerplate and is unnecessary at current scale.

## Decision 4: Typed API boundary

**Decision**: Define `ApiResponse<T>`, `PageResponse<T>` and domain DTO types, then expose feature services/hooks; pages and components never call Axios directly.

**Rationale**: Current prototype errors came from stale endpoint names, `token` versus `accessToken`, ID versus `publicCode`, and incorrect page assumptions. A typed boundary makes these mismatches visible during build.

**Alternatives considered**: Keep ad-hoc Axios calls in pages; rejected because it repeats envelope parsing and error handling.

## Decision 5: Session refresh uses a single-flight queue

**Decision**: Hold the access token in application memory, persist only what is required to rehydrate the session under the current backend contract, and allow only one refresh request while concurrent failed requests wait.

**Rationale**: This prevents refresh storms and infinite 401 loops. Centralized logout clears all local session material when refresh is revoked or expired.

**Alternatives considered**: Persist access token and refresh independently in every component; rejected due to stale state and larger XSS exposure. HttpOnly refresh cookies remain the preferred future backend hardening but are outside this frontend-only scope.

## Decision 6: Form handling and validation

**Decision**: Use React Hook Form plus Zod for auth, listing and admin forms; keep backend messages authoritative and map validation details to fields when available.

**Rationale**: The listing form has dependent selects, optional numeric fields, upload constraints and optimistic version data. Schema-driven validation avoids scattered manual checks.

**Alternatives considered**: Fully controlled inputs with hand-written validation; viable for login but too repetitive for seller/admin workflows.

## Decision 7: Testing pyramid for frontend

**Decision**: Use Vitest/Testing Library for components and hooks, MSW for contract-level integration, and Playwright for a small number of critical browser journeys; add axe checks to representative pages.

**Rationale**: Unit/integration tests give fast feedback, while E2E demonstrates the graduation-project flows without making the entire suite slow and fragile.

**Alternatives considered**: Only manual testing or only browser E2E; rejected because neither provides balanced speed and diagnostic value.

## Decision 8: Business visual language

**Decision**: Use a restrained light theme, ink/navy text, brick-red primary actions, neutral surfaces, consistent status colors, Vietnamese-friendly typography and property photography as the main visual emphasis.

**Rationale**: The product should communicate trust, asset value and operational clarity. The direction is modern without resembling a consumer social app or directly cloning the reference site.

**Alternatives considered**: Heavy gradients/glassmorphism or an all-red marketplace aesthetic; rejected because they reduce readability and feel less credible for high-value transactions.

## Decision 9: No interactive map in this release

**Decision**: Keep bounding-box capability in the API model but defer the map UI; show address and coordinates where available.

**Rationale**: A production-quality map introduces provider, tile, geocoding, interaction and cost decisions. Search/list/detail/seller/admin are higher-value graduation requirements.

**Alternatives considered**: Add Leaflet immediately; rejected until the core frontend quality gates are complete.

## Decision 10: Public category data is a backend prerequisite

**Decision**: Add or expose a read-only paginated category endpoint before finishing public category filters and seller listing forms.

**Rationale**: The existing backend contract only exposes category listing under ADMIN, so a secure frontend cannot remove hardcoded IDs without a public source of valid category options.

**Alternatives considered**: Bundle category constants or call admin API; rejected because both cause stale data or violate authorization boundaries.
