package com.batdongsan.service;

import com.batdongsan.repository.RefreshTokenRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenCleanupServiceTest {

    @Mock
    private RefreshTokenRepository tokens;

    @Test
    void removesExpiredTokensAndRevokedTokensPastRetention() {
        RefreshTokenCleanupService service = new RefreshTokenCleanupService(tokens, 7);
        LocalDateTime now = LocalDateTime.of(2026, 8, 17, 17, 0);
        when(tokens.deleteExpiredOrRevokedBefore(now, now.minusDays(7))).thenReturn(4);

        assertEquals(4, service.cleanup(now));
        verify(tokens).deleteExpiredOrRevokedBefore(now, now.minusDays(7));
    }
}
