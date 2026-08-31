# Feature Specification: Two-Level Production Addresses

**Feature Branch**: `007-two-level-addresses`

**Created**: 2026-08-30

**Updated**: 2026-08-31

**Status**: Approved for planning

**Input**: Replace HomiGO's empty legacy province-district-ward catalog with the current two-level Vietnamese administrative model and verified production reference data. Do not create demo business data.

## Scope Decision

The restored production database has no listings or projects. This feature therefore uses a clean cutover rather than preserving or translating legacy addresses.

- The cutover is allowed only while both business tables are empty.
- If either table contains a row, the cutover must stop before changing the schema.
- The legacy location catalog and legacy address columns are removed after that check succeeds.
- There is no legacy address mapping, review queue, dual-read period, or district compatibility layer in this feature.
- Real users, projects, listings, prices, payments, and analytics are created only through normal production workflows after cutover.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Perform a Safe Empty-Database Cutover (Priority: P1)

As an operator, I can replace the unused three-level address schema with the two-level schema only while no listing or project exists, so the deployment cannot silently destroy production business records.

**Why this priority**: The schema must be correct before production data begins to accumulate, and the destructive operation needs an unambiguous safety gate.

**Independent Test**: Run the cutover against one database containing a listing or project and verify it aborts without dropping anything; run it against an empty business database and verify the legacy location structures are removed and the two-level structures are created.

**Acceptance Scenarios**:

1. **Given** at least one listing or project exists, **When** the cutover starts, **Then** it fails before any legacy table, column, key, or index is changed.
2. **Given** listings and projects are both empty, **When** the cutover runs, **Then** the legacy `districts` and `wards` tables and legacy address columns are removed and the two-level schema is created.
3. **Given** an empty database has completed the cutover, **When** the operator starts the new application, **Then** schema validation succeeds and no district dependency remains in the active application model.

---

### User Story 2 - Validate and Activate Verified Production Reference Data (Priority: P1)

As an administrator, I can validate and activate the pinned official 2025-07-01 administrative snapshot and the approved 16-category catalog before the public application uses them.

**Why this priority**: An empty schema is not production-ready until its source, checksum, counts, relationships, and reference choices are verified.

**Independent Test**: Validate the bundled artifacts, inspect their provenance and validation result, activate them, and verify exactly 34 province-level units, 3,321 commune-level units, and 16 categories are active while all business tables remain empty.

**Acceptance Scenarios**:

1. **Given** the pinned official artifact is present, **When** an administrator validates it, **Then** the system verifies its checksum, source identity, effective date, codes, names, types, parent relationships, and declared counts without exposing it publicly.
2. **Given** a release passed validation, **When** an administrator explicitly activates it, **Then** it becomes the single active public administrative catalog.
3. **Given** the approved category artifact passed validation, **When** an administrator activates it, **Then** exactly 16 production categories are available without creating a user, project, listing, price, payment, view, or analytics record.
4. **Given** the same artifact and checksum were already validated or activated, **When** the operation is repeated, **Then** it is idempotent and creates no duplicate rows.

---

### User Story 3 - Create Listings and Projects with Current Addresses (Priority: P2)

As a seller or administrator, I can select a province/city and a directly subordinate ward, commune, or special zone when entering a listing or project.

**Why this priority**: New business records must use the current administrative structure from their first production write.

**Independent Test**: Create a seller listing and an administrator project with a valid active province/commune-level pair and verify that neither the request, stored record, nor response contains a district requirement.

**Acceptance Scenarios**:

1. **Given** an active catalog, **When** a province is selected, **Then** only active commune-level units belonging to that province are offered.
2. **Given** a valid active province and commune-level unit, **When** a listing is saved, **Then** the address is accepted without a district.
3. **Given** a commune-level unit from another province or an inactive unit, **When** a listing or project is submitted, **Then** the request is rejected with a Vietnamese validation message.

---

### User Story 4 - Discover Properties by Two-Level Address (Priority: P3)

