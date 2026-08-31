# Data Model: Two-Level Production Addresses

## Relationship Overview

```text
administrative_dataset_releases (1) ──── (*) administrative_provinces (1) ──── (*) commune_units
               │
               └──── administrative_catalog_state (singleton active release)

administrative_provinces (1) ──── (*) listings (*) ──── (1) commune_units
administrative_provinces (1) ──── (*) projects (*) ──── (1) commune_units

production_category_releases (1) ──── (*) production_category_release_members (*) ──── (1) categories
               │
               └──── production_category_catalog_state (singleton active release)
```

There is no `districts`, legacy `wards`, legacy address-review, mapping, or dual-address entity after V10 succeeds.

## 1. `administrative_dataset_releases`

Immutable provenance and state for one normalized official snapshot.

| Field | Type | Rules |
|---|---|---|
| `id` | BIGINT | Primary key, auto increment |
| `dataset_version` | VARCHAR(100) | Required, unique |
| `authority` | VARCHAR(255) | Required |
| `document_number` | VARCHAR(100) | Required |
| `effective_date` | DATE | Required |
| `retrieved_at` | DATETIME(6) | Required |
| `source_urls_json` | JSON | Required; official URLs |
| `attribution` | VARCHAR(500) | Required |
| `raw_sha256` | CHAR(64) | Required lowercase hexadecimal |
| `normalized_sha256` | CHAR(64) | Required lowercase hexadecimal |
| `transform_version` | VARCHAR(100) | Required |
| `expected_province_count` | INT | Required; 34 for initial release |
| `expected_commune_count` | INT | Required; 3,321 for initial release |
| `actual_province_count` | INT | Nullable until validation |
| `actual_commune_count` | INT | Nullable until validation |
| `status` | VARCHAR(20) | `STAGED`, `VALIDATED`, `ACTIVE`, `FAILED`, `SUPERSEDED` |
| `validation_summary_json` | JSON | Safe counts/sentinels/errors; required after validation |
| `validated_by`, `activated_by` | BIGINT | Nullable FK `users(id)` |
| `created_at`, `validated_at`, `activated_at` | DATETIME(6) | Audit timestamps |
| `version` | BIGINT | Required optimistic lock |

Rules:

- Release identity is `dataset_version`; content identity is `normalized_sha256`.
- A validated artifact is immutable.
- Same version/checksum is idempotent; same version/different checksum is a conflict.
- Failed validation cannot create an active pointer.

### State transitions

```text
STAGED ──valid ADMIN validation──> VALIDATED ──ADMIN activation──> ACTIVE
   └────validation failure───────> FAILED
ACTIVE ──new release activation──> SUPERSEDED
```

## 2. `administrative_catalog_state`

Singleton active-release pointer.

| Field | Type | Rules |
|---|---|---|
| `singleton_key` | TINYINT | PK, fixed `1` |
| `active_release_id` | BIGINT | Nullable before first activation; FK release |
| `updated_by` | BIGINT | Nullable FK `users(id)` |
| `updated_at` | DATETIME(6) | Required |
| `version` | BIGINT | Required optimistic lock |

Activation locks this row, confirms the target is `VALIDATED` or already `ACTIVE`, supersedes the previous release when different, updates the pointer, and commits once.

## 3. `administrative_provinces`

This is a new release-aware table; old `provinces` IDs and district relationships are intentionally discarded after the empty-business preflight.

| Field | Type | Rules |
|---|---|---|
| `id` | BIGINT | Primary key, auto increment; internal only |
| `dataset_release_id` | BIGINT | Required FK release |
| `official_code` | VARCHAR(10) | Required string |
| `official_name` | VARCHAR(255) | Required Unicode |
| `unit_type` | VARCHAR(30) | `PROVINCE`, `CENTRAL_MUNICIPALITY` |
| `effective_from` | DATE | Required |
| `created_at` | DATETIME(6) | Required |

Constraints/indexes:

- Unique `(dataset_release_id, official_code)`.
- Unique `(id, dataset_release_id)`.
- Index `(dataset_release_id, official_name, id)` for active-release browse.

## 4. `commune_units`

Official commune-level unit directly under a province in the same release.

| Field | Type | Rules |
|---|---|---|
| `id` | BIGINT | Primary key, auto increment; internal only |
| `dataset_release_id` | BIGINT | Required FK release |
| `administrative_province_id` | BIGINT | Required FK administrative province |
| `official_code` | VARCHAR(10) | Required string |
| `official_name` | VARCHAR(255) | Required Unicode |
| `unit_type` | VARCHAR(30) | `WARD`, `COMMUNE`, `SPECIAL_ZONE` |
| `effective_from` | DATE | Required |
| `created_at` | DATETIME(6) | Required |

