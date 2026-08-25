CREATE TABLE seller_upgrade_payments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    order_code VARCHAR(40) NOT NULL,
    user_id BIGINT NOT NULL,
    purpose ENUM('SELLER_UPGRADE') NOT NULL,
    amount BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED') NOT NULL,
    provider_order_id VARCHAR(64),
    provider_transaction_id VARCHAR(64),
    failure_reason VARCHAR(255),
    expires_at DATETIME(6) NOT NULL,
    completed_at DATETIME(6),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT pk_seller_upgrade_payments PRIMARY KEY (id),
    CONSTRAINT uk_seller_upgrade_payments_order_code UNIQUE (order_code),
    CONSTRAINT uk_seller_upgrade_payments_provider_order UNIQUE (provider_order_id),
    CONSTRAINT uk_seller_upgrade_payments_provider_transaction UNIQUE (provider_transaction_id),
    CONSTRAINT chk_seller_upgrade_payments_amount CHECK (amount > 0),
    CONSTRAINT fk_seller_upgrade_payments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_seller_upgrade_payments_user_created
    ON seller_upgrade_payments (user_id, created_at DESC);

CREATE INDEX idx_seller_upgrade_payments_user_status_expiry
    ON seller_upgrade_payments (user_id, status, expires_at);
