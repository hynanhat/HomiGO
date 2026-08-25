package com.batdongsan.service;

import com.batdongsan.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class RefreshTokenCleanupService {
    private final RefreshTokenRepository tokens;
    private final int revokedRetentionDays;

    public RefreshTokenCleanupService(RefreshTokenRepository tokens,
                                      @Value("${jwt.revoked-token-retention-days:7}") int revokedRetentionDays) {
        this.tokens = tokens;
        this.revokedRetentionDays = revokedRetentionDays;
    }

    @Transactional
    public int cleanup(LocalDateTime now) {
        return tokens.deleteExpiredOrRevokedBefore(now, now.minusDays(revokedRetentionDays));
    }

    @Scheduled(cron = "${jwt.refresh-token-cleanup-cron:0 30 2 * * *}", zone = "${app.business-zone:Asia/Ho_Chi_Minh}")
    @Transactional
    public void cleanupScheduled() {
        cleanup(LocalDateTime.now());
    }
}