Constraints/indexes:

- Unique `(dataset_release_id, official_code)`.
- Unique `(id, administrative_province_id)` for business composite foreign keys.
- Composite FK `(administrative_province_id, dataset_release_id)` references an administrative province in the same release.
- Index `(administrative_province_id, official_name, id)` for dependent selectors.

No relationship is inferred from an official-code prefix.

## 5. Listing and Project Addresses

After V10, both `listings` and `projects` contain:

| Field | Type | Rules |
|---|---|---|
| `administrative_province_id` | BIGINT | Required FK `administrative_provinces(id)` |
| `commune_unit_id` | BIGINT | Required FK `commune_units(id)` |
| `address` | VARCHAR(500) | Existing required free-form street/address text |

Removed from both tables:

- `district_id`
- legacy `ward_id`

Constraints/indexes:

- Composite FK `(commune_unit_id, administrative_province_id)` → `commune_units(id, administrative_province_id)`.
- Listings indexes `(administrative_province_id, status)` and `(commune_unit_id, status)`.
- Projects indexes `(administrative_province_id, status)` and `(commune_unit_id, status)`.
- New writes also require both units to belong to the currently active release; this dynamic rule is enforced in services.

V10 can add these columns as `NOT NULL` because it aborts unless both tables are empty.

## 6. `production_category_releases`

Immutable validation/activation state for the separate 16-category artifact.

| Field | Type | Rules |
|---|---|---|
| `id` | BIGINT | Primary key |
| `catalog_version` | VARCHAR(100) | Required, unique; initial `categories-v1` |
| `normalized_sha256` | CHAR(64) | Required |
| `expected_category_count` | INT | Required; 16 |
| `actual_category_count` | INT | Nullable until validation |
| `status` | VARCHAR(20) | `STAGED`, `VALIDATED`, `ACTIVE`, `FAILED`, `SUPERSEDED` |
| `validation_summary_json` | JSON | Required after validation |
| `validated_by`, `activated_by` | BIGINT | Nullable FK users |
| `created_at`, `validated_at`, `activated_at` | DATETIME(6) | Audit timestamps |
| `version` | BIGINT | Optimistic lock |

It follows the same state and checksum/idempotency rules as administrative releases.

## 7. Category Membership

The existing `categories` table remains the stable slug identity used by listings. Add:

### `production_category_release_members`

| Field | Type | Rules |
|---|---|---|
| `release_id` | BIGINT | Required FK category release |
| `category_id` | BIGINT | Required FK category |
| `sort_order` | INT | Required, unique within release |

Primary key: `(release_id, category_id)`.

### `production_category_catalog_state`

Singleton pointer equivalent to `administrative_catalog_state` with `active_release_id`, ADMIN actor, timestamp, and optimistic version.

Rules:

- Initial active release has exactly 16 members: 8 BUY and 8 RENT.
- Slug remains globally unique in `categories`.
- Same slug/name/type is reusable across releases; conflicting meaning fails validation/activation.
- Public selectors return only members of the active category release.
- Existing categories not in the active release are not offered for new writes.

## 8. Non-Persistent API Models

`ProvinceOption`:

```text
code, name, type, effectiveFrom, sourceVersion
```

`CommuneUnitOption`:

```text
code, provinceCode, name, type, effectiveFrom, sourceVersion
```

Listing/project address request:

```text
provinceCode, communeCode, address
```

Listing/project response:

```text
provinceCode, provinceName, communeCode, communeName, communeType, address
```

Official codes are always JSON strings. No district property exists.

## 9. Validation Invariants

1. Initial administrative release has exactly 34 provinces and 3,321 commune-level units.
2. Initial type counts are exactly 2,621 communes, 687 wards, and 13 special zones.
3. Each commune-level code is unique within its release and has exactly one parent in that release.
4. Active-release API queries return only rows belonging to the active release.
5. Every listing/project province/commune pair is parent-consistent and belongs to the active release when created or edited.
6. Initial category release has exactly 16 members with an 8 BUY / 8 RENT split and the slugs in `spec.md`.
7. Repeated validation/activation of unchanged artifacts does not alter row counts.
8. Reference-data operations do not insert any authentication, project, listing, payment, view, or analytics row.
9. After successful V10, `districts`, legacy `wards`, `district_id`, and legacy `ward_id` do not exist.

## 10. V10 Preflight and One-Way Boundary

V10 reads both business counts before DDL:

```text
eligible = listings_count == 0 AND projects_count == 0
```

- If false: throw, leave V9 schema intact, and require a different preservation plan.
- If true: perform the destructive cutover in documented dependency order.
- MySQL DDL is not treated as transactionally reversible.
- Recovery after success is backup restore or full disposable-database recreation followed by migrations and ADMIN activation.
