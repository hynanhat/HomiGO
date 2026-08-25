package com.batdongsan.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_daily_usage", uniqueConstraints =
        @UniqueConstraint(name = "uk_ai_daily_usage_user_date", columnNames = {"user_id", "business_date"}))
public class AiDailyUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "business_date", nullable = false)
    private LocalDate businessDate;

    @Column(name = "successful_count", nullable = false)
    private int successfulCount;

    @Column(name = "reserved_count", nullable = false)
    private int reservedCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @PrePersist
    void createTimestamps() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void updateTimestamp() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDate getBusinessDate() { return businessDate; }
    public void setBusinessDate(LocalDate businessDate) { this.businessDate = businessDate; }
    public int getSuccessfulCount() { return successfulCount; }
    public void setSuccessfulCount(int successfulCount) { this.successfulCount = successfulCount; }
    public int getReservedCount() { return reservedCount; }
    public void setReservedCount(int reservedCount) { this.reservedCount = reservedCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
