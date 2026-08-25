package com.batdongsan.service.ai;

import com.batdongsan.dto.ai.AiDescriptionQuotaRes;
import com.batdongsan.entity.User;
import com.batdongsan.entity.UserRole;
import com.batdongsan.entity.UserStatus;
import com.batdongsan.exception.ApiException;
import com.batdongsan.exception.ErrorCode;
import com.batdongsan.repository.AiDailyUsageRepository;
import com.batdongsan.repository.AiDescriptionReservationRepository;
import com.batdongsan.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "app.ai.gemini.enabled=true",
        "app.ai.gemini.api-key=test-key"
})
class AiQuotaServiceTest {
    private static final String SELLER = "ai-quota-seller@homigo.test";
    private static final String OTHER = "ai-quota-other@homigo.test";

    @Autowired private AiQuotaService quotaService;
    @Autowired private AiDescriptionReservationRepository reservations;
    @Autowired private AiDailyUsageRepository usages;
    @Autowired private UserRepository users;

    @BeforeEach
    void setUp() {
        reservations.deleteAll();
        usages.deleteAll();
        deleteUser(SELLER); deleteUser(OTHER);
        users.save(user(SELLER, UserRole.SELLER));
        users.save(user(OTHER, UserRole.SELLER));
    }

    @AfterEach
    void cleanUp() {
        reservations.deleteAll();
        usages.deleteAll();
        deleteUser(SELLER); deleteUser(OTHER);
    }

    @Test
    void onlySuccessfulFinalizationConsumesDailyAttemptAndIsIdempotent() {
        AiQuotaService.ReservationLease released = quotaService.reserve(SELLER);
        quotaService.release(released.token(), "PROVIDER_FAILURE");
        assertEquals(5, quotaService.getQuota(SELLER).remainingAttempts());

        AiQuotaService.ReservationLease success = quotaService.reserve(SELLER);
        AiDescriptionQuotaRes first = quotaService.finalizeSuccess(success.token());
        AiDescriptionQuotaRes repeated = quotaService.finalizeSuccess(success.token());

        assertEquals(1, first.successfulAttempts());
        assertEquals(1, repeated.successfulAttempts());
        assertEquals(4, repeated.remainingAttempts());
        assertEquals(5, quotaService.getQuota(OTHER).remainingAttempts());
    }

    @Test
    void tenConcurrentReservationsExposeExactlyFiveSlots() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        CountDownLatch ready = new CountDownLatch(10);
        CountDownLatch start = new CountDownLatch(1);
        try {
            List<Future<Object>> futures = new ArrayList<>();
            for (int i = 0; i < 10; i++) {
                futures.add(executor.submit(() -> {
                    ready.countDown(); start.await();
                    try { return quotaService.reserve(SELLER); }
                    catch (ApiException error) { return error; }
                }));
            }
            assertTrue(ready.await(5, TimeUnit.SECONDS));
            start.countDown();

            int leases = 0; int temporaryRejections = 0;
            List<AiQuotaService.ReservationLease> successfulLeases = new ArrayList<>();
            for (Future<Object> future : futures) {
                Object result = future.get(10, TimeUnit.SECONDS);
                if (result instanceof AiQuotaService.ReservationLease lease) {
                    leases++; successfulLeases.add(lease);
                } else if (result instanceof ApiException error
                        && error.getErrorCode() == ErrorCode.AI_QUOTA_TEMPORARILY_RESERVED) {
                    temporaryRejections++;
                }
            }

            assertEquals(5, leases);
            assertEquals(5, temporaryRejections);
            AiDescriptionQuotaRes reservedQuota = quotaService.getQuota(SELLER);
            assertEquals(5, reservedQuota.remainingAttempts());
            assertEquals(0, reservedQuota.availableNow());

            successfulLeases.forEach(lease -> quotaService.finalizeSuccess(lease.token()));
            AiDescriptionQuotaRes exhausted = quotaService.getQuota(SELLER);
            assertEquals(5, exhausted.successfulAttempts());
            assertEquals(0, exhausted.remainingAttempts());
            ApiException limit = assertThrows(ApiException.class, () -> quotaService.reserve(SELLER));
            assertEquals(ErrorCode.AI_DAILY_LIMIT_REACHED, limit.getErrorCode());
        } finally {
            executor.shutdownNow();
        }
    }

    private void deleteUser(String email) {
        users.findByEmail(email).ifPresent(users::delete);
    }

    private User user(String email, UserRole role) {
        User user = new User();
        user.setName("AI quota test"); user.setEmail(email); user.setPasswordHash("not-used");
        user.setRole(role); user.setStatus(UserStatus.ACTIVE);
        return user;
    }
}
