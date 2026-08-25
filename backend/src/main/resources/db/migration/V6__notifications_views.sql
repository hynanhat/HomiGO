CREATE TABLE notifications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type ENUM('LISTING_SUBMITTED', 'LISTING_APPROVED', 'LISTING_REJECTED', 'LISTING_EXPIRED') NOT NULL,
    title VARCHAR(160) NOT NULL,
    message VARCHAR(500) NOT NULL,
    listing_id BIGINT,
    read_at DATETIME(6),
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_notifications PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_listing FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE SET NULL
);

CREATE INDEX idx_notifications_user_created
    ON notifications (user_id, created_at DESC);

CREATE INDEX idx_notifications_user_read_created
    ON notifications (user_id, read_at, created_at DESC);

CREATE TABLE listing_views (
    id BIGINT NOT NULL AUTO_INCREMENT,
    listing_id BIGINT NOT NULL,
    viewer_hash VARCHAR(64) NOT NULL,
    viewed_on DATE NOT NULL,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_listing_views PRIMARY KEY (id),
    CONSTRAINT uk_listing_views_listing_viewer_date UNIQUE (listing_id, viewer_hash, viewed_on),
    CONSTRAINT fk_listing_views_listing FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE
);

CREATE INDEX idx_listing_views_listing_date
    ON listing_views (listing_id, viewed_on);
