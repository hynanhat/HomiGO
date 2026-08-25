# Foundation Checkpoint Evidence

**Feature**: `002-modern-business-frontend`  
**Checkpoint date**: 2026-08-16  
**Tasks**: T008–T026

## Implemented foundation

- Shared typed API envelopes, pagination, roles, statuses, session and domain models.
- Vietnamese currency, area, date, address and project-status formatters.
- Normalized safe API errors and field-error extraction.
- Session persistence that keeps the access token in memory and persists only the refresh session required by the current backend contract.
- Environment-based Axios client with envelope unwrapping, bearer injection, single-flight refresh and terminal session cleanup.
- TanStack Query defaults, combined providers, typed Auth Context and anonymous/authenticated/seller/admin guards.
- Lazy route tree matching the approved public/account/seller/admin route contract, including a dedicated admin shell and 404 boundary.
- HomiGO visual tokens, global Tailwind 4 styles, reusable UI primitives, feedback states and four responsive layouts.
- Deterministic MSW server plus auth/listing/project/location/admin fixtures.
- Public paginated `GET /api/v1/categories` endpoint through controller, service, DTO, repository and security boundaries.

## Test-first evidence

`CategoryControllerIntegrationTest` was executed before T019 and failed twice with HTTP 401, proving the public category behavior was absent. After the controller/service/security implementation, both tests passed using the H2 `test` profile.

`uiPrimitives.test.tsx` was executed before T023 and failed because the primitive module did not exist. After implementation, all five interaction/accessibility tests passed.

## Quality commands

| Command | Result |
|---|---|
| `cd frontend; npm ci` | PASS — 258 packages installed deterministically |
| `npm run lint` | PASS — no warnings or errors |
| `npm run test` | PASS — 5 files, 18 tests |
| `npm run test:coverage` | PASS — statements 20.07%, branches 36.57%, functions 17.34%, lines 22.12% |
| `npm run build` | PASS — TypeScript and Vite production build; lazy page chunks generated |
| `cd backend; .\mvnw.cmd -q -Dtest=CategoryControllerIntegrationTest test` | PASS — 2 tests, 0 failures/errors/skips |

## Environment and known observations

- Backend category tests use in-memory H2; MySQL and Docker were not required.
- `npm audit` still reports one transitive high-severity advisory in `nanoid`, already present in the Phase 1 baseline. No automatic dependency rewrite was applied.
- Maven reports existing Java deprecation and Mockito dynamic-agent warnings; neither affects the category test result.

## Checkpoint conclusion

The Phase 2 gate is satisfied: the frontend now has a typed API/auth boundary, query and test infrastructure, route guards, design system primitives, responsive shells and a public category dependency backed by an integration-tested endpoint.