As a public visitor, I can filter listings and projects by province and commune-level unit and see the current two-level address consistently.

**Why this priority**: Buyers and renters must discover properties through the same current catalog used for entry.

**Independent Test**: Publish records in different provinces and commune-level units, filter by each location, and verify cards and detail pages show commune-level unit plus province without a district.

**Acceptance Scenarios**:

1. **Given** active listings exist in multiple provinces, **When** a visitor filters by province, **Then** only matching listings are returned.
2. **Given** a province is selected, **When** a visitor additionally filters by commune-level unit, **Then** only records in that unit are returned.
3. **Given** a listing or project is displayed, **When** the user reads its location, **Then** the structured address contains commune-level unit and province and no district label.

## Edge Cases

- The preflight finds listings but no projects, or projects but no listings.
- A source artifact has the expected row count but duplicate codes, an orphaned commune-level unit, an invalid type, or a checksum mismatch.
- A commune, ward, or special zone name is duplicated in different provinces.
- Validation succeeds but activation is attempted by a non-administrator.
- Two administrators attempt to activate the same release concurrently.
- The same release version is presented with a different checksum.
- Activation is repeated after a network retry.
- A province change leaves a stale commune-level selection in a form or URL.
- An operator tries to run an older application binary after destructive V10 has succeeded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST model property addresses as exactly two administrative levels: province-level unit and directly subordinate commune-level unit.
- **FR-002**: Commune-level unit types MUST support `WARD`, `COMMUNE`, and `SPECIAL_ZONE` without a district.
- **FR-003**: Existing Flyway migrations V1 through V9 MUST remain immutable.
- **FR-004**: V10 MUST check both `listings` and `projects` before any destructive schema action and MUST abort if either contains a row.
- **FR-005**: After the preflight succeeds, V10 MUST remove the legacy `provinces`, `districts`, and `wards` structures, remove `district_id` and legacy `ward_id` from listings/projects, and create clean `administrative_provinces`/`commune_units` structures and foreign keys.
- **FR-006**: The successful cutover MUST leave no active legacy address table, field, endpoint, request property, response property, filter, or selector.
- **FR-007**: The administrative artifact MUST be pinned as release `vn-administrative-units-2025-07-01`, effective 2025-07-01, with its official source references and SHA-256 checksum recorded.
- **FR-008**: Validation MUST require exactly 34 province-level units and 3,321 commune-level units, including the declared type counts, unique official codes, valid Unicode names, and a valid parent for every commune-level unit.
- **FR-009**: Official codes MUST be stored and serialized as strings so leading zeroes are preserved.
- **FR-010**: Dataset validation and activation MUST be separate ADMIN-only operations, and validation MUST NOT make an artifact public.
- **FR-011**: Exactly one validated administrative release MUST be active at a time; repeated activation of the same version and checksum MUST be idempotent.
- **FR-012**: A reused release version with a different checksum MUST be rejected visibly and MUST NOT change the active catalog.
- **FR-013**: The production category artifact MUST contain exactly 16 documented buy/rent classifications with stable unique slugs.
- **FR-014**: Category validation and activation MUST be ADMIN-only and idempotent; a conflicting existing slug MUST fail rather than be silently redefined.
- **FR-015**: Reference-data validation or activation MUST NOT create users, credentials, projects, listings, images, saved listings, notifications, payments, AI usage, views, or analytics.
- **FR-016**: Listing and project creation/editing MUST require a valid active province and active commune-level unit belonging to that province.
- **FR-017**: Public listing and project search MUST support province and commune-level filters without district parameters.
- **FR-018**: Public, account, seller, and admin listing/project displays MUST use the two-level address consistently.
- **FR-019**: Location and administrative collection APIs MUST be paginated; dependent selectors MUST fetch enough pages to present the complete selected-province result set.
- **FR-020**: Public and seller users MAY read the active catalog but MUST NOT validate, activate, replace, or directly mutate reference data.
- **FR-021**: Deployment documentation MUST state that V10 is one-way: an application downgrade cannot restore dropped schema, and recovery requires restoring a pre-V10 backup or recreating the empty database and rerunning migrations and ADMIN activation.

