package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.PageReq;
import com.batdongsan.dto.PageResponse;
import com.batdongsan.dto.payment.SePayCheckoutRes;
import com.batdongsan.dto.payment.SePayIpnAckRes;
import com.batdongsan.dto.payment.SePayIpnReq;
import com.batdongsan.dto.payment.SellerUpgradeOfferRes;
import com.batdongsan.dto.payment.SellerUpgradePaymentRes;
import com.batdongsan.exception.ErrorCode;
import com.batdongsan.service.SellerUpgradePaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments/sepay")
@Tag(name = "SePay payments", description = "Thanh toán nâng cấp người bán qua SePay Sandbox")
public class SePayPaymentController {
    private final SellerUpgradePaymentService paymentService;

    public SePayPaymentController(SellerUpgradePaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/seller-upgrade/offer")
    @Operation(summary = "Xem giá và trạng thái cấu hình gói nâng cấp")
    public ResponseEntity<ApiResponse<SellerUpgradeOfferRes>> getOffer() {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getOffer()));
    }

    @PostMapping("/seller-upgrade")
    @Operation(summary = "Tạo hoặc dùng lại checkout SePay đang chờ")
    public ResponseEntity<ApiResponse<SePayCheckoutRes>> createCheckout(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.createCheckout(authentication.getName())));
    }

    @GetMapping("/seller-upgrade/{orderCode}")
    @Operation(summary = "Xem trạng thái một đơn nâng cấp thuộc tài khoản hiện tại")
    public ResponseEntity<ApiResponse<SellerUpgradePaymentRes>> getPayment(
            Authentication authentication,
            @PathVariable String orderCode) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getPayment(authentication.getName(), orderCode)));
    }

    @GetMapping("/seller-upgrade")
    @Operation(summary = "Xem lịch sử thanh toán nâng cấp của tài khoản hiện tại")
    public ResponseEntity<ApiResponse<PageResponse<SellerUpgradePaymentRes>>> getHistory(
            Authentication authentication,
            @Valid PageReq pageReq) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getHistory(authentication.getName(), pageReq)));
    }

    @PostMapping("/ipn")
    @Operation(summary = "Nhận thông báo thanh toán server-to-server từ SePay")
    public ResponseEntity<ApiResponse<SePayIpnAckRes>> receiveIpn(
            @RequestHeader(name = "X-Secret-Key", required = false) String secretKey,
            @Valid @RequestBody SePayIpnReq request) {
        if (!paymentService.isValidIpnSecret(secretKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(
                    "X-Secret-Key không hợp lệ.", ErrorCode.UNAUTHORIZED.getCode()));
        }
        return ResponseEntity.ok(ApiResponse.success(paymentService.processIpn(request)));
    }
}
