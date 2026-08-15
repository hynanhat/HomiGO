-- Reproducible MySQL-only benchmark dataset for Phase 6 / T054.
-- Run this only against a disposable database after Flyway V1-V4 have completed.

INSERT INTO users (id, name, email, password_hash, phone, role, status, created_at)
VALUES (1, 'Benchmark Seller', 'benchmark@homigo.local', 'not-used', '0900000000', 'SELLER', 'ACTIVE', '2026-01-01 00:00:00');

INSERT INTO provinces (id, name)
VALUES (1, 'Benchmark Province');

INSERT INTO districts (id, province_id, name)
VALUES
    (1, 1, 'District 01'), (2, 1, 'District 02'),
    (3, 1, 'District 03'), (4, 1, 'District 04'),
    (5, 1, 'District 05'), (6, 1, 'District 06'),
    (7, 1, 'District 07'), (8, 1, 'District 08'),
    (9, 1, 'District 09'), (10, 1, 'District 10');

INSERT INTO wards (id, district_id, name, code)
VALUES
    (1, 1, 'Ward 01', 'BENCH-01'), (2, 2, 'Ward 02', 'BENCH-02'),
    (3, 3, 'Ward 03', 'BENCH-03'), (4, 4, 'Ward 04', 'BENCH-04'),
    (5, 5, 'Ward 05', 'BENCH-05'), (6, 6, 'Ward 06', 'BENCH-06'),
    (7, 7, 'Ward 07', 'BENCH-07'), (8, 8, 'Ward 08', 'BENCH-08'),
    (9, 9, 'Ward 09', 'BENCH-09'), (10, 10, 'Ward 10', 'BENCH-10');

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
    user_id, category_id, district_id, project_id, title, description,
    price, area, status, created_at, expires_at, public_code, ward_id,
    address, latitude, longitude, bedrooms, bathrooms, floors, direction,
    furnishing, legal_status, contact_name, contact_phone, rejection_reason,
    approved_by, approved_at, published_at, updated_at, version
)
SELECT
    1,
    MOD(sequence_no, 4) + 1,
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
    MOD(sequence_no, 10) + 1,
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
