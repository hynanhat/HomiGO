INSERT INTO users (id,name,email,password_hash,role,status,created_at)
VALUES (9001,'Search Seller','search-seller@homigo.test','hash','SELLER','ACTIVE',CURRENT_TIMESTAMP);

INSERT INTO administrative_dataset_releases
    (id, dataset_version, authority, document_number, effective_date, retrieved_at,
     source_urls_json, attribution, raw_sha256, normalized_sha256, transform_version,
     expected_province_count, expected_commune_count, actual_province_count, actual_commune_count,
     status, validation_summary_json, created_at, validated_at, activated_at, version)
VALUES
    (9900, 'search-test-current', 'Test authority', 'TEST', '2025-07-01', CURRENT_TIMESTAMP,
     '[]', 'Test fixture only', REPEAT('c', 64), REPEAT('d', 64), 'test',
     2, 4, 2, 4, 'ACTIVE', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);
INSERT INTO administrative_catalog_state (singleton_key, active_release_id, updated_at, version)
VALUES (1, 9900, CURRENT_TIMESTAMP, 0);
INSERT INTO administrative_provinces
    (id, dataset_release_id, official_code, official_name, unit_type, catalog_status,
     effective_from, created_at, updated_at)
VALUES
    (9902, 9900, '79', 'Thành phố Hồ Chí Minh', 'CENTRAL_MUNICIPALITY', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (9903, 9900, '01', 'Thành phố Hà Nội', 'CENTRAL_MUNICIPALITY', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO commune_units
    (id, dataset_release_id, administrative_province_id, official_code, official_name,
     unit_type, catalog_status, effective_from, created_at, updated_at)
VALUES
    (9911, 9900, 9902, '26734', 'Phường Bến Nghé', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (9912, 9900, 9902, '26737', 'Phường Đa Kao', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (9913, 9900, 9902, '26740', 'Phường Thảo Điền', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (9921, 9900, 9903, '00004', 'Phường Hoàn Kiếm', 'WARD', 'ACTIVE', '2025-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO categories (id,name,slug,transaction_type) VALUES
  (2001,'Căn hộ bán','search-can-ho-ban','BUY'),
  (2002,'Nhà cho thuê','search-nha-thue','RENT'),
  (2003,'Đất bán','search-dat-ban','BUY');

INSERT INTO listings
(id,public_code,user_id,category_id,administrative_province_id,commune_unit_id,title,description,price,area,address,latitude,longitude,
 bedrooms,bathrooms,floors,contact_name,contact_phone,status,published_at,expires_at,created_at,updated_at,version)
VALUES
(3001,'SEARCH-001',9001,2001,9902,9911,'Căn hộ trung tâm Quận 1','Ban công rộng, gần phố đi bộ',3000000000,80,'1 Nguyễn Huệ',10.775,106.700,3,2,20,'Seller','0901000001','ACTIVE','2026-07-01','2099-12-31','2026-07-01','2026-07-01',0),
(3002,'SEARCH-002',9001,2001,9902,9912,'Căn hộ ven sông cao cấp','View sông thoáng mát',4200000000,95,'2 Hoàng Sa',10.780,106.710,2,2,18,'Seller','0901000002','ACTIVE','2026-07-02','2099-12-31','2026-07-02','2026-07-02',0),
(3003,'SEARCH-003',9001,2002,9902,9911,'Nhà thuê gần chợ Bến Thành','Nội thất đầy đủ',22000000,65,'3 Lê Lợi',10.772,106.698,2,2,3,'Seller','0901000003','ACTIVE','2026-07-03','2099-12-31','2026-07-03','2026-07-03',0),
(3004,'SEARCH-004',9001,2003,9902,9912,'Đất mặt tiền Đa Kao','Phù hợp xây văn phòng',8500000000,120,'4 Điện Biên Phủ',10.790,106.695,NULL,NULL,NULL,'Seller','0901000004','ACTIVE','2026-07-04','2099-12-31','2026-07-04','2026-07-04',0),
(3005,'SEARCH-005',9001,2001,9902,9911,'Căn hộ nhỏ trung tâm','Sổ hồng riêng',1800000000,48,'5 Đồng Khởi',10.776,106.702,1,1,12,'Seller','0901000005','ACTIVE','2026-07-05','2099-12-31','2026-07-05','2026-07-05',0),
(3006,'SEARCH-006',9001,2002,9902,9912,'Nhà phố cho thuê Đa Kao','Có sân thượng',35000000,90,'6 Nguyễn Đình Chiểu',10.788,106.700,3,3,4,'Seller','0901000006','ACTIVE','2026-07-06','2099-12-31','2026-07-06','2026-07-06',0),
(3007,'SEARCH-007',9001,2001,9902,9911,'Penthouse trung tâm','Hồ bơi riêng',12000000000,210,'7 Lê Thánh Tôn',10.779,106.704,4,4,25,'Seller','0901000007','ACTIVE','2026-07-07','2099-12-31','2026-07-07','2026-07-07',0),
(3008,'SEARCH-008',9001,2003,9902,9912,'Đất hẻm xe hơi','Khu dân cư hiện hữu',5200000000,75,'8 Trần Quang Khải',10.795,106.696,NULL,NULL,NULL,'Seller','0901000008','ACTIVE','2026-07-08','2099-12-31','2026-07-08','2026-07-08',0),
(3009,'SEARCH-009',9001,2001,9902,9911,'Căn hộ gia đình ba phòng ngủ','Gần trường học quốc tế',5600000000,110,'9 Pasteur',10.781,106.699,3,2,16,'Seller','0901000009','ACTIVE','2026-07-09','2099-12-31','2026-07-09','2026-07-09',0),
(3010,'SEARCH-010',9001,2002,9902,9912,'Studio cho thuê trung tâm','Có ban công',15000000,35,'10 Võ Thị Sáu',10.786,106.705,1,1,8,'Seller','0901000010','ACTIVE','2026-07-10','2099-12-31','2026-07-10','2026-07-10',0),
(3011,'SEARCH-011',9001,2001,9902,9913,'Căn hộ Thảo Điền ven sông','Khu compound yên tĩnh',6500000000,125,'11 Nguyễn Văn Hưởng',10.810,106.730,3,3,22,'Seller','0901000011','ACTIVE','2026-07-11','2099-12-31','2026-07-11','2026-07-11',0),
(3012,'SEARCH-012',9001,2002,9902,9913,'Biệt thự Thảo Điền cho thuê','Sân vườn lớn',85000000,300,'12 Quốc Hương',10.812,106.732,5,5,3,'Seller','0901000012','ACTIVE','2026-07-12','2099-12-31','2026-07-12','2026-07-12',0),
(3013,'SEARCH-013',9001,2003,9902,9913,'Đất nền Thủ Đức','Gần tuyến metro',7200000000,150,'13 Võ Nguyên Giáp',10.820,106.760,NULL,NULL,NULL,'Seller','0901000013','ACTIVE','2026-07-13','2099-12-31','2026-07-13','2026-07-13',0),
(3014,'SEARCH-014',9001,2001,9902,9913,'Căn hộ hai phòng ngủ Thảo Điền','Đầy đủ tiện ích',4800000000,88,'14 Xuân Thủy',10.805,106.735,2,2,15,'Seller','0901000014','ACTIVE','2026-07-14','2099-12-31','2026-07-14','2026-07-14',0),
(3015,'SEARCH-015',9001,2002,9902,9913,'Căn hộ dịch vụ cho thuê','Dọn phòng hàng tuần',28000000,55,'15 Trần Não',10.800,106.728,1,1,10,'Seller','0901000015','ACTIVE','2026-07-15','2099-12-31','2026-07-15','2026-07-15',0),
(3016,'SEARCH-016',9001,2001,9902,9913,'Căn hộ sân vườn','Không gian xanh',7500000000,140,'16 Nguyễn Cơ Thạch',10.795,106.725,3,3,5,'Seller','0901000016','ACTIVE','2026-07-16','2099-12-31','2026-07-16','2026-07-16',0),
(3017,'SEARCH-017',9001,2003,9902,9913,'Đất thương mại Thủ Đức','Mặt tiền đường lớn',15000000000,250,'17 Mai Chí Thọ',10.790,106.750,NULL,NULL,NULL,'Seller','0901000017','ACTIVE','2026-07-17','2099-12-31','2026-07-17','2026-07-17',0),
(3018,'SEARCH-018',9001,2001,9902,9913,'Duplex gần metro','Trần cao thoáng',9200000000,165,'18 Xa lộ Hà Nội',10.815,106.755,4,3,28,'Seller','0901000018','ACTIVE','2026-07-18','2099-12-31','2026-07-18','2026-07-18',0),
(3019,'SEARCH-019',9001,2001,9903,9921,'Căn hộ phố cổ Hà Nội','Gần hồ Hoàn Kiếm',6800000000,72,'19 Hàng Bạc',21.034,105.852,2,2,6,'Seller','0901000019','ACTIVE','2026-07-19','2099-12-31','2026-07-19','2026-07-19',0),
(3020,'SEARCH-020',9001,2002,9903,9921,'Nhà phố cổ cho thuê','Phù hợp kinh doanh',60000000,100,'20 Hàng Đào',21.032,105.850,3,3,4,'Seller','0901000020','ACTIVE','2026-07-20','2099-12-31','2026-07-20','2026-07-20',0),
(3021,'SEARCH-021',9001,2003,9903,9921,'Đất trung tâm Hoàn Kiếm','Vị trí hiếm',20000000000,90,'21 Trần Nhật Duật',21.040,105.855,NULL,NULL,NULL,'Seller','0901000021','ACTIVE','2026-07-21','2099-12-31','2026-07-21','2026-07-21',0),
(3022,'SEARCH-022',9001,2001,9903,9921,'Căn hộ view hồ','Nội thất cao cấp',10500000000,130,'22 Lý Thái Tổ',21.030,105.856,3,2,14,'Seller','0901000022','ACTIVE','2026-07-22','2099-12-31','2026-07-22','2026-07-22',0),
(3023,'SEARCH-023',9001,2002,9903,9921,'Studio phố cổ cho thuê','Đi bộ ra hồ',18000000,32,'23 Cầu Gỗ',21.033,105.854,1,1,5,'Seller','0901000023','ACTIVE','2026-07-23','2099-12-31','2026-07-23','2026-07-23',0),
(3024,'SEARCH-024',9001,2001,9903,9921,'Căn hộ cải tạo phố cổ','Thiết kế hiện đại',5200000000,68,'24 Hàng Mắm',21.036,105.851,2,1,3,'Seller','0901000024','ACTIVE','2026-07-24','2099-12-31','2026-07-24','2026-07-24',0),
(3025,'SEARCH-025',9001,2001,9902,9911,'Tin active đã hết hạn','Không được xuất hiện',1000000000,40,'25 Nguyễn Huệ',10.775,106.701,1,1,5,'Seller','0901000025','ACTIVE','2020-01-01','2020-02-01','2020-01-01','2020-01-01',0),
(3026,'SEARCH-026',9001,2002,9902,9913,'Tin thuê đã hết hạn','Không được xuất hiện',10000000,30,'26 Thảo Điền',10.810,106.730,1,1,4,'Seller','0901000026','ACTIVE','2020-01-01','2020-02-01','2020-01-02','2020-01-02',0),
(3027,'SEARCH-027',9001,2001,9902,9911,'Tin đang chờ duyệt','Không được xuất hiện',2000000000,60,'27 Lê Lợi',10.774,106.699,2,1,7,'Seller','0901000027','PENDING',NULL,NULL,'2026-07-27','2026-07-27',0),
(3028,'SEARCH-028',9001,2001,9902,9912,'Tin bị từ chối','Không được xuất hiện',2100000000,62,'28 Hai Bà Trưng',10.780,106.700,2,1,8,'Seller','0901000028','REJECTED',NULL,NULL,'2026-07-28','2026-07-28',0),
(3029,'SEARCH-029',9001,2003,9902,9913,'Tin đã ẩn','Không được xuất hiện',7000000000,140,'29 Thảo Điền',10.810,106.735,NULL,NULL,NULL,'Seller','0901000029','INACTIVE',NULL,NULL,'2026-07-29','2026-07-29',0),
(3030,'SEARCH-030',9001,2002,9903,9921,'Tin nháp','Không được xuất hiện',16000000,36,'30 Hàng Bạc',21.034,105.852,1,1,4,'Seller','0901000030','DRAFT',NULL,NULL,'2026-07-30','2026-07-30',0);
