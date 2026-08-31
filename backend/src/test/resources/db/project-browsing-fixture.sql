INSERT INTO users (id, name, email, password_hash, role, status, created_at)
VALUES (9101, 'Project Seller', 'project-seller@homigo.test', 'hash', 'SELLER', 'ACTIVE', CURRENT_TIMESTAMP);

INSERT INTO administrative_dataset_releases
    (id, dataset_version, authority, document_number, effective_date, retrieved_at,
     source_urls_json, attribution, raw_sha256, normalized_sha256, transform_version,
     expected_province_count, expected_commune_count, actual_province_count, actual_commune_count,
     status, validation_summary_json, created_at, validated_at, activated_at, version)
VALUES
    (9300, 'project-test-current', 'Test authority', 'TEST', '2025-07-01', CURRENT_TIMESTAMP,
     '[]', 'Test fixture only', REPEAT('a', 64), REPEAT('b', 64), 'test',
     2, 3, 2, 3, 'ACTIVE', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);
INSERT INTO administrative_catalog_state (singleton_key, active_release_id, updated_at, version)
VALUES (1, 9300, CURRENT_TIMESTAMP, 0);
INSERT INTO administrative_provinces
    (id, dataset_release_id, official_code, official_name, unit_type, catalog_status,
     effective_from, created_at, updated_at)
VALUES
    (9301, 9300, '79', 'Thành phố Hồ Chí Minh', 'CENTRAL_MUNICIPALITY', 'ACTIVE',
     '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (9302, 9300, '01', 'Thành phố Hà Nội', 'CENTRAL_MUNICIPALITY', 'ACTIVE',
     '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (9303, 9300, '99', 'Tỉnh không còn hiệu lực', 'PROVINCE', 'INACTIVE',
     '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO commune_units
    (id, dataset_release_id, administrative_province_id, official_code, official_name,
     unit_type, catalog_status, effective_from, created_at, updated_at)
VALUES
    (9311, 9300, 9301, '26734', 'Phường Bến Nghé', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (9312, 9300, 9301, '26740', 'Phường Thảo Điền', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (9321, 9300, 9302, '00004', 'Phường Hoàn Kiếm', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (9322, 9300, 9301, '99998', 'Phường không còn hiệu lực', 'WARD', 'INACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO categories (id, name, slug, transaction_type)
VALUES (2101, 'Căn hộ bán', 'project-apartment-buy', 'BUY');

INSERT INTO projects
    (id, name, slug, investor, administrative_province_id, commune_unit_id,
     address, latitude, longitude,
     status, description, price_from, price_to, created_at, updated_at)
VALUES
    (5001, 'Riverside Residence', 'riverside-residence', 'Homi Investor', 9301, 9311,
     '1 Nguyễn Huệ', 10.775, 106.700, 'IN_PROGRESS', 'Dự án ven sông trung tâm.',
     3000000000, 9000000000, '2026-01-01', '2026-08-01'),
    (5002, 'Metro City', 'metro-city', 'Metro Group', 9301, 9312,
     '2 Võ Nguyên Giáp', 10.810, 106.730, 'PLANNING', 'Dự án gần tuyến metro.',
     2500000000, 7000000000, '2026-02-01', '2026-08-02'),
    (5003, 'Heritage Tower', 'heritage-tower', 'Heritage Group', 9301, 9311,
     '3 Đồng Khởi', 10.776, 106.701, 'COMPLETED', 'Dự án đã bàn giao.',
     5000000000, 12000000000, '2025-01-01', '2026-08-03');

INSERT INTO listings
    (id, public_code, user_id, category_id, project_id,
     administrative_province_id, commune_unit_id,
     title, description, price, area, address, latitude, longitude, bedrooms,
     bathrooms, contact_name, contact_phone, status, published_at, expires_at,
     created_at, updated_at, version)
VALUES
    (5101, 'PROJECT-ACTIVE', 9101, 2101, 5001, 9301, 9311,
     'Căn hộ Riverside đang bán', 'Tin công khai thuộc dự án.', 4500000000, 82,
     '1 Nguyễn Huệ', 10.775, 106.700, 2, 2, 'Seller', '0901000001',
     'ACTIVE', '2026-08-01', '2099-12-31', '2026-08-01', '2026-08-01', 0),
    (5102, 'PROJECT-EXPIRED', 9101, 2101, 5001, 9301, 9311,
     'Căn hộ Riverside hết hạn', 'Không được xuất hiện.', 4300000000, 80,
     '1 Nguyễn Huệ', 10.775, 106.700, 2, 2, 'Seller', '0901000002',
     'ACTIVE', '2020-01-01', '2020-02-01', '2020-01-01', '2020-01-01', 0),
    (5103, 'PROJECT-PENDING', 9101, 2101, 5001, 9301, 9311,
     'Căn hộ Riverside chờ duyệt', 'Không được xuất hiện.', 4200000000, 78,
     '1 Nguyễn Huệ', 10.775, 106.700, 2, 2, 'Seller', '0901000003',
     'PENDING', NULL, NULL, '2026-08-03', '2026-08-03', 0),
    (5104, 'PROJECT-METRO', 9101, 2101, 5002, 9301, 9312,
     'Căn hộ Metro City', 'Tin công khai dự án Metro.', 3900000000, 75,
     '2 Võ Nguyên Giáp', 10.810, 106.730, 2, 2, 'Seller', '0901000004',
     'ACTIVE', '2026-08-04', '2099-12-31', '2026-08-04', '2026-08-04', 0);
