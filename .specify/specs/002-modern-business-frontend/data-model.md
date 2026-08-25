# Frontend Data Model: HomiGO Modern Business Frontend

Frontend types mirror API DTOs but remain separate from view models. Monetary values are received as JSON numbers and formatted only at presentation boundaries.

## Shared envelopes

### ApiResponse<T>

`success: boolean`, `data: T`, `message: string`, `errorCode: string | null`.

### PageResponse<T>

`content: T[]`, `number: number`, `size: number`, `totalElements: number`, `totalPages: number`, `numberOfElements: number`, `first: boolean`, `last: boolean`, `empty: boolean`.

The frontend must not expect Spring `pageable` or `sort` internals.

## Session and identity

### UserRole

`USER | SELLER | ADMIN`.

### UserStatus

`ACTIVE | BANNED`.

### SessionUser

`id`, `name`, `email`, `role`.

### SessionState

`user: SessionUser | null`, `accessToken: string | null`, `refreshToken: string | null`, `status: restoring | authenticated | anonymous`.

Transitions:

```text
anonymous -> authenticated       login succeeds
restoring -> authenticated       refresh succeeds
restoring -> anonymous           no refresh token or refresh fails
authenticated -> anonymous       logout, ban, revoked/expired refresh
USER -> SELLER                   seller upgrade succeeds
```

### UserProfile

`id`, `name`, `email`, `phone?`, `role`, `status`, `createdAt`.

Validation: name required, phone follows backend range/pattern, email is read-only unless contract later permits editing.

## Listing

### ListingStatus

`DRAFT | PENDING | ACTIVE | REJECTED | INACTIVE | EXPIRED`.

### Listing

- Identity: `id`, `publicCode`, `userId`, `version`.
- Classification: `categoryName`, `projectName?`.
- Location: `provinceName`, `districtName`, `wardName?`, `address`, `latitude?`, `longitude?`.
- Content: `title`, `description`, `images[]`.
- Pricing: `price`, `area`.
- Attributes: `bedrooms?`, `bathrooms?`, `floors?`, `direction?`, `furnishing?`, `legalStatus?`.
- Contact: `contactName`, `contactPhone`.
- Lifecycle: `status`, `rejectionReason?`, `createdAt`, `updatedAt`, `publishedAt?`, `expiresAt?`.

Public routes use `publicCode`; seller/admin mutations use numeric `id`.

### ListingFormValues

`categoryId`, `districtId`, `wardId?`, `projectId?`, `title`, `description`, `price`, `area`, `address`, `latitude?`, `longitude?`, `bedrooms?`, `bathrooms?`, `floors?`, `direction?`, `furnishing?`, `legalStatus?`, `contactName`, `contactPhone`, `version?`.

Validation mirrors backend limits: positive price/area; max title 200; max description 10,000; valid coordinate ranges; phone format; numeric optional attributes non-negative.

### ListingImageDraft

`clientId`, `file?`, `url`, `name`, `contentType`, `size`, `status: local | uploading | uploaded | failed`, `error?`.

Maximum 10 images. Accepted MIME types: JPEG, PNG, WebP. Maximum size: 5 MB each.

### ListingSearchState

`keyword?`, `transactionType?`, `provinceId?`, `districtId?`, `wardId?`, `categoryId?`, `projectId?`, `minPrice?`, `maxPrice?`, `minArea?`, `maxArea?`, `bedrooms?`, `minLat?`, `maxLat?`, `minLng?`, `maxLng?`, `sort`, `page`, `size`.

`sort` is one of `newest | priceAsc | priceDesc | areaAsc | areaDesc`. Updating any filter resets `page` to 0.

## Location

### ProvinceOption

`id`, `name`.

### DistrictOption

`id`, `provinceId`, `name`.

### WardOption

`id`, `districtId`, `name`, `code`.

Dependent transition: changing province clears district and ward; changing district clears ward. Existing invalid combinations are never submitted.

## Project

### ProjectStatus

`PLANNING | IN_PROGRESS | COMPLETED | ON_HOLD`.

### ProjectSummary

`id`, `name`, `slug`, `investor`, `districtId`, `districtName`, `wardId?`, `wardName?`, `address`, `status`, `priceFrom?`, `priceTo?`, `updatedAt`.

### ProjectDetail

Extends ProjectSummary with `description`, `latitude?`, `longitude?`, `listings: PageResponse<Listing>`.

### ProjectSearchState

`keyword?`, `districtId?`, `status?`, `page`, `size`.

## Favorites

### SavedListingState

`savedIds: Set<number>`, `pendingIds: Set<number>` in memory, derived from paginated saved listings and mutations.

Save is idempotent. Unauthenticated users are redirected to login with the current destination preserved.

## Admin

### ModerationItem

`id`, `publicCode`, `title`, `sellerId`, `sellerEmail`, `status`, `rejectionReason?`, `createdAt`, `approvedAt?`, `publishedAt?`, `expiresAt?`, `version`.

### AdminUser

`id`, `name`, `email`, `phone?`, `role`, `status`, `createdAt`.

### MasterDataRow

Discriminated forms for Category, Project, Province, District and Ward. Delete operations require explicit confirmation; 409 conflicts keep the dialog open and offer reload.

## View-only models

### ToastMessage

`id`, `type: success | error | warning | info`, `title`, `description?`, `duration?`.

### ApiFieldErrors

Map of field name to Vietnamese message, populated from validation response data when available.
