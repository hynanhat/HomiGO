CREATE TABLE wards (
    id BIGINT NOT NULL AUTO_INCREMENT,
    district_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    CONSTRAINT pk_wards PRIMARY KEY (id),
    CONSTRAINT uk_wards_code UNIQUE (code),
    CONSTRAINT fk_wards_district FOREIGN KEY (district_id) REFERENCES districts (id)
) ENGINE=InnoDB;

CREATE INDEX idx_wards_district ON wards (district_id);

ALTER TABLE listings
    MODIFY COLUMN status ENUM('DRAFT','PENDING','ACTIVE','REJECTED','EXPIRED','INACTIVE') NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN public_code VARCHAR(32),
    ADD COLUMN ward_id BIGINT,
    ADD COLUMN address VARCHAR(500),
    ADD COLUMN latitude DOUBLE,
    ADD COLUMN longitude DOUBLE,
    ADD COLUMN bedrooms INT,
    ADD COLUMN bathrooms INT,
    ADD COLUMN floors INT,
    ADD COLUMN direction VARCHAR(50),
    ADD COLUMN furnishing VARCHAR(100),
    ADD COLUMN legal_status VARCHAR(100),
    ADD COLUMN contact_name VARCHAR(100),
    ADD COLUMN contact_phone VARCHAR(20),
    ADD COLUMN rejection_reason VARCHAR(1000),
    ADD COLUMN approved_by BIGINT,
    ADD COLUMN approved_at DATETIME(6),
    ADD COLUMN published_at DATETIME(6),
    ADD COLUMN updated_at DATETIME(6),
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

UPDATE listings
SET public_code = CONCAT('HMG-', LPAD(id, 12, '0')),
    address = 'Chưa cập nhật',
    contact_name = 'Chưa cập nhật',
    contact_phone = '00000000',
    updated_at = COALESCE(created_at, CURRENT_TIMESTAMP(6));

ALTER TABLE listings
    MODIFY COLUMN public_code VARCHAR(32) NOT NULL,
    MODIFY COLUMN address VARCHAR(500) NOT NULL,
    MODIFY COLUMN contact_name VARCHAR(100) NOT NULL,
    MODIFY COLUMN contact_phone VARCHAR(20) NOT NULL,
    ADD CONSTRAINT uk_listings_public_code UNIQUE (public_code),
    ADD CONSTRAINT fk_listings_ward FOREIGN KEY (ward_id) REFERENCES wards (id),
    ADD CONSTRAINT fk_listings_approved_by FOREIGN KEY (approved_by) REFERENCES users (id);

CREATE INDEX idx_listings_ward_status ON listings (ward_id, status);

ALTER TABLE listing_images
    ADD COLUMN storage_key VARCHAR(255),
    ADD COLUMN content_type VARCHAR(100),
    ADD COLUMN size_bytes BIGINT,
    ADD COLUMN created_at DATETIME(6);

UPDATE listing_images
SET storage_key = SUBSTRING_INDEX(url, '/', -1),
    content_type = 'image/jpeg',
    size_bytes = 0,
    created_at = CURRENT_TIMESTAMP(6);

ALTER TABLE listing_images
    MODIFY COLUMN storage_key VARCHAR(255) NOT NULL,
    MODIFY COLUMN content_type VARCHAR(100) NOT NULL,
    MODIFY COLUMN size_bytes BIGINT NOT NULL,
    MODIFY COLUMN created_at DATETIME(6) NOT NULL,
    ADD CONSTRAINT uk_listing_images_sort UNIQUE (listing_id, sort_order);

CREATE TABLE listing_status_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    listing_id BIGINT NOT NULL,
    from_status ENUM('DRAFT','PENDING','ACTIVE','REJECTED','EXPIRED','INACTIVE'),
    to_status ENUM('DRAFT','PENDING','ACTIVE','REJECTED','EXPIRED','INACTIVE') NOT NULL,
    changed_by BIGINT NOT NULL,
    reason VARCHAR(1000),
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_listing_status_history PRIMARY KEY (id),
    CONSTRAINT fk_listing_history_listing FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE,
    CONSTRAINT fk_listing_history_user FOREIGN KEY (changed_by) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE INDEX idx_listing_history_listing_created ON listing_status_history (listing_id, created_at);
