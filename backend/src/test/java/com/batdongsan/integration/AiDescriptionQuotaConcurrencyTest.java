package com.batdongsan.integration;

import com.batdongsan.dto.ai.AiDescriptionQuotaRes;
import com.batdongsan.entity.AiDescriptionReservation;
import com.batdongsan.entity.User;
import com.batdongsan.entity.UserRole;
import com.batdongsan.entity.UserStatus;
import com.batdongsan.exception.ApiException;
import com.batdongsan.repository.AiDailyUsageRepository;
import com.batdongsan.repository.AiDescriptionReservationRepository;
import com.batdongsan.repository.UserRepository;
import com.batdongsan.service.ai.AiQuotaService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class AiDescriptionQuotaConcurrencyTest {
    private static final String SELLER = "mysql-ai-seller@homigo.test";
    private static final String OTHER = "mysql-ai-other@homigo.test";

    @Container
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4")
            .withDatabaseName("homigo_ai_test").withUsername("homigo").withPassword("homigo_test_password");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("spring.datasource.driver-class-name", MYSQL::getDriverClassName);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("app.ai.gemini.enabled", () -> "true");
        registry.add("app.ai.gemini.api-key", () -> "test-key");
    }

    @Autowired private AiQuotaService quota;
    @Autowired private AiDescriptionReservationRepository reservations;
    @Autowired private AiDailyUsageRepository usages;
    @Autowired private UserRepository users;

    @BeforeEach
    void setUp() {
        reservations.deleteAll(); usages.deleteAll(); deleteUser(SELLER); deleteUser(OTHER);
        users.save(user(SELLER)); users.save(user(OTHER));
    }

    @AfterEach
    void cleanUp() {
        reservations.deleteAll(); usages.deleteAll(); deleteUser(SELLER); deleteUser(OTHER);
    }

    @Test
    void concurrencyFailuresExpiryAndSellerIsolationRemainConsistent() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<AiQuotaService.ReservationLease>> futures = new ArrayList<>();
        try {
            for (int i = 0; i < 10; i++) futures.add(executor.submit(() -> {
                start.await();
                try { return quota.reserve(SELLER); } catch (ApiException ignored) { return null; }
            }));
            start.countDown();
            List<AiQuotaService.ReservationLease> leases = new ArrayList<>();
            for (Future<AiQuotaService.ReservationLease> future : futures) {
                AiQuotaService.ReservationLease lease = future.get(15, TimeUnit.SECONDS);
                if (lease != null) leases.add(lease);
            }
            assertEquals(5, leases.size());

            quota.finalizeSuccess(leases.get(0).token());
            quota.finalizeSuccess(leases.get(1).token());
            quota.release(leases.get(2).token(), "PROVIDER_FAILURE");
            quota.release(leases.get(3).token(), "INVALID_RESPONSE");

            AiDescriptionReservation crashed = reservations.findAll().stream()
                    .filter(item -> item.getReservationToken().equals(leases.get(4).token()))
                    .findFirst().orElseThrow();
            crashed.setLeaseExpiresAt(LocalDateTime.now().minusSeconds(1));
            reservations.saveAndFlush(crashed);
            quota.expireReservation(leases.get(4).token());

            for (int i = 0; i < 3; i++) quota.finalizeSuccess(quota.reserve(SELLER).token());
            AiDescriptionQuotaRes exhausted = quota.getQuota(SELLER);
            assertEquals(5, exhausted.successfulAttempts());
            assertEquals(0, exhausted.remainingAttempts());
            assertEquals(5, quota.getQuota(OTHER).remainingAttempts());
        } finally {
            executor.shutdownNow();
        }
    }

    private void deleteUser(String email) { users.findByEmail(email).ifPresent(users::delete); }
    private User user(String email) {
        User user = new User(); user.setName("MySQL AI test"); user.setEmail(email); user.setPasswordHash("not-used");
        user.setRole(UserRole.SELLER); user.setStatus(UserStatus.ACTIVE); return user;
    }
}
