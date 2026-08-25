package com.batdongsan.service;

import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;

import static org.assertj.core.api.Assertions.assertThat;

class SePaySignatureServiceTest {
    private final SePaySignatureService service = new SePaySignatureService();

    @Test
    void signsFieldsInInsertionOrderLikeOfficialNodeSdk() {
        LinkedHashMap<String, String> fields = new LinkedHashMap<>();
        fields.put("operation", "PURCHASE");
        fields.put("payment_method", "BANK_TRANSFER");
        fields.put("order_invoice_number", "HMG-SEPAY-TEST001");
        fields.put("order_amount", "99000");
        fields.put("currency", "VND");
        fields.put("order_description", "Nang cap Seller");
        fields.put("customer_id", "42");
        fields.put("success_url", "http://localhost:5173/seller/upgrade?payment=success");
        fields.put("error_url", "http://localhost:5173/seller/upgrade?payment=error");
        fields.put("cancel_url", "http://localhost:5173/seller/upgrade?payment=cancel");
        fields.put("merchant", "SP-TEST-FIXTURE");

        assertThat(service.canonicalPayload(fields)).isEqualTo(
                "operation=PURCHASE,payment_method=BANK_TRANSFER," +
                "order_invoice_number=HMG-SEPAY-TEST001,order_amount=99000,currency=VND," +
                "order_description=Nang cap Seller,customer_id=42," +
                "success_url=http://localhost:5173/seller/upgrade?payment=success," +
                "error_url=http://localhost:5173/seller/upgrade?payment=error," +
                "cancel_url=http://localhost:5173/seller/upgrade?payment=cancel," +
                "merchant=SP-TEST-FIXTURE");
        assertThat(service.sign(fields, "test-only-sepay-secret"))
                .isEqualTo("aZJz4yDmQyQeH0+uoxhM7c6GNF1X32rOtSr1sHor6Is=");
    }
}
