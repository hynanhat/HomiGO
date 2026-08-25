CREATE TABLE ai_daily_usage (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    business_date DATE NOT NULL,
    successful_count INT NOT NULL DEFAULT 0,
    reserved_count INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_ai_daily_usage_user_date UNIQUE (user_id, business_date),
    CONSTRAINT fk_ai_daily_usage_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_ai_daily_usage_successful CHECK (successful_count BETWEEN 0 AND 5),
    CONSTRAINT chk_ai_daily_usage_reserved CHECK (reserved_count BETWEEN 0 AND 5),
    CONSTRAINT chk_ai_daily_usage_total CHECK (successful_count + reserved_count <= 5)
) ENGINE=InnoDB;

CREATE TABLE ai_description_reservations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    usage_id BIGINT NOT NULL,
    reservation_token CHAR(36) NOT NULL,
    status ENUM('RESERVED', 'SUCCEEDED', 'RELEASED', 'EXPIRED') NOT NULL,
    reserved_at DATETIME(6) NOT NULL,
    lease_expires_at DATETIME(6) NOT NULL,
    completed_at DATETIME(6) NULL,
    release_reason VARCHAR(64) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_ai_description_reservation_token UNIQUE (reservation_token),
    CONSTRAINT fk_ai_description_reservation_usage FOREIGN KEY (usage_id) REFERENCES ai_daily_usage (id) ON DELETE CASCADE,
    INDEX idx_ai_reservation_usage_status_expiry (usage_id, status, lease_expires_at),
    INDEX idx_ai_reservation_status_expiry (status, lease_expires_at)
) ENGINE=InnoDB;
