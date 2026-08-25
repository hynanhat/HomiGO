package com.batdongsan.service;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Base64;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SePaySignatureService {
    private static final Set<String> SIGNED_FIELDS = Set.of(
            "merchant", "env", "operation", "payment_method", "order_amount",
            "currency", "order_invoice_number", "order_description", "customer_id",
            "agreement_id", "agreement_name", "agreement_type",
            "agreement_payment_frequency", "agreement_amount_per_payment",
            "success_url", "error_url", "cancel_url", "order_id");

    public String sign(Map<String, String> orderedFields, String secretKey) {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalArgumentException("SePay secret key is required.");
        }

        String payload = canonicalPayload(orderedFields);
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getEncoder().encodeToString(
                    mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Cannot initialize SePay signature.", exception);
        }
    }

    String canonicalPayload(Map<String, String> orderedFields) {
        return orderedFields.entrySet().stream()
                .filter(entry -> SIGNED_FIELDS.contains(entry.getKey()))
                .filter(entry -> entry.getValue() != null)
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining(","));
    }
}
