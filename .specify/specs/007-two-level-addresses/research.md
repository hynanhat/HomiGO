# Phase 0 Research: Two-Level Production Addresses

**Date**: 2026-08-31

**Scope**: Official Vietnamese administrative data, destructive empty-database cutover, source provenance, release activation, production categories, API identity, selector behavior, and recovery.

## 1. Official release baseline

**Decision**: Pin `vn-administrative-units-2025-07-01` to Quyết định 19/2025/QĐ-TTg, effective 2025-07-01.

**Rationale**: It is the agreed authoritative coding baseline for the two-level model: 34 province-level units and 3,321 commune-level units, comprising 2,621 communes, 687 wards, and 13 special zones.

**Controls**:

- Preserve province codes as two-character strings and commune-level codes as five-character strings.
- Use the source parent relationship; never infer province from a code prefix.
- Validate corrected Xã Ia Mơ, Gia Lai code `23938`; reject draft code `23737`.
- Preserve Vietnamese Unicode names and diacritics; names are display data, not identities.

**Sources**: [Quyết định 19/2025/QĐ-TTg](https://vanban.chinhphu.vn/?classid=0&docid=214409&pageid=27160), [signed PDF](https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/7/19ttg.signed.pdf), [Công báo publication](https://congbao.chinhphu.vn/van-ban/quyet-dinh-so-19-2025-qd-ttg-45430/57438.htm), [official consolidated list](https://xaydungchinhsach.chinhphu.vn/danh-sach-3321-don-vi-hanh-chinh-cap-xa-tai-34-tinh-thanh-sau-sap-xep-sap-nhap-119250710102358656.htm), [Ia Mơ correction](https://www.nso.gov.vn/wp-content/uploads/2025/06/CV-thong-bao-dieu-chinh-ma-so-don-vi-hanh-chinh-tinh-Gia-Lai-30.6.pdf)

## 2. Clean cutover eligibility

**Decision**: Use a destructive clean cutover only because production has zero listings and zero projects. V10 itself rechecks both tables and aborts before any DDL if either count is non-zero.

**Rationale**: There is no business address to preserve, so an additive schema, address crosswalk, manual review queue, dual reads, and compatibility endpoints add risk without value. The in-migration preflight prevents an assumption made during planning from becoming a destructive race at deployment.

**Alternatives considered**:

- Additive migration with legacy review: rejected because the authoritative deployment condition is an empty business database.
- Trust only an operator query: rejected because data could be created between the query and migration.
- Delete existing business rows automatically: rejected; any non-zero count moves the database outside this feature's authorization and scope.

## 3. V1–V9 immutability and V10 implementation

**Decision**: Never edit V1–V9. Implement V10 as a Flyway SQL migration whose first executable block reads both counts and deliberately executes a failing statement when either is non-zero, before the first schema-changing statement.

**Rationale**: Editing an applied Flyway migration breaks checksums. MySQL DDL auto-commits, so the SQL guard must finish before any `ALTER`, `DROP`, or `CREATE`. A prepared conditional statement can fail without creating a temporary guard object.

**Required V10 order**:

1. Read `COUNT(*)` from `listings` and `projects`.
2. Throw with both counts when either is non-zero.
3. Create the clean two-level/release target schema and required business foreign keys/indexes while source tables still exist.
4. Remove legacy business foreign keys/indexes and columns.
5. Drop `wards`, `districts`, and legacy `provinces` in dependency order.

**Alternative considered**: A Java migration provides natural control flow but would introduce a second migration mechanism solely for V10. The selected SQL guard is acceptable only with Testcontainers proof that failure changes no schema object.

## 4. Source ingestion and provenance

**Decision**: Normalize official source material offline, review it, and commit immutable JSON artifacts plus manifests. Production reads only bundled artifacts and never scrapes/downloads live data at startup.

**Rationale**: Runtime downloading is not reproducible and allows the source to change between validation and activation. A manifest and checksum identify the exact approved bytes.

**Manifest minimum**:

- dataset version and effective date;
- issuing authority, document number, attribution, and official source URLs;
- retrieval timestamp, raw and normalized SHA-256;
- transform version/Git commit;
- expected global, type, and per-province counts;
- validation sentinels.

Attribution: `Nguồn: Cục Thống kê, Bộ Tài chính; Quyết định số 19/2025/QĐ-TTg, hiệu lực 01/07/2025.`

**Alternatives considered**: runtime HTTP import, hand-entry of 3,355 rows, or names as keys. All are rejected as non-repeatable or insufficiently auditable.

## 5. Clean two-level relational model

**Decision**: Drop the old `provinces`, `districts`, and `wards`; create release-aware `administrative_provinces` and `commune_units`. Replace listing/project legacy columns with required `administrative_province_id` and `commune_unit_id`.

**Rationale**: Reusing district-bound `wards` would retain a false hierarchy. Recreating the empty catalog avoids ambiguous legacy meanings and leaves one address model in schema and code.

**Integrity decision**: Store both foreign keys and add a composite foreign key from business rows to `(commune_unit_id, province_id)`. Services provide Vietnamese errors and active-release checks; the database prevents cross-province pairs through every write path.

**Alternative considered**: Store only commune unit and derive province. It is normalized but less explicit for pair validation and province-filter indexes.

## 6. Validation and activation workflow

**Decision**: Use immutable release records with `STAGED`, `VALIDATED`, `ACTIVE`, `FAILED`, and `SUPERSEDED` states plus a singleton active-catalog pointer. ADMIN validation and activation are distinct operations.

**Rationale**: Validation must be inspectable without changing public choices. A short activation transaction can atomically switch the pointer after all content checks pass.

**Rules**:

- Validate checksum, version, effective date, exact global/type/per-province counts, code uniqueness and format, Unicode names, allowed types, parent existence, and sentinels.
- Same version plus same checksum returns the existing release/result.
- Same version plus different checksum is a conflict.
- Activation requires `VALIDATED`; repeated activation of the active release is idempotent.
- Use optimistic/pessimistic locking on catalog state to serialize concurrent activation.
- Failed validation records safe diagnostics and never changes the active pointer.

**Alternative considered**: automatic activation at application startup. Rejected because it removes the explicit ADMIN approval and makes a restart a business mutation.

## 7. Production category catalog

**Decision**: Bundle a separate immutable `categories-v1` artifact with exactly 16 stable slugs: eight BUY and eight RENT categories listed in `spec.md`. Validate and activate it through ADMIN-only operations using the same idempotency/conflict semantics.

**Rationale**: Categories are legitimate reference data, not demo inventory. A separate release makes their provenance and activation explicit without coupling them to government administrative releases.

**Rules**:

- Same slug/name/transaction type is idempotent.
- A slug with different meaning is a conflict, never a silent update.
- Activation creates no business row or association.
- Existing arbitrary categories are not silently reclassified; clean initialization must produce exactly the approved 16 active categories.

## 8. Public/API identity

**Decision**: Use official string codes in external contracts: `provinceCode` and `communeCode`. Numeric primary keys remain internal.

**Rationale**: Official codes are stable across database recreation, preserve leading zeroes, and avoid exposing internal identity. The client sends both codes; the service validates active release and membership.

**Contract consequence**: Remove `districtId`, district response fields, district filters, and district endpoints. No legacy redirect/resolver is part of the clean cutover.

## 9. Dependent selector UX

**Decision**: Use province first and a dependent native selector labeled `Phường / xã / đặc khu`. Reset the commune synchronously when province changes and aggregate all API pages for the selected province.

**Rationale**: Native controls provide reliable keyboard/screen-reader behavior. Paginated APIs satisfy governance; bounded per-province aggregation supplies a complete selector.

**Baseline**: linked labels/errors, required and `aria-invalid`, disabled child selector before province selection, Vietnamese loading/error/empty/retry states, 44px targets, first-invalid focus, and no horizontal overflow at 320/360/768/1024/1440px.

## 10. Verification and rollback

**Decision**: Take a pre-V10 backup/snapshot, stop writes, run an operator zero-count check, let V10 independently recheck, then deploy/validate/activate. Treat V10 as one-way.

**Rationale**: Dropped tables and columns cannot be restored by rolling back the application binary or Flyway. The old application expects district schema and is incompatible after V10.

**Recovery choices**:

- Restore the pre-V10 MySQL backup/snapshot and old application; or
- Because the database is disposable, recreate it, rerun V1–V10, deploy the new application, and repeat ADMIN validation/activation.

There is no supported down migration. If V10 preflight fails, do not delete or alter the discovered business rows; stop and design a preservation migration.
