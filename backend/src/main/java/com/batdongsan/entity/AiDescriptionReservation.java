package com.batdongsan.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_description_reservations")
public class AiDescriptionReservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usage_id", nullable = false)
    private AiDailyUsage usage;

    @Column(name = "reservation_token", nullable = false, unique = true, length = 36)
    private String reservationToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AiDescriptionReservationStatus status;

    @Column(name = "reserved_at", nullable = false)
    private LocalDateTime reservedAt;

    @Column(name = "lease_expires_at", nullable = false)
    private LocalDateTime leaseExpiresAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "release_reason", length = 64)
    private String releaseReason;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AiDailyUsage getUsage() { return usage; }
    public void setUsage(AiDailyUsage usage) { this.usage = usage; }
    public String getReservationToken() { return reservationToken; }
    public void setReservationToken(String reservationToken) { this.reservationToken = reservationToken; }
    public AiDescriptionReservationStatus getStatus() { return status; }
    public void setStatus(AiDescriptionReservationStatus status) { this.status = status; }
    public LocalDateTime getReservedAt() { return reservedAt; }
    public void setReservedAt(LocalDateTime reservedAt) { this.reservedAt = reservedAt; }
    public LocalDateTime getLeaseExpiresAt() { return leaseExpiresAt; }
    public void setLeaseExpiresAt(LocalDateTime leaseExpiresAt) { this.leaseExpiresAt = leaseExpiresAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public String getReleaseReason() { return releaseReason; }
    public void setReleaseReason(String releaseReason) { this.releaseReason = releaseReason; }
}
