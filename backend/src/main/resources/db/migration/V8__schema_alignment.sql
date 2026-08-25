-- Keep the physical type aligned with the JPA String mapping so Hibernate's
-- production `ddl-auto=validate` check can detect real drift without a false positive.
ALTER TABLE refresh_tokens
    MODIFY COLUMN token_hash VARCHAR(64) NOT NULL;
