# Quickstart Validation: Two-Level Production Addresses

This guide validates feature 007. V10 is intentionally destructive and must run only when `listings` and `projects` are empty.

## 1. Prerequisites

- Docker and Docker Compose
- Java 17/Maven wrapper dependencies already available
- Node/npm dependencies installed
- An ADMIN account for release validation/activation
- Pinned artifacts present:
  - `vn-administrative-units-2025-07-01`
  - `categories-v1`

Do not edit Flyway V1–V9.

## 2. Review the Migration Safety Tests First

From repository root:

```powershell
cd backend
./mvnw.cmd -Dtest=MySqlMigrationIntegrationTest test
```

Required evidence:

- V9 database with one listing: V10 fails and legacy schema remains unchanged.
- V9 database with one project: V10 fails and legacy schema remains unchanged.
- Empty V9 business tables: V10 succeeds.
- Successful schema has no `districts`, old `wards`, `district_id`, or legacy `ward_id`.
- New foreign keys/indexes exist and Hibernate `validate` passes.

Do not proceed if Docker/Testcontainers skipped these cases.

## 3. Run Local Automated Validation

Backend:

```powershell
cd backend
./mvnw.cmd test
```

Frontend:

```powershell
cd frontend
npm run format:check
npm run lint
npm run test
npm run build
```

Focused E2E after the stack is running:

```powershell
cd frontend
npx playwright test e2e/seller-publication.spec.ts e2e/projects.spec.ts e2e/public-discovery.spec.ts e2e/admin.spec.ts
```

Expected: requests, responses, controls, query strings, and displayed structured addresses contain province/commune fields and no district field.

## 4. Production Pre-Cutover Gate

Put the site in maintenance/read-only mode and take a MySQL backup or VPS snapshot. Then inspect counts using the configured database credentials:

```bash
cd /opt/homigo
sudo docker compose exec db sh -c 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT (SELECT COUNT(*) FROM listings) AS listings_count, (SELECT COUNT(*) FROM projects) AS projects_count;"'
```

Required result:

```text
listings_count = 0
projects_count = 0
```

This operator check does not replace V10's own check.

If either count is non-zero:

- Stop.
- Do not delete rows to force eligibility.
- Do not deploy feature 007.
- Create a preservation migration plan for that database.

## 5. Build and Run the Cutover

With the backup confirmed and both counts zero:

```bash
cd /opt/homigo
sudo docker compose up -d --build backend
sudo docker compose logs --tail=200 backend
```

Expected:

- Flyway applies V10 successfully.
- Backend reaches healthy state.
- No partial-cutover error appears.

Verify schema:

```bash
sudo docker compose exec db sh -c 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SHOW TABLES LIKE '\''provinces'\''; SHOW TABLES LIKE '\''districts'\''; SHOW TABLES LIKE '\''wards'\''; SHOW TABLES LIKE '\''administrative_provinces'\''; SHOW TABLES LIKE '\''commune_units'\''; SHOW COLUMNS FROM listings; SHOW COLUMNS FROM projects;"'
```

Expected:

- No legacy `provinces`, `districts`, or `wards` table.
- `administrative_provinces` and `commune_units` exist.
- Listings/projects have `administrative_province_id` and `commune_unit_id`.
- Listings/projects have no `district_id` or legacy `ward_id`.

## 6. Validate and Activate Reference Data

Log in as ADMIN through the normal application flow. In Admin → Location data:

1. Select `vn-administrative-units-2025-07-01`.
2. Choose `Kiểm tra bộ dữ liệu`.
3. Confirm checksum/source/effective date and exact results:
   - 34 provinces
   - 3,321 commune-level units
   - 2,621 communes
   - 687 wards
   - 13 special zones
   - zero duplicate codes
   - zero orphaned units
   - all sentinels pass
4. Choose `Kích hoạt bộ dữ liệu` and confirm.
5. Choose `Khởi tạo 16 danh mục production` for `categories-v1`.
6. Confirm 16 total, 8 BUY, and 8 RENT.

Repeat the address activation and category initialization once. Address release IDs and all catalog counts must remain unchanged; category initialization must report zero newly created rows.

If using the API directly, use the contracts in [contracts/api.md](./contracts/api.md) with the normal authenticated ADMIN cookie/token; do not place credentials in shell history or documentation.

## 7. Verify No Demo/Business Data Was Created

```bash
sudo docker compose exec db sh -c 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT COUNT(*) AS users_count FROM users; SELECT COUNT(*) AS projects_count FROM projects; SELECT COUNT(*) AS listings_count FROM listings; SELECT COUNT(*) AS payments_count FROM seller_upgrade_payments; SELECT COUNT(*) AS views_count FROM listing_views;"'
```

Compare to the pre-activation baseline. Reference activation must add no row to these tables.

Verify active reference counts through the admin API/UI:

- Provinces: 34
- Commune-level units: 3,321
- Active categories: 16

## 8. End-to-End Acceptance

1. Register/upgrade or use a real SELLER account.
2. Create a draft with province and commune-level unit; confirm no district control/payload.
3. Change province; confirm commune and project reset immediately.
4. Submit a mismatched pair through an API test; expect Vietnamese `LOCATION_RELATION_INVALID`.
5. Create a real project as ADMIN with the same two-level workflow.
6. Publish controlled acceptance records and verify province/commune listing and project filters.
7. Verify cards, detail, saved, seller, admin, recommendation, and AI surfaces show commune + province only.
8. Validate responsive behavior at 320, 360, 768, 1024, and 1440px.

## 9. Docker/Health Verification

```bash
cd /opt/homigo
sudo docker compose up -d --build
sudo docker compose ps
curl -sS https://homigo.io.vn/healthz
curl -sS https://homigo.io.vn/api/v1/locations/provinces?page=0\&size=100
```

Expected:

- MySQL, backend, and frontend are healthy.
- `/healthz` returns `ok`.
- Province API reports 34 total elements after activation.
- Frontend healthcheck continues to use `127.0.0.1`; feature 007 does not revert it.

## 10. Rollback / Recreate Caveat

There is no Flyway down migration for V10 and an old backend cannot run against the new schema.

If recovery is required after V10:

- Preferred when preserving the old environment: restore the complete pre-V10 database backup/snapshot, then run the old application.
- Preferred for this disposable empty database: recreate the database/volume, rerun V1–V10 with the new application, then repeat ADMIN validation and activation.

Do not attempt to reconstruct dropped district tables manually or simply deploy an old image over the V10 schema.
