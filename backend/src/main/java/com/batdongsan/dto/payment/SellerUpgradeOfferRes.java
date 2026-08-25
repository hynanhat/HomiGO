package com.batdongsan.dto.payment;

public record SellerUpgradeOfferRes(
        long amount,
        String currency,
        String provider,
        String environment,
        boolean configured) {
}
