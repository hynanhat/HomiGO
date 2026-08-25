package com.batdongsan.dto.payment;

import com.batdongsan.entity.PaymentPurpose;
import com.batdongsan.entity.PaymentStatus;
import com.batdongsan.entity.SellerUpgradePayment;

import java.time.LocalDateTime;

public class SellerUpgradePaymentRes {
    private final Long id;
    private final String orderCode;
    private final PaymentPurpose purpose;
    private final Long amount;
    private final String currency;
    private final PaymentStatus status;
    private final String providerOrderId;
    private final String providerTransactionId;
    private final String failureReason;
    private final LocalDateTime expiresAt;
    private final LocalDateTime completedAt;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public SellerUpgradePaymentRes(SellerUpgradePayment payment) {
        this.id = payment.getId();
        this.orderCode = payment.getOrderCode();
        this.purpose = payment.getPurpose();
        this.amount = payment.getAmount();
        this.currency = payment.getCurrency();
        this.status = payment.getStatus();
        this.providerOrderId = payment.getProviderOrderId();
        this.providerTransactionId = payment.getProviderTransactionId();
        this.failureReason = payment.getFailureReason();
        this.expiresAt = payment.getExpiresAt();
        this.completedAt = payment.getCompletedAt();
        this.createdAt = payment.getCreatedAt();
        this.updatedAt = payment.getUpdatedAt();
    }

    public Long getId() { return id; }
    public String getOrderCode() { return orderCode; }
    public PaymentPurpose getPurpose() { return purpose; }
    public Long getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public PaymentStatus getStatus() { return status; }
    public String getProviderOrderId() { return providerOrderId; }
    public String getProviderTransactionId() { return providerTransactionId; }
    public String getFailureReason() { return failureReason; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
