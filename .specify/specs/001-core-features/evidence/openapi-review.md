# OpenAPI contract review — Phase 8

Date: 2026-08-15

## Export and automated comparison

The generated OpenAPI 3.1 document was exported at runtime from
`GET /v3/api-docs`. `OpenApiContractIntegrationTest` compares the generated
document with `contracts/api.md` and verifies:

- 38 required path templates exist;
- 53 required method/path operations exist;
- public listing, project and location discovery operations are present;
- seller lifecycle and image operations are present;
- paginated favorites use `/api/v1/saved-listings`;
- moderation plus category, project and location admin CRUD operations are present.

## Phase 8 behavior verification

- `SavedListingIntegrationTest` verifies authentication, pagination,
  idempotent duplicate saves, deletion and rejection of expired/PENDING listings.
- `LocationControllerIntegrationTest` verifies anonymous access, hierarchy,
  pagination and missing-parent handling.
- `AdminMasterDataIntegrationTest` verifies category/project/location CRUD,
  validation, unique slug/code conflicts, relationship validation and ADMIN-only
  mutation access.
- Full `mvnw.cmd verify`: 62 tests, 0 failures, 0 errors, 0 skipped.

## Intentional clarifications

- Location result sets accept `page` and `size`, making the global pagination
  rule explicit even though the original location table omitted the parameters.
- Duplicate favorite POST is idempotent and keeps one database row rather than
  returning a conflict.
- `/seller/**` remains SELLER-only. Although an earlier contract table said
  SELLER/ADMIN, the contract security matrix explicitly says ADMIN must use its
  own moderation/master-data workflow rather than silently editing seller data.

## Result

No Phase 1–8 contract endpoint is missing or deferred. The three clarifications
above are documented behavior rather than unimplemented gaps.
