package com.batdongsan.dto.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SePayIpnReq(
        long timestamp,
        @NotBlank @JsonProperty("notification_type") String notificationType,
        @NotNull @Valid OrderData order,
        @NotNull @Valid TransactionData transaction) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OrderData(
            @NotBlank String id,
            @NotBlank @JsonProperty("order_status") String orderStatus,
            @NotBlank @JsonProperty("order_currency") String orderCurrency,
            @NotNull @JsonProperty("order_amount") BigDecimal orderAmount,
            @NotBlank @JsonProperty("order_invoice_number") String orderInvoiceNumber) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TransactionData(
            @NotBlank String id,
            @JsonProperty("transaction_id") String transactionId,
            @NotBlank @JsonProperty("transaction_status") String transactionStatus,
            @NotNull @JsonProperty("transaction_amount") BigDecimal transactionAmount,
            @NotBlank @JsonProperty("transaction_currency") String transactionCurrency) {
    }
}
