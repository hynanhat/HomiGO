ALTER TABLE listings
    MODIFY COLUMN status ENUM('DRAFT','PENDING','ACTIVE','REJECTED','EXPIRED','INACTIVE','REMOVED') NOT NULL DEFAULT 'DRAFT',
    MODIFY COLUMN rejection_reason VARCHAR(1000),
    ADD COLUMN removal_reason VARCHAR(500),
    ADD COLUMN removed_by BIGINT,
    ADD COLUMN removed_at DATETIME(6),
    ADD CONSTRAINT fk_listings_removed_by FOREIGN KEY (removed_by) REFERENCES users (id);

ALTER TABLE listing_status_history
    MODIFY COLUMN from_status ENUM('DRAFT','PENDING','ACTIVE','REJECTED','EXPIRED','INACTIVE','REMOVED'),
    MODIFY COLUMN to_status ENUM('DRAFT','PENDING','ACTIVE','REJECTED','EXPIRED','INACTIVE','REMOVED') NOT NULL,
    MODIFY COLUMN reason VARCHAR(1000);

ALTER TABLE notifications
    MODIFY COLUMN type ENUM(
        'LISTING_SUBMITTED',
        'LISTING_APPROVED',
        'LISTING_REJECTED',
        'LISTING_EXPIRED',
        'LISTING_REMOVED'
    ) NOT NULL;

ALTER TABLE listing_images
    ADD COLUMN client_upload_id VARCHAR(36),
    ADD CONSTRAINT uk_listing_images_client_upload UNIQUE (listing_id, client_upload_id);
