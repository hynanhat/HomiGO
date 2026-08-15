# Search performance evidence — T054

Date: 2026-08-14

## Environment

- Windows 11 Home Single Language
- Java 22.0.2
- Spring Boot 4.1.0
- MySQL 8.0.46 on localhost
- Disposable database: `homigo_phase6_benchmark_20260814`
- Dataset generator: `backend/src/test/resources/db/search-benchmark-seed.sql`

The generator inserted exactly 10,000 deterministic listings: 9,500 ACTIVE,
500 PENDING and 9,200 currently public (ACTIVE and unexpired). The normal
`homigo` database was not used.

## Representative query

The measured API request combined district, category, price, area and map
bounding-box filters, sorted newest first, with page size 20:

```text
GET /api/v1/listings?districtId=2&categoryId=2
    &minPrice=1000000000&maxPrice=9000000000
    &minArea=50&maxArea=180
    &minLat=10.72&maxLat=10.88
    &minLng=106.62&maxLng=106.68
    &sort=newest&page=0&size=20
```

The response returned 20 of 250 matching public listings.

## MySQL query plan

`EXPLAIN` selected `idx_listings_district_status` with an estimated 1,000
candidate rows. `EXPLAIN ANALYZE` reported:

```text
Index lookup: idx_listings_district_status
Candidate rows: 1,000
Rows after all filters: 250
Top-N sort and limit: 20
Actual total query time: 4.01–4.02 ms
Extra: Using where; Using filesort
```

The bounded filesort operates on 250 matches after an indexed reduction from
10,000 rows, so no additional index is justified at this dataset size. This
plan should be rechecked when production-like data distribution is available.

## HTTP measurements

One warm-up request was excluded. Ten consecutive localhost requests were
then measured end-to-end with PowerShell `Invoke-RestMethod`:

| Metric | Result |
|---|---:|
| Minimum | 35.31 ms |
| Median (p50) | 42.52 ms |
| Mean | 48.54 ms |
| Maximum | 70.73 ms |
| Phase target | < 500 ms |

Samples (ms): `42.83, 42.21, 70.73, 53.87, 57.89, 67.13, 37.94,
38.54, 38.94, 35.31`.

**Result:** the maximum measured response was 85.9% below the 500 ms Phase 6
target in this documented local environment.

## Cleanup

After measurement, the benchmark backend process was stopped and the
disposable database was dropped. No benchmark records remain in the normal
application database.
