-- Clean cutover to Vietnam's two-level administrative model.
-- This migration is intentionally destructive and may run only while business data is empty.
SET @homigo_business_row_count =
    (SELECT COUNT(*) FROM listings) + (SELECT COUNT(*) FROM projects);
SET @homigo_preflight_sql = IF(
    @homigo_business_row_count = 0,
    'SELECT 1',
    'SELECT * FROM homigo_clean_cutover_requires_empty_listings_and_projects'
);
PREPARE homigo_preflight_statement FROM @homigo_preflight_sql;
EXECUTE homigo_preflight_statement;
DEALLOCATE PREPARE homigo_preflight_statement;

CREATE TABLE administrative_dataset_releases (
    id BIGINT NOT NULL AUTO_INCREMENT,
    dataset_version VARCHAR(100) NOT NULL,
    authority VARCHAR(255) NOT NULL,
    document_number VARCHAR(100) NOT NULL,
    effective_date DATE NOT NULL,
    retrieved_at DATETIME(6) NOT NULL,
    source_urls_json JSON NOT NULL,
    attribution VARCHAR(500) NOT NULL,
    raw_sha256 CHAR(64) NOT NULL,
    normalized_sha256 CHAR(64) NOT NULL,
    transform_version VARCHAR(100) NOT NULL,
    expected_province_count INT NOT NULL,
    expected_commune_count INT NOT NULL,
    actual_province_count INT,
    actual_commune_count INT,
    status ENUM('STAGED','VALIDATED','ACTIVE','FAILED','SUPERSEDED') NOT NULL,
    validation_summary_json JSON,
    created_by BIGINT,
    validated_by BIGINT,
    activated_by BIGINT,
    created_at DATETIME(6) NOT NULL,
    validated_at DATETIME(6),
    activated_at DATETIME(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT pk_administrative_dataset_releases PRIMARY KEY (id),
    CONSTRAINT uk_administrative_dataset_version UNIQUE (dataset_version),
    CONSTRAINT fk_administrative_dataset_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_administrative_dataset_validated_by FOREIGN KEY (validated_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_administrative_dataset_activated_by FOREIGN KEY (activated_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_administrative_dataset_counts CHECK (
        expected_province_count > 0 AND expected_commune_count > 0
        AND (actual_province_count IS NULL OR actual_province_count >= 0)
        AND (actual_commune_count IS NULL OR actual_commune_count >= 0)
    )
) ENGINE=InnoDB;

CREATE TABLE administrative_catalog_state (
    singleton_key TINYINT NOT NULL,
    active_release_id BIGINT,
    updated_by BIGINT,
    updated_at DATETIME(6) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT pk_administrative_catalog_state PRIMARY KEY (singleton_key),
    CONSTRAINT chk_administrative_catalog_singleton CHECK (singleton_key = 1),
    CONSTRAINT fk_administrative_catalog_active_release FOREIGN KEY (active_release_id) REFERENCES administrative_dataset_releases (id),
    CONSTRAINT fk_administrative_catalog_updated_by FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO administrative_catalog_state (singleton_key, active_release_id, updated_by, updated_at, version)
VALUES (1, NULL, NULL, CURRENT_TIMESTAMP(6), 0);

CREATE TABLE administrative_provinces (
    id BIGINT NOT NULL AUTO_INCREMENT,
    dataset_release_id BIGINT NOT NULL,
    official_code VARCHAR(10) NOT NULL,
    official_name VARCHAR(255) NOT NULL,
    unit_type ENUM('PROVINCE','CENTRAL_MUNICIPALITY') NOT NULL,
    catalog_status ENUM('ACTIVE','INACTIVE','SUPERSEDED') NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_administrative_provinces PRIMARY KEY (id),
    CONSTRAINT uk_administrative_province_release_code UNIQUE (dataset_release_id, official_code),
    CONSTRAINT uk_administrative_province_id_release UNIQUE (id, dataset_release_id),
    CONSTRAINT fk_administrative_province_release FOREIGN KEY (dataset_release_id) REFERENCES administrative_dataset_releases (id)
) ENGINE=InnoDB;

CREATE INDEX idx_administrative_province_catalog
    ON administrative_provinces (dataset_release_id, catalog_status, official_name, id);

CREATE TABLE commune_units (
    id BIGINT NOT NULL AUTO_INCREMENT,
    dataset_release_id BIGINT NOT NULL,
    administrative_province_id BIGINT NOT NULL,
    official_code VARCHAR(10) NOT NULL,
    official_name VARCHAR(255) NOT NULL,
    unit_type ENUM('COMMUNE','WARD','SPECIAL_ZONE') NOT NULL,
    catalog_status ENUM('ACTIVE','INACTIVE','SUPERSEDED') NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_commune_units PRIMARY KEY (id),
    CONSTRAINT uk_commune_release_code UNIQUE (dataset_release_id, official_code),
    CONSTRAINT uk_commune_id_province UNIQUE (id, administrative_province_id),
    CONSTRAINT fk_commune_release FOREIGN KEY (dataset_release_id) REFERENCES administrative_dataset_releases (id),
    CONSTRAINT fk_commune_province_release FOREIGN KEY (administrative_province_id, dataset_release_id)
        REFERENCES administrative_provinces (id, dataset_release_id)
) ENGINE=InnoDB;

CREATE INDEX idx_commune_catalog
    ON commune_units (administrative_province_id, catalog_status, official_name, id);

ALTER TABLE listings
    ADD COLUMN administrative_province_id BIGINT NOT NULL,
    ADD COLUMN commune_unit_id BIGINT NOT NULL;

ALTER TABLE projects
    ADD COLUMN administrative_province_id BIGINT NOT NULL,
    ADD COLUMN commune_unit_id BIGINT NOT NULL;

ALTER TABLE listings
    ADD CONSTRAINT fk_listings_administrative_province FOREIGN KEY (administrative_province_id) REFERENCES administrative_provinces (id),
    ADD CONSTRAINT fk_listings_current_location FOREIGN KEY (commune_unit_id, administrative_province_id)
        REFERENCES commune_units (id, administrative_province_id);

ALTER TABLE projects
    ADD CONSTRAINT fk_projects_administrative_province FOREIGN KEY (administrative_province_id) REFERENCES administrative_provinces (id),
    ADD CONSTRAINT fk_projects_current_location FOREIGN KEY (commune_unit_id, administrative_province_id)
        REFERENCES commune_units (id, administrative_province_id);

CREATE INDEX idx_listings_current_province_status ON listings (administrative_province_id, status);
CREATE INDEX idx_listings_current_commune_status ON listings (commune_unit_id, status);
CREATE INDEX idx_projects_current_province_status ON projects (administrative_province_id, status);
CREATE INDEX idx_projects_current_commune_status ON projects (commune_unit_id, status);

ALTER TABLE listings
    DROP FOREIGN KEY fk_listings_ward,
    DROP FOREIGN KEY fk_listings_district,
    DROP INDEX idx_listings_ward_status,
    DROP INDEX idx_listings_district_status,
    DROP COLUMN ward_id,
    DROP COLUMN district_id;

ALTER TABLE projects
    DROP FOREIGN KEY fk_projects_ward,
    DROP FOREIGN KEY fk_projects_district,
    DROP INDEX idx_projects_district_status,
    DROP COLUMN ward_id,
    DROP COLUMN district_id;

DROP TABLE wards;
DROP TABLE districts;
DROP TABLE provinces;
