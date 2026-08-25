package com.batdongsan.dto.payment;

import java.util.Map;

public record SePayCheckoutRes(
        SellerUpgradePaymentRes payment,
        String checkoutUrl,
        String method,
        Map<String, String> fields) {
}