### Production Category Catalog

The approved catalog contains eight buy and eight rent classifications:

| Transaction | Slug | Display name |
|---|---|---|
| BUY | `ban-can-ho` | Bán căn hộ |
| BUY | `ban-nha-rieng` | Bán nhà riêng |
| BUY | `ban-nha-mat-pho` | Bán nhà mặt phố |
| BUY | `ban-biet-thu` | Bán biệt thự |
| BUY | `ban-dat-nen` | Bán đất nền |
| BUY | `ban-dat` | Bán đất |
| BUY | `ban-kho-xuong` | Bán kho, nhà xưởng |
| BUY | `ban-bat-dong-san-khac` | Bán bất động sản khác |
| RENT | `thue-can-ho` | Cho thuê căn hộ |
| RENT | `thue-nha-rieng` | Cho thuê nhà riêng |
| RENT | `thue-nha-mat-pho` | Cho thuê nhà mặt phố |
| RENT | `thue-phong-tro` | Cho thuê phòng trọ |
| RENT | `thue-van-phong` | Cho thuê văn phòng |
| RENT | `thue-kho-xuong` | Cho thuê kho, nhà xưởng |
| RENT | `thue-mat-bang` | Cho thuê mặt bằng |
| RENT | `thue-bat-dong-san-khac` | Cho thuê bất động sản khác |

### Key Entities

- **Administrative Dataset Release**: Immutable version, source, effective date, checksum, expected counts, validation result, and activation state for a pinned catalog.
- **Province-Level Unit**: An official province or centrally governed city in one release.
- **Commune-Level Unit**: An official ward, commune, or special zone directly belonging to one province-level unit.
- **Administrative Catalog State**: The singleton pointer to the release currently exposed by public APIs and new business writes.
- **Production Category Release**: Immutable identity/checksum and validation/activation state for the 16-category artifact.
- **Production Category**: A stable buy or rent classification; it is reference data, not a fabricated listing.
- **Listing Address / Project Address**: Required province and commune-level associations plus free-form street/address text.

## Success Criteria *(mandatory)*

- **SC-001**: A cutover attempt against any database with a listing or project changes zero schema objects and reports a clear failure.
- **SC-002**: A successful empty-database cutover leaves zero district tables/columns and passes schema validation.
- **SC-003**: The active production catalog exposes exactly 34 provinces and 3,321 commune-level units with zero duplicate official codes and zero orphaned units.
- **SC-004**: The active production category catalog exposes exactly 16 approved slugs with an 8 BUY / 8 RENT split.
- **SC-005**: Revalidating or reactivating the same artifacts leaves all reference-data counts unchanged.
- **SC-006**: Reference-data setup creates zero fabricated business, authentication, payment, or analytics rows.
- **SC-007**: 100% of listing and project create/edit journeys complete without a district field.
- **SC-008**: Province and commune-level filters return only matching active records in all acceptance-test datasets.
- **SC-009**: Commune-level choices for a selected province are available within 2 seconds under normal production conditions.
- **SC-010**: Critical desktop and mobile listing, project, seller, and admin journeys pass after district controls are removed.

## Assumptions

- The production database is currently disposable with respect to business content: `listings = 0` and `projects = 0` at cutover time.
- V10 itself is the final authority; an operator statement that the database is empty does not bypass its preflight.
- A database that fails preflight is outside this clean-cutover scope and requires a new migration plan before retrying.
- The approved official snapshot is Quyết định 19/2025/QĐ-TTg, effective 2025-07-01, normalized into a reviewed immutable artifact.
- Real projects and listings are entered later by authorized users or a separately verified import; that sourcing is outside this feature.
- A pre-V10 database backup is taken for operational recovery even though the business tables are expected to be empty.
