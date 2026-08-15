# API Gap Analysis — T002

**Recorded**: 2026-08-12  
**Contract compared**: `contracts/api.md`  
**Implementation inspected**: controllers and security configuration under `backend/src/main/java/com/batdongsan/`

## Summary

- Contract operations: 32 (CRUD groups expanded to current required operations).
- Exact contract matches: 6.
- Implemented with a different method/path or incomplete behavior: 12.
- Missing: 14.
- Additional legacy endpoints outside the contract: 4.

## Authentication and profile

| Contract | Status | Current implementation / gap |
|---|---|---|
| `POST /auth/register` | Exact | Implemented in `AuthController` |
| `POST /auth/login` | Partial | Exists but returns access token only; no refresh token |
| `POST /auth/refresh` | Missing | No RefreshToken model/service/endpoint |
| `POST /auth/logout` | Missing | No server-side session revocation |
| `PUT /auth/password` | Partial | Exists but does not revoke existing sessions |
| `GET /users/me` | Missing | No UserController/profile service |
| `PUT /users/me` | Missing | No profile update endpoint |
| `POST /users/me/upgrade-seller` | Missing | USER cannot become SELLER through API |

## Public discovery

| Contract | Status | Current implementation / gap |
|---|---|---|
| `GET /listings` | Partial | Pagination and basic filters exist; keyword, ward, bedrooms, map bounds and sort whitelist are missing |
| `GET /listings/{publicCode}` | Partial | Uses database numeric `id`, not public code; only ACTIVE access is enforced |
| `GET /projects` | Partial | Paginated but project filters are missing; returns JPA entity |
| `GET /projects/{slug}` | Partial | Uses numeric `id`, returns JPA entity, no associated active-listing DTO |
| `GET /locations/provinces` | Missing | Repository exists but no public controller/service |
| `GET /locations/provinces/{id}/districts` | Missing | No public location endpoint |
| `GET /locations/districts/{id}/wards` | Missing | Ward model does not exist |

## Seller listing management

| Contract | Status | Current implementation / gap |
|---|---|---|
| `POST /seller/listings` | Partial | Legacy `POST /listings`; any authenticated role can call it; creates PENDING rather than DRAFT |
| `GET /seller/listings` | Missing | No paginated “my listings” endpoint |
| `GET /seller/listings/{id}` | Missing | No owner management-detail endpoint |
| `PUT /seller/listings/{id}` | Partial | Legacy `PUT /listings/{id}` checks ownership but has no optimistic version field |
| `DELETE /seller/listings/{id}` | Partial | Legacy `DELETE /listings/{id}` checks ownership |
| `POST /seller/listings/{id}/submit` | Missing | No DRAFT/submit workflow |
| `POST /seller/listings/{id}/deactivate` | Missing | No explicit deactivate operation |
| `POST /seller/listings/{id}/images` | Partial | Legacy `POST /listings/upload` is not bound to listing/owner and does not enforce 10-image total |
| `DELETE /seller/listings/{id}/images/{imageId}` | Missing | No image deletion workflow |

## Favorites

| Contract | Status | Current implementation / gap |
|---|---|---|
| `GET /saved-listings` | Partial | Legacy `GET /listings/saved`; not paginated |
| `POST /saved-listings/{listingId}` | Partial | Legacy `POST /listings/{id}/save` |
| `DELETE /saved-listings/{listingId}` | Partial | Legacy `DELETE /listings/{id}/save` |

## Admin

| Contract | Status | Current implementation / gap |
|---|---|---|
| `GET /admin/listings?status=PENDING` | Missing | No moderation queue/listing query |
| `POST /admin/listings/{id}/approve` | Partial | Implemented as `PUT`; no approver/published/expires/history fields |
| `POST /admin/listings/{id}/reject` | Partial | Implemented as `PUT`; request has no required rejection reason |
| `GET /admin/users` | Missing | No paginated user management query |
| `POST /admin/users/{id}/ban` | Partial | Implemented as `PUT`; no reason and no refresh-token revocation |
| `POST /admin/users/{id}/unban` | Partial | Implemented as `PUT` |
| Category CRUD | Partial | Create/update/delete exist; no list/detail endpoints, DTO or validation; entity accepted directly |
| Project CRUD | Missing | Admin cannot manage projects |
| Location CRUD | Missing | Admin cannot manage provinces/districts/wards |

## Additional legacy endpoints

- `POST /api/v1/listings/upload`
- `POST /api/v1/listings/{id}/save`
- `DELETE /api/v1/listings/{id}/save`
- `GET /api/v1/listings/saved`

These should remain only until replacement clients migrate, or be removed before frontend development begins.

## Cross-cutting contract gaps

1. Controllers use field injection and sometimes contain manual validation/business rules.
2. Create operations generally return HTTP 200 instead of 201; delete/update semantics are not consistently RESTful.
3. Project and admin category APIs expose JPA entities directly.
4. No OpenAPI dependency/configuration exists yet.
5. No optimistic locking or HTTP 409 mapping exists.
6. Access control does not currently restrict listing creation to SELLER/ADMIN.
7. No refresh-token revocation exists, so the contract's logout and ban-session behavior cannot be met.
8. No Ward, public listing code, moderation history or rejection-reason model exists.

## Recommended implementation order

Follow `tasks.md`: migrations/foundation → identity/profile → seller lifecycle → moderation → public search → projects/favorites. Do not create isolated endpoints before their underlying state and authorization rules exist.
