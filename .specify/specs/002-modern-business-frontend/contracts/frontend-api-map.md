# Frontend-to-Backend API Map

All functions return unwrapped typed `data` or throw a normalized `ApiError`. Base URL comes from `VITE_API_BASE_URL` and ends at `/api/v1`.

## Auth and account

| Frontend operation | Backend request | Notes |
|---|---|---|
| `register(input)` | `POST /auth/register` | Does not assume automatic login |
| `login(input)` | `POST /auth/login` | Reads `accessToken`, `refreshToken`, `user` |
| `refresh(refreshToken)` | `POST /auth/refresh` | Rotation replaces both tokens |
| `logout(refreshToken)` | `POST /auth/logout` | Local cleanup runs even if remote revoke fails |
| `changePassword(input)` | `PUT /auth/password` | Clears old session after success if required |
| `getProfile()` | `GET /users/me` | Authenticated |
| `updateProfile(input)` | `PUT /users/me` | Authenticated |
| `createSellerUpgradeCheckout()` | `POST /payments/sepay/seller-upgrade` | USER only; submit signed form to SePay Sandbox |
| `getSellerUpgradePayment(orderCode)` | `GET /payments/sepay/seller-upgrade/{orderCode}` | Owner polling after browser callback; refresh session only after SUCCESS |

## Public listing discovery

| Frontend operation | Backend request |
|---|---|
| `searchListings(params)` | `GET /listings` with supported query parameters |
| `getListing(publicCode)` | `GET /listings/{publicCode}` |

Public route links must use `publicCode`, not `id`.

## Projects and locations

| Frontend operation | Backend request |
|---|---|
| `searchProjects(params)` | `GET /projects` |
| `getProject(slug, page)` | `GET /projects/{slug}` |
| `getProvinces(page)` | `GET /locations/provinces` |
| `getDistricts(provinceId, page)` | `GET /locations/provinces/{provinceId}/districts` |
| `getWards(districtId, page)` | `GET /locations/districts/{districtId}/wards` |

Required backend dependency: add a public read-only categories endpoint before category selectors are considered complete.

## Saved listings

| Frontend operation | Backend request |
|---|---|
| `getSavedListings(page)` | `GET /saved-listings` |
| `saveListing(listingId)` | `POST /saved-listings/{listingId}` |
| `removeSavedListing(listingId)` | `DELETE /saved-listings/{listingId}` |

## Seller listings

| Frontend operation | Backend request |
|---|---|
| `getMyListings(page)` | `GET /seller/listings` |
| `getOwnedListing(id)` | `GET /seller/listings/{id}` |
| `createDraft(input)` | `POST /seller/listings` |
| `updateListing(id, input)` | `PUT /seller/listings/{id}` with `version` |
| `deleteListing(id)` | `DELETE /seller/listings/{id}` |
| `submitListing(id)` | `POST /seller/listings/{id}/submit` |
| `deactivateListing(id)` | `POST /seller/listings/{id}/deactivate` |
| `uploadImage(id, file)` | `POST /seller/listings/{id}/images` multipart; returns `{id,url,contentType,sizeBytes,sortOrder}` |
| `deleteImage(id, imageId)` | `DELETE /seller/listings/{id}/images/{imageId}` |

Frontend must create the DRAFT first because image operations require a listing ID.

## Admin

| Frontend operation | Backend request |
|---|---|
| `getModerationQueue(status, page)` | `GET /admin/listings` |
| `approveListing(id)` | `POST /admin/listings/{id}/approve` |
| `rejectListing(id, reason)` | `POST /admin/listings/{id}/reject` |
| `getUsers(page)` | `GET /admin/users` |
| `banUser(id, reason)` | `POST /admin/users/{id}/ban` |
| `unbanUser(id)` | `POST /admin/users/{id}/unban` |
| Category CRUD | `/admin/categories[/{id}]` |
| Project CRUD | `/admin/projects[/{id}]` |
| Province CRUD | `/admin/locations/provinces[/{id}]` |
| District CRUD | `/admin/locations/districts[/{id}]` |
| Ward CRUD | `/admin/locations/wards[/{id}]` |

## Error contract

- `400`: show field errors when response data is a field map; otherwise show request message.
- `401`: attempt one refresh only when the failed request is not auth/refresh; then logout and redirect.
- `403`: keep session and show access-denied page/toast.
- `404`: show domain not-found or route not-found presentation.
- `409`: show conflict message and offer reload; never overwrite silently.
- `413`: show image size error next to uploader.
- `500`/network: show safe Vietnamese message with retry where operation is idempotent.
