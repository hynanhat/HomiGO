package com.batdongsan.controller;

import com.batdongsan.dto.payment.SePayCheckoutRes;
import com.batdongsan.entity.User;
import com.batdongsan.entity.UserRole;
import com.batdongsan.entity.UserStatus;
import com.batdongsan.repository.UserRepository;
import com.batdongsan.service.SellerUpgradePaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SePayPaymentIntegrationTest {
    private static final String TEST_SECRET = "test-only-sepay-secret";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired SellerUpgradePaymentService paymentService;

    @Test
    @WithMockUser(username = "checkout@homigo.test", roles = "USER")
    void userCreatesSignedCheckoutWithoutExposingSecretAndReusesPendingOrder() throws Exception {
        userRepository.save(activeUser("checkout@homigo.test"));

        String firstBody = mockMvc.perform(post("/api/v1/payments/sepay/seller-upgrade"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.payment.status").value("PENDING"))
                .andExpect(jsonPath("$.data.payment.amount").value(99000))
                .andExpect(jsonPath("$.data.checkoutUrl").value("https://pay-sandbox.sepay.vn/v1/checkout/init"))
                .andExpect(jsonPath("$.data.fields.payment_method").value("BANK_TRANSFER"))
                .andExpect(jsonPath("$.data.fields.signature").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        assertThat(firstBody).doesNotContain(TEST_SECRET);

        String firstOrderCode = com.jayway.jsonpath.JsonPath.read(firstBody, "$.data.payment.orderCode");
        mockMvc.perform(post("/api/v1/payments/sepay/seller-upgrade"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.payment.orderCode").value(firstOrderCode));
    }

    @Test
    @WithMockUser(username = "owner@homigo.test", roles = "USER")
    void paymentStatusIsPrivateToItsOwner() throws Exception {
        userRepository.save(activeUser("owner@homigo.test"));
        userRepository.save(activeUser("other@homigo.test"));
        String orderCode = paymentService.createCheckout("other@homigo.test").payment().getOrderCode();

        mockMvc.perform(get("/api/v1/payments/sepay/seller-upgrade/{orderCode}", orderCode))
                .andExpect(status().isNotFound());
    }

    @Test
    void ipnRejectsWrongSecretAndMismatchedAmount() throws Exception {
        userRepository.save(activeUser("paid@homigo.test"));
        SePayCheckoutRes checkout = paymentService.createCheckout("paid@homigo.test");
        String orderCode = checkout.payment().getOrderCode();

        mockMvc.perform(post("/api/v1/payments/sepay/ipn")
                        .header("X-Secret-Key", "wrong-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ipn(orderCode, "99000")))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/payments/sepay/ipn")
                        .header("X-Secret-Key", TEST_SECRET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ipn(orderCode, "1")))
                .andExpect(status().isBadRequest());
        assertThat(userRepository.findByEmail("paid@homigo.test").orElseThrow().getRole())
                .isEqualTo(UserRole.USER);
    }

    @Test
    void validIpnPromotesUserAndDuplicateIsIdempotent() throws Exception {
        userRepository.save(activeUser("valid-paid@homigo.test"));
        SePayCheckoutRes checkout = paymentService.createCheckout("valid-paid@homigo.test");
        String orderCode = checkout.payment().getOrderCode();

        mockMvc.perform(post("/api/v1/payments/sepay/ipn")
                        .header("X-Secret-Key", TEST_SECRET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ipn(orderCode, "99000")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.result").value("PROCESSED"));
        assertThat(userRepository.findByEmail("valid-paid@homigo.test").orElseThrow().getRole())
                .isEqualTo(UserRole.SELLER);

        mockMvc.perform(post("/api/v1/payments/sepay/ipn")
                        .header("X-Secret-Key", TEST_SECRET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ipn(orderCode, "99000")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.result").value("DUPLICATE"));
    }

    private User activeUser(String email) {
        User user = new User();
        user.setName("Người dùng SePay");
        user.setEmail(email);
        user.setPasswordHash("not-used");
        user.setRole(UserRole.USER);
        user.setStatus(UserStatus.ACTIVE);
        return user;
    }

    private String ipn(String orderCode, String amount) {
        return """
                {
                  "timestamp": 1786970000,
                  "notification_type": "ORDER_PAID",
                  "order": {
                    "id": "sepay-order-fixture",
                    "order_status": "CAPTURED",
                    "order_currency": "VND",
                    "order_amount": "%s",
                    "order_invoice_number": "%s"
                  },
                  "transaction": {
                    "id": "sepay-transaction-fixture",
                    "transaction_id": "1786970000123",
                    "transaction_status": "APPROVED",
                    "transaction_amount": "%s",
                    "transaction_currency": "VND"
                  }
                }
                """.formatted(amount, orderCode, amount);
    }
}
