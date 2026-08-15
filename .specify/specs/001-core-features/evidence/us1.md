# US1 evidence — Search and browse

Date: 2026-08-14

## Automated verification

- `mvnw.cmd verify`: **BUILD SUCCESS** — 47 tests, 0 failures, 0 errors,
  0 skipped.
- `ListingSearchIntegrationTest` uses a deterministic 30-listing fixture and
  verifies public visibility, transaction type, province, district, ward,
  category, bedrooms, keyword, price, area, bounding box, all five supported
  sorts and stable pagination.
- The fixture contains 24 public ACTIVE/unexpired listings plus expired,
  PENDING, REJECTED, INACTIVE and DRAFT control records.
- `PublicListingSearchIntegrationTest` verifies combined filters through HTTP,
  public-code detail lookup, hidden expired/PENDING records and validation of
  invalid ranges, partial bounding boxes and unknown sort values.
- Hibernate statistics confirm a page of ten public listings is mapped with at
  most three prepared statements (page, count and one batched image query),
  rather than one query per listing.

## Implemented public contract

- `GET /api/v1/listings` supports keyword, transaction type, province,
  district, ward, category, project, price, area, bedrooms and complete map
  bounding-box filters.
- Supported sort values are `newest`, `priceAsc`, `priceDesc`, `areaAsc` and
  `areaDesc`; listing ID is the stable tie-breaker.
- `GET /api/v1/listings/{publicCode}` exposes an ACTIVE listing by stable public
  code and returns 404 for non-public states.
- Public queries always require ACTIVE status and a null or future expiration.
- Cross-field validation rejects inverted price/area ranges and incomplete or
  inverted coordinate bounds.

## Performance checkpoint

The reproducible 10,000-listing MySQL benchmark is documented in
`search-performance.md`. The representative combined-filter request measured
42.52 ms p50 and 70.73 ms maximum against the Phase 6 target of under 500 ms.

**Checkpoint:** filter accuracy, public visibility, public-code detail,
pagination stability, N+1 protection and the local performance target all pass.
