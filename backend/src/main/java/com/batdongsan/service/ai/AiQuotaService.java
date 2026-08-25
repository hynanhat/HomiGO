package com.batdongsan.service.ai;

import com.batdongsan.config.GeminiProperties;
import com.batdongsan.dto.ai.AiDescriptionQuotaRes;
import com.batdongsan.entity.*;
import com.batdongsan.exception.ApiException;
import com.batdongsan.exception.ErrorCode;
import com.batdongsan.exception.ResourceNotFoundException;
import com.batdongsan.repository.AiDailyUsageRepository;
import com.batdongsan.repository.AiDescriptionReservationRepository;
import com.batdongsan.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class AiQuotaService {
    public static final int DAILY_LIMIT = 5;
    private static final DateTimeFormatter DISPLAY_TIME = DateTimeFormatter.ofPattern("HH:mm 'ngày' dd/MM/yyyy");

    private final AiDailyUsageRepository usages;
    private final AiDescriptionReservationRepository reservations;
    private final UserRepository users;
    private final GeminiProperties properties;
    private final Clock clock;
    private final ZoneId businessZone;

    public AiQuotaService(AiDailyUsageRepository usages,
                          AiDescriptionReservationRepository reservations,
                          UserRepository users,
                          GeminiProperties properties,
                          Clock clock,
                          ZoneId businessZone) {
        this.usages = usages;
        this.reservations = reservations;
        this.users = users;
        this.properties = properties;
        this.clock = clock;
        this.businessZone = businessZone;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ReservationLease reserve(String email) {
        User user = seller(email);
        LocalDate businessDate = LocalDate.now(clock);
        LocalDateTime now = LocalDateTime.now(clock);
        AiDailyUsage usage = lockedUsage(user, businessDate, now);
        expireLocked(usage, now);

        if (usage.getSuccessfulCount() >= DAILY_LIMIT) {
            throw new ApiException(ErrorCode.AI_DAILY_LIMIT_REACHED,
                    "Bạn đã dùng hết 5 lượt tạo mô tả hôm nay. Có thể sử dụng lại sau "
                            + resetAt(businessDate).format(DISPLAY_TIME) + ".");
        }
        if (usage.getSuccessfulCount() + usage.getReservedCount() >= DAILY_LIMIT) {
            throw new ApiException(ErrorCode.AI_QUOTA_TEMPORARILY_RESERVED);
        }

        AiDescriptionReservation reservation = new AiDescriptionReservation();
        reservation.setUsage(usage);
        reservation.setReservationToken(UUID.randomUUID().toString());
        reservation.setStatus(AiDescriptionReservationStatus.RESERVED);
        reservation.setReservedAt(now);
        reservation.setLeaseExpiresAt(now.plusSeconds(properties.reservationLeaseSeconds()));
        reservations.save(reservation);

        usage.setReservedCount(usage.getReservedCount() + 1);
        usages.save(usage);
        return new ReservationLease(reservation.getReservationToken(), businessDate, reservation.getLeaseExpiresAt());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AiDescriptionQuotaRes finalizeSuccess(String token) {
        LockedReservation locked = lockReservation(token);
        AiDailyUsage usage = locked.usage();
        AiDescriptionReservation reservation = locked.reservation();
        LocalDateTime now = LocalDateTime.now(clock);

        if (reservation.getStatus() == AiDescriptionReservationStatus.SUCCEEDED) {
            return snapshot(usage);
        }
        if (reservation.getStatus() != AiDescriptionReservationStatus.RESERVED) {
            throw new ApiException(ErrorCode.AI_INVALID_RESPONSE);
        }
        if (!reservation.getLeaseExpiresAt().isAfter(now)) {
            expire(usage, reservation, now);
            throw new ApiException(ErrorCode.AI_SERVICE_UNAVAILABLE,
                    "Phiên tạo mô tả đã hết hạn. Vui lòng thử lại.");
        }
        if (usage.getSuccessfulCount() >= DAILY_LIMIT || usage.getReservedCount() <= 0) {
            throw new ApiException(ErrorCode.AI_SERVICE_UNAVAILABLE);
        }

        reservation.setStatus(AiDescriptionReservationStatus.SUCCEEDED);
        reservation.setCompletedAt(now);
        usage.setReservedCount(usage.getReservedCount() - 1);
        usage.setSuccessfulCount(usage.getSuccessfulCount() + 1);
        reservations.save(reservation);
        usages.save(usage);
        return snapshot(usage);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void release(String token, String reason) {
        Long usageId = reservations.findUsageIdByToken(token).orElse(null);
        if (usageId == null) return;
        AiDailyUsage usage = usages.findByIdForUpdate(usageId).orElse(null);
        if (usage == null) return;
        AiDescriptionReservation reservation = reservations.findByTokenForUpdate(token).orElse(null);
        if (reservation == null || reservation.getStatus() != AiDescriptionReservationStatus.RESERVED) return;

        reservation.setStatus(AiDescriptionReservationStatus.RELEASED);
        reservation.setCompletedAt(LocalDateTime.now(clock));
        reservation.setReleaseReason(safeReason(reason));
        usage.setReservedCount(Math.max(0, usage.getReservedCount() - 1));
        reservations.save(reservation);
        usages.save(usage);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void expireReservation(String token) {
        Long usageId = reservations.findUsageIdByToken(token).orElse(null);
        if (usageId == null) return;
        AiDailyUsage usage = usages.findByIdForUpdate(usageId).orElse(null);
        if (usage == null) return;
        AiDescriptionReservation reservation = reservations.findByTokenForUpdate(token).orElse(null);
        LocalDateTime now = LocalDateTime.now(clock);
        if (reservation != null
                && reservation.getStatus() == AiDescriptionReservationStatus.RESERVED
                && !reservation.getLeaseExpiresAt().isAfter(now)) {
            expire(usage, reservation, now);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AiDescriptionQuotaRes getQuota(String email) {
        User user = seller(email);
        LocalDate businessDate = LocalDate.now(clock);
        LocalDateTime now = LocalDateTime.now(clock);
        AiDailyUsage usage = lockedUsage(user, businessDate, now);
        expireLocked(usage, now);
        return snapshot(usage);
    }

    private User seller(String email) {
        User user = users.findByEmailForUpdate(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));
        if (user.getRole() != UserRole.SELLER || user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(ErrorCode.ACCESS_DENIED,
                    "Chỉ người bán đang hoạt động mới có thể dùng tính năng này.");
        }
        return user;
    }

    private AiDailyUsage lockedUsage(User user, LocalDate date, LocalDateTime now) {
        usages.insertIfAbsent(user.getId(), date, now);
        return usages.findForUpdate(user.getId(), date)
                .orElseThrow(() -> new IllegalStateException("AI daily usage row was not created"));
    }

    private LockedReservation lockReservation(String token) {
        Long usageId = reservations.findUsageIdByToken(token)
                .orElseThrow(() -> new ApiException(ErrorCode.AI_INVALID_RESPONSE));
        AiDailyUsage usage = usages.findByIdForUpdate(usageId)
                .orElseThrow(() -> new ApiException(ErrorCode.AI_INVALID_RESPONSE));
        AiDescriptionReservation reservation = reservations.findByTokenForUpdate(token)
                .orElseThrow(() -> new ApiException(ErrorCode.AI_INVALID_RESPONSE));
        return new LockedReservation(usage, reservation);
    }

    private void expireLocked(AiDailyUsage usage, LocalDateTime now) {
        List<AiDescriptionReservation> expired = reservations.findExpiredForUpdate(
                usage.getId(), AiDescriptionReservationStatus.RESERVED, now);
        if (expired.isEmpty()) return;
        expired.forEach(reservation -> {
            reservation.setStatus(AiDescriptionReservationStatus.EXPIRED);
            reservation.setCompletedAt(now);
            reservation.setReleaseReason("LEASE_EXPIRED");
        });
        usage.setReservedCount(Math.max(0, usage.getReservedCount() - expired.size()));
        reservations.saveAll(expired);
        usages.save(usage);
    }

    private void expire(AiDailyUsage usage, AiDescriptionReservation reservation, LocalDateTime now) {
        reservation.setStatus(AiDescriptionReservationStatus.EXPIRED);
        reservation.setCompletedAt(now);
        reservation.setReleaseReason("LEASE_EXPIRED");
        usage.setReservedCount(Math.max(0, usage.getReservedCount() - 1));
        reservations.save(reservation);
        usages.save(usage);
    }

    private AiDescriptionQuotaRes snapshot(AiDailyUsage usage) {
        OffsetDateTime retryAt = reservations.findEarliestLease(
                        usage.getId(), AiDescriptionReservationStatus.RESERVED)
                .map(value -> value.atZone(businessZone).toOffsetDateTime())
                .orElse(null);
        int successful = usage.getSuccessfulCount();
        return new AiDescriptionQuotaRes(
                properties.isAvailable(),
                DAILY_LIMIT,
                successful,
                Math.max(0, DAILY_LIMIT - successful),
                Math.max(0, DAILY_LIMIT - successful - usage.getReservedCount()),
                resetAt(usage.getBusinessDate()),
                retryAt);
    }

    private OffsetDateTime resetAt(LocalDate businessDate) {
        return businessDate.plusDays(1).atStartOfDay(businessZone).toOffsetDateTime();
    }

    private String safeReason(String reason) {
        if (reason == null || reason.isBlank()) return "GENERATION_FAILED";
        String normalized = reason.replaceAll("[^A-Z0-9_]", "_");
        return normalized.substring(0, Math.min(64, normalized.length()));
    }

    public record ReservationLease(String token, LocalDate businessDate, LocalDateTime expiresAt) {
    }

    private record LockedReservation(AiDailyUsage usage, AiDescriptionReservation reservation) {
    }
}
