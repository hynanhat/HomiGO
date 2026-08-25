package com.batdongsan.service.ai;

import com.batdongsan.entity.AiDescriptionReservationStatus;
import com.batdongsan.repository.AiDescriptionReservationRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class AiQuotaCleanupJob {
    private static final int BATCH_SIZE = 100;

    private final AiDescriptionReservationRepository reservations;
    private final AiQuotaService quotaService;
    private final Clock clock;

    public AiQuotaCleanupJob(AiDescriptionReservationRepository reservations,
                             AiQuotaService quotaService,
                             Clock clock) {
        this.reservations = reservations;
        this.quotaService = quotaService;
        this.clock = clock;
    }

    @Scheduled(cron = "${app.ai.gemini.cleanup-cron:0 * * * * *}")
    public void releaseExpiredReservations() {
        List<String> tokens = reservations.findExpiredTokens(
                AiDescriptionReservationStatus.RESERVED,
                LocalDateTime.now(clock),
                PageRequest.of(0, BATCH_SIZE));
        tokens.forEach(quotaService::expireReservation);
    }
}
