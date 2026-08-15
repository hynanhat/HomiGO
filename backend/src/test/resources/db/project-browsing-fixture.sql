INSERT INTO users (id, name, email, password_hash, role, status, created_at)
VALUES (9101, 'Project Seller', 'project-seller@homigo.test', 'hash', 'SELLER', 'ACTIVE', CURRENT_TIMESTAMP);

INSERT INTO provinces (id, name) VALUES (1301, 'TP.HCM');
INSERT INTO districts (id, province_id, name) VALUES
    (1311, 1301, 'Quận 1'),
    (1312, 1301, 'Thành phố Thủ Đức');
INSERT INTO wards (id, district_id, name, code) VALUES
    (13111, 1311, 'Bến Nghé', 'PROJECT-BEN-NGHE'),
    (13121, 1312, 'Thảo Điền', 'PROJECT-THAO-DIEN');

INSERT INTO categories (id, name, slug, transaction_type)
VALUES (2101, 'Căn hộ bán', 'project-apartment-buy', 'BUY');

INSERT INTO projects
    (id, name, slug, investor, district_id, ward_id, address, latitude, longitude,
     status, description, price_from, price_to, created_at, updated_at)
VALUES
    (5001, 'Riverside Residence', 'riverside-residence', 'Homi Investor', 1311, 13111,
     '1 Nguyễn Huệ', 10.775, 106.700, 'IN_PROGRESS', 'Dự án ven sông trung tâm.',
     3000000000, 9000000000, '2026-01-01', '2026-08-01'),
    (5002, 'Metro City', 'metro-city', 'Metro Group', 1312, 13121,
     '2 Võ Nguyên Giáp', 10.810, 106.730, 'PLANNING', 'Dự án gần tuyến metro.',
     2500000000, 7000000000, '2026-02-01', '2026-08-02'),
    (5003, 'Heritage Tower', 'heritage-tower', 'Heritage Group', 1311, 13111,
     '3 Đồng Khởi', 10.776, 106.701, 'COMPLETED', 'Dự án đã bàn giao.',
     5000000000, 12000000000, '2025-01-01', '2026-08-03');

INSERT INTO listings
    (id, public_code, user_id, category_id, district_id, ward_id, project_id,
     title, description, price, area, address, latitude, longitude, bedrooms,
     bathrooms, contact_name, contact_phone, status, published_at, expires_at,
     created_at, updated_at, version)
VALUES
    (5101, 'PROJECT-ACTIVE', 9101, 2101, 1311, 13111, 5001,
     'Căn hộ Riverside đang bán', 'Tin công khai thuộc dự án.', 4500000000, 82,
     '1 Nguyễn Huệ', 10.775, 106.700, 2, 2, 'Seller', '0901000001',
     'ACTIVE', '2026-08-01', '2099-12-31', '2026-08-01', '2026-08-01', 0),
    (5102, 'PROJECT-EXPIRED', 9101, 2101, 1311, 13111, 5001,
     'Căn hộ Riverside hết hạn', 'Không được xuất hiện.', 4300000000, 80,
     '1 Nguyễn Huệ', 10.775, 106.700, 2, 2, 'Seller', '0901000002',
     'ACTIVE', '2020-01-01', '2020-02-01', '2020-01-01', '2020-01-01', 0),
    (5103, 'PROJECT-PENDING', 9101, 2101, 1311, 13111, 5001,
     'Căn hộ Riverside chờ duyệt', 'Không được xuất hiện.', 4200000000, 78,
     '1 Nguyễn Huệ', 10.775, 106.700, 2, 2, 'Seller', '0901000003',
     'PENDING', NULL, NULL, '2026-08-03', '2026-08-03', 0),
    (5104, 'PROJECT-METRO', 9101, 2101, 1312, 13121, 5002,
     'Căn hộ Metro City', 'Tin công khai dự án Metro.', 3900000000, 75,
     '2 Võ Nguyên Giáp', 10.810, 106.730, 2, 2, 'Seller', '0901000004',
     'ACTIVE', '2026-08-04', '2099-12-31', '2026-08-04', '2026-08-04', 0);
