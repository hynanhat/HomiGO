-- Reproducible MySQL-only benchmark dataset for Phase 6 / T054.
-- Run this only against a disposable database after Flyway has completed through V10.

INSERT INTO users (id, name, email, password_hash, phone, role, status, created_at)
VALUES (1, 'Benchmark Seller', 'benchmark@homigo.local', 'not-used', '0900000000', 'SELLER', 'ACTIVE', '2026-01-01 00:00:00');

INSERT INTO administrative_dataset_releases (
    id, dataset_version, authority, document_number, effective_date, retrieved_at,
    source_urls_json, attribution, raw_sha256, normalized_sha256, transform_version,
    expected_province_count, expected_commune_count, actual_province_count,
    actual_commune_count, status, created_at, validated_at, activated_at, version
) VALUES (
    1, 'benchmark-current', 'Benchmark authority', 'BENCH', '2025-07-01', CURRENT_TIMESTAMP,
    JSON_ARRAY(), 'Disposable benchmark data', REPEAT('a', 64), REPEAT('b', 64), 'benchmark-v1',
    1, 10, 1, 10, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
);

UPDATE administrative_catalog_state SET active_release_id = 1, updated_at = CURRENT_TIMESTAMP WHERE singleton_key = 1;

INSERT INTO administrative_provinces (
    id, dataset_release_id, official_code, official_name, unit_type, catalog_status,
    effective_from, created_at, updated_at
) VALUES (1, 1, '79', 'Benchmark Province', 'PROVINCE', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO commune_units (
    id, dataset_release_id, administrative_province_id, official_code, official_name,
    unit_type, catalog_status, effective_from, created_at, updated_at
) VALUES
    (1, 1, 1, '10001', 'Commune 01', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 1, 1, '10002', 'Commune 02', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 1, 1, '10003', 'Commune 03', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 1, 1, '10004', 'Commune 04', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 1, 1, '10005', 'Commune 05', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 1, 1, '10006', 'Commune 06', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (7, 1, 1, '10007', 'Commune 07', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (8, 1, 1, '10008', 'Commune 08', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (9, 1, 1, '10009', 'Commune 09', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (10, 1, 1, '10010', 'Commune 10', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO categories (id, name, slug, transaction_type)
VALUES
    (1, 'Apartment for sale', 'benchmark-apartment-buy', 'BUY'),
    (2, 'House for sale', 'benchmark-house-buy', 'BUY'),
    (3, 'Apartment for rent', 'benchmark-apartment-rent', 'RENT'),
    (4, 'House for rent', 'benchmark-house-rent', 'RENT');

CREATE TEMPORARY TABLE benchmark_digits_ones (digit INT NOT NULL PRIMARY KEY);
INSERT INTO benchmark_digits_ones (digit)
VALUES (0), (1), (2), (3), (4), (5), (6), (7), (8), (9);
CREATE TEMPORARY TABLE benchmark_digits_tens LIKE benchmark_digits_ones;
CREATE TEMPORARY TABLE benchmark_digits_hundreds LIKE benchmark_digits_ones;
CREATE TEMPORARY TABLE benchmark_digits_thousands LIKE benchmark_digits_ones;
INSERT INTO benchmark_digits_tens SELECT digit FROM benchmark_digits_ones;
INSERT INTO benchmark_digits_hundreds SELECT digit FROM benchmark_digits_ones;
INSERT INTO benchmark_digits_thousands SELECT digit FROM benchmark_digits_ones;

INSERT INTO listings (
    user_id, category_id, administrative_province_id, commune_unit_id, project_id, title, description,
    price, area, status, created_at, expires_at, public_code,
    address, latitude, longitude, bedrooms, bathrooms, floors, direction,
    furnishing, legal_status, contact_name, contact_phone, rejection_reason,
    approved_by, approved_at, published_at, updated_at, version
)
SELECT
    1,
    MOD(sequence_no, 4) + 1,
    1,
    MOD(sequence_no, 10) + 1,
    NULL,
    CONCAT('Benchmark property ', LPAD(sequence_no, 5, '0')),
    CONCAT('Deterministic search benchmark listing number ', sequence_no),
    1000000000 + MOD(sequence_no, 100) * 100000000,
    30 + MOD(sequence_no, 200),
    IF(MOD(sequence_no, 20) = 0, 'PENDING', 'ACTIVE'),
    DATE_ADD('2026-01-01 00:00:00', INTERVAL sequence_no SECOND),
    IF(MOD(sequence_no, 25) = 0, '2025-01-01 00:00:00', '2099-12-31 23:59:59'),
    CONCAT('BENCH-', LPAD(sequence_no, 5, '0')),
    CONCAT(sequence_no, ' Benchmark Street'),
    10.700000 + MOD(sequence_no, 100) * 0.001,
    106.600000 + MOD(sequence_no, 100) * 0.001,
    MOD(sequence_no, 5) + 1,
    MOD(sequence_no, 4) + 1,
    MOD(sequence_no, 20) + 1,
    'EAST',
    'BASIC',
    'CERTIFICATE',
    'Benchmark Seller',
    '0900000000',
    NULL,
    IF(MOD(sequence_no, 20) = 0, NULL, 1),
    IF(MOD(sequence_no, 20) = 0, NULL, '2026-01-01 00:00:00'),
    IF(MOD(sequence_no, 20) = 0, NULL, '2026-01-01 00:00:00'),
    DATE_ADD('2026-01-01 00:00:00', INTERVAL sequence_no SECOND),
    0
FROM (
    SELECT ones.digit
         + tens.digit * 10
         + hundreds.digit * 100
         + thousands.digit * 1000
         + 1 AS sequence_no
    FROM benchmark_digits_ones ones
    CROSS JOIN benchmark_digits_tens tens
    CROSS JOIN benchmark_digits_hundreds hundreds
    CROSS JOIN benchmark_digits_thousands thousands
) generated_rows;

DROP TEMPORARY TABLE benchmark_digits_ones;
DROP TEMPORARY TABLE benchmark_digits_tens;
DROP TEMPORARY TABLE benchmark_digits_hundreds;
DROP TEMPORARY TABLE benchmark_digits_thousands;
