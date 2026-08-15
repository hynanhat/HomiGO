ALTER TABLE projects
    ADD COLUMN slug VARCHAR(160),
    ADD COLUMN ward_id BIGINT,
    ADD COLUMN address VARCHAR(500),
    ADD COLUMN latitude DOUBLE,
    ADD COLUMN longitude DOUBLE,
    ADD COLUMN description TEXT,
    ADD COLUMN price_from DECIMAL(38, 2),
    ADD COLUMN price_to DECIMAL(38, 2),
    ADD COLUMN created_at DATETIME(6),
    ADD COLUMN updated_at DATETIME(6);

UPDATE projects
SET slug = CONCAT('project-', id),
    investor = COALESCE(investor, 'Chua cap nhat'),
    address = 'Chua cap nhat',
    status = COALESCE(status, 'PLANNING'),
    description = 'Chua cap nhat',
    created_at = CURRENT_TIMESTAMP(6),
    updated_at = CURRENT_TIMESTAMP(6);

ALTER TABLE projects
    DROP FOREIGN KEY fk_projects_district;

ALTER TABLE projects
    MODIFY COLUMN slug VARCHAR(160) NOT NULL,
    MODIFY COLUMN investor VARCHAR(255) NOT NULL,
    MODIFY COLUMN district_id BIGINT NOT NULL,
    MODIFY COLUMN address VARCHAR(500) NOT NULL,
    MODIFY COLUMN status VARCHAR(30) NOT NULL,
    MODIFY COLUMN description TEXT NOT NULL,
    MODIFY COLUMN created_at DATETIME(6) NOT NULL,
    MODIFY COLUMN updated_at DATETIME(6) NOT NULL,
    ADD CONSTRAINT uk_projects_slug UNIQUE (slug),
    ADD CONSTRAINT fk_projects_district FOREIGN KEY (district_id) REFERENCES districts (id),
    ADD CONSTRAINT fk_projects_ward FOREIGN KEY (ward_id) REFERENCES wards (id),
    DROP COLUMN price_range;

CREATE INDEX idx_projects_status_updated_at ON projects (status, updated_at);
