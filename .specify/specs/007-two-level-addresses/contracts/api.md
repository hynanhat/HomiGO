# REST API Contract: Two-Level Production Addresses

Base path: `/api/v1`.

All success responses use the existing envelope:

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```

Errors use:

```json
{
  "success": false,
  "data": null,
  "message": "Vietnamese user-facing message",
  "errorCode": "STABLE_CODE"
}
```

Collection data uses the existing `PageResponse`: `content`, `number`, `size`, `totalElements`, `totalPages`, `numberOfElements`, `first`, `last`, and `empty`.

Official administrative codes are JSON strings.

## Public Active Catalog

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/locations/provinces` | Public | Page through provinces in the active release |
| GET | `/locations/provinces/{provinceCode}/commune-units` | Public | Page through commune-level units under an active province |

Both endpoints accept `page` and `size`; public results sort by Vietnamese display name then official code.

`GET /locations/provinces` item:

```json
{
  "code": "79",
  "name": "Thành phố Hồ Chí Minh",
  "type": "CENTRAL_MUNICIPALITY",
  "effectiveFrom": "2025-07-01",
  "sourceVersion": "vn-administrative-units-2025-07-01"
}
```

`GET /locations/provinces/79/commune-units` item:

```json
{
  "code": "26734",
  "provinceCode": "79",
  "name": "Phường Sài Gòn",
  "type": "WARD",
  "effectiveFrom": "2025-07-01",
  "sourceVersion": "vn-administrative-units-2025-07-01"
}
```

If no administrative release is active, return `503 ADMINISTRATIVE_CATALOG_UNAVAILABLE`. Unknown province code returns `404 RESOURCE_NOT_FOUND`.

There is no district endpoint.

## Listing Contract Changes

Create/update request requires:

```json
{
  "categoryId": 1,
  "provinceCode": "79",
  "communeCode": "26734",
  "address": "123 đường Nguyễn Huệ",
  "title": "...",
  "description": "...",
  "price": 5000000000,
  "area": 80,
  "contactName": "...",
  "contactPhone": "...",
  "version": 0
}
```

Create may omit `version`; update retains current optimistic-lock rules. Existing non-location fields are unchanged.

Listing response location:

```json
{
  "provinceCode": "79",
  "provinceName": "Thành phố Hồ Chí Minh",
  "communeCode": "26734",
  "communeName": "Phường Sài Gòn",
  "communeType": "WARD",
  "address": "123 đường Nguyễn Huệ"
}
```

`GET /listings` filters:

- `provinceCode`
- `communeCode`

If `communeCode` is present, `provinceCode` is required. The pair must be active and parent-consistent. Existing keyword, transaction, category, project, price, area, bedroom, map, sort, page, and size filters remain.

Removed contract fields/parameters: `districtId`, `districtName`, and legacy `wardId`/`wardName`.

## Project Contract Changes

Create/update request requires:

```json
{
  "name": "Tên dự án",
  "slug": "ten-du-an",
  "investor": "Chủ đầu tư",
  "provinceCode": "79",
  "communeCode": "26734",
  "address": "Địa chỉ chi tiết",
  "status": "IN_PROGRESS",
  "description": "..."
}
```

Existing coordinates and price-range fields remain unchanged.

Project summary/detail uses the same five structured location response fields as a listing: province code/name, commune code/name/type.

`GET /projects` accepts `provinceCode` and `communeCode`; commune requires province. Existing keyword, status, page, and size remain.

## AI Description Request

`POST /seller/ai/listing-description` replaces district/ward inputs with:

```json
{
  "keywords": "...",
  "categoryId": 1,
  "provinceCode": "79",
  "communeCode": "26734",
  "projectId": 12,
  "price": 5000000000,
  "area": 80
}
```

Before quota reservation/provider use, backend resolves the active province and commune names and rejects a mismatched, unknown, or inactive pair.

## ADMIN Administrative Dataset Workflow

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/admin/location-datasets` | ADMIN | Page release history/status/provenance |
| POST | `/admin/location-datasets/validate` | ADMIN | Validate a bundled immutable artifact |
| POST | `/admin/location-datasets/{releaseId}/activate` | ADMIN | Activate a validated release |
| GET | `/admin/location-catalog/provinces` | ADMIN | Page/search rows for an indicated or active release |
| GET | `/admin/location-catalog/commune-units` | ADMIN | Page/search commune rows by release/province/type |

Validate request:

```json
{
  "datasetVersion": "vn-administrative-units-2025-07-01"
}
```

Release response:

```json
{
  "id": 1,
  "datasetVersion": "vn-administrative-units-2025-07-01",
  "effectiveDate": "2025-07-01",
  "authority": "Cục Thống kê, Bộ Tài chính",
  "documentNumber": "19/2025/QĐ-TTg",
  "normalizedSha256": "<64 lowercase hexadecimal characters>",
  "expectedProvinceCount": 34,
  "actualProvinceCount": 34,
  "expectedCommuneCount": 3321,
  "actualCommuneCount": 3321,
  "status": "VALIDATED",
  "validationSummary": {
    "communeTypeCounts": {"COMMUNE": 2621, "WARD": 687, "SPECIAL_ZONE": 13},
    "duplicateCodes": 0,
    "orphanedUnits": 0,
    "sentinelsPassed": true
  }
}
```

Activation rules:

- Target must be `VALIDATED` or already be the active release.
- Activation is transactional and serializes concurrent pointer updates.
- Same active release returns success without duplicate rows.
- Activation of another validated release marks the previous one `SUPERSEDED`.
- Public catalog queries change only after commit.

Direct CRUD for an official province or commune-level unit is not exposed.

## ADMIN Category Dataset Workflow

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/admin/category-datasets` | ADMIN | Page category release history |
| POST | `/admin/category-datasets/validate` | ADMIN | Validate bundled `categories-v1` |
| POST | `/admin/category-datasets/{releaseId}/activate` | ADMIN | Activate validated 16-category release |

Validate request:

```json
{"catalogVersion": "categories-v1"}
```

Successful validation reports `actualCategoryCount: 16`, `buyCount: 8`, `rentCount: 8`, stable slugs, checksum, and status. Activation changes the active membership set; it does not create business rows.

## Error Semantics

| Condition | HTTP | Error code |
|---|---:|---|
| Unknown province/commune/category release | 404 | `RESOURCE_NOT_FOUND` |
| Commune not under province | 400 | `LOCATION_RELATION_INVALID` |
| No active administrative catalog | 503 | `ADMINISTRATIVE_CATALOG_UNAVAILABLE` |
| No active category catalog | 503 | `CATEGORY_CATALOG_UNAVAILABLE` |
| Artifact checksum/count/content invalid | 422 | `DATASET_VALIDATION_FAILED` |
| Version reused with different checksum | 409 | `DATASET_VERSION_CONFLICT` |
| Activate release not validated | 409 | `DATASET_STATE_CONFLICT` |
| Concurrent activation conflict | 409 | `CONFLICT` |
| Non-ADMIN dataset mutation | 403 | `ACCESS_DENIED` |
| Bean validation failure | 400 | `VALIDATION_ERROR` |

User-facing messages remain Vietnamese and never expose filesystem paths, raw artifact content, SQL, or stack traces.

## Removed API Surface

The following endpoints and properties are removed rather than redirected:

- `/locations/provinces/{provinceId}/districts`
- `/locations/districts/{districtId}/wards`
- `/admin/locations/districts` and `/admin/locations/districts/{id}`
- legacy province/ward direct CRUD
- every `districtId`, `districtName`, and legacy `wardId` location property

OpenAPI tests must assert the new paths exist and the retired paths do not.
