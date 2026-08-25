package com.batdongsan.dto.ai;

import java.time.OffsetDateTime;

public record AiDescriptionQuotaRes(
        boolean enabled,
        int limit,
        int successfulAttempts,
        int remainingAttempts,
        int availableNow,
        OffsetDateTime resetAt,
        OffsetDateTime retryAt) {
}
