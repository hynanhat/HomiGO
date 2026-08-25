package com.batdongsan.service;

import com.batdongsan.config.SePayProperties;
import com.batdongsan.dto.PageReq;
import com.batdongsan.dto.PageResponse;
import com.batdongsan.dto.payment.SePayCheckoutRes;
import com.batdongsan.dto.payment.SePayIpnAckRes;
import com.batdongsan.dto.payment.SePayIpnReq;
import com.batdongsan.dto.payment.SellerUpgradeOfferRes;
import com.batdongsan.dto.payment.SellerUpgradePaymentRes;
import com.batdongsan.entity.PaymentPurpose;
import com.batdongsan.entity.PaymentStatus;
import com.batdongsan.entity.SellerUpgradePayment;
import com.batdongsan.entity.User;
import com.batdongsan.entity.UserRole;
import com.batdongsan.entity.UserStatus;
import com.batdongsan.exception.BadRequestException;
import com.batdongsan.exception.ResourceNotFoundException;
import com.batdongsan.repository.SellerUpgradePaymentRepository;
import com.batdongsan.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class SellerUpgradePaymentService {
    private static final String PROVIDER = "SEPAY";
    private static final String PAYMENT_METHOD = "BANK_TRANSFER";

    private final SellerUpgradePaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final SePaySignatureService signatureService;
    private final SePayProperties sePayProperties;
    private final long upgradeAmount;
    private final String upgradeCurrency;
    private final long pendingMinutes;

    public SellerUpgradePaymentService(
            SellerUpgradePaymentRepository paymentRepository,
            UserRepository userRepository,
            SePaySignatureService signatureService,
            SePayProperties sePayProperties,
            @Value("${payment.seller-upgrade.amount}") long upgradeAmount,
            @Value("${payment.seller-upgrade.currency}") String upgradeCurrency,
            @Value("${payment.seller-upgrade.pending-minutes}") long pendingMinutes) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.signatureService = signatureService;
        this.sePayProperties = sePayProperties;
        this.upgradeAmount = upgradeAmount;
        this.upgradeCurrency = upgradeCurrency;
        this.pendingMinutes = pendingMinutes;
    }

    public SellerUpgradeOfferRes getOffer() {
        return new SellerUpgradeOfferRes(
                upgradeAmount,
                upgradeCurrency,
                PROVIDER,
                normalizedEnvironment(),
                isConfigurationValid());
    }

    @Transactional
    public SePayCheckoutRes createCheckout(String email) {
        requireConfiguration();
        User user = findActiveUserForUpdate(email);
        if (user.getRole() != UserRole.USER) {
            throw new BadRequestException("Chỉ tài khoản USER mới có thể mua gói nâng cấp người bán.");
        }

        LocalDateTime now = LocalDateTime.now();
        SellerUpgradePayment payment = paymentRepository
                .findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), PaymentStatus.PENDING)
                .map(existing -> expireIfNeeded(existing, now))
                .filter(existing -> existing.getStatus() == PaymentStatus.PENDING)
                .orElseGet(() -> createPayment(user, now));

        return createCheckoutResponse(payment);
    }

    @Transactional
    public SellerUpgradePaymentRes getPayment(String email, String orderCode) {
        User user = findActiveUser(email);
        SellerUpgradePayment payment = paymentRepository.findByOrderCodeAndUserId(orderCode, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn nâng cấp."));
        expireIfNeeded(payment, LocalDateTime.now());
        return new SellerUpgradePaymentRes(payment);
    }

    @Transactional
    public PageResponse<SellerUpgradePaymentRes> getHistory(String email, PageReq pageReq) {
        User user = findActiveUser(email);
        Page<SellerUpgradePayment> payments = paymentRepository.findByUserId(
                user.getId(),
                PageRequest.of(pageReq.getPage(), pageReq.getSize(), Sort.by(Sort.Direction.DESC, "createdAt")));
        LocalDateTime now = LocalDateTime.now();
        Page<SellerUpgradePaymentRes> response = payments
                .map(payment -> new SellerUpgradePaymentRes(expireIfNeeded(payment, now)));
        return PageResponse.from(response);
    }

    public boolean isValidIpnSecret(String providedSecret) {
        if (!sePayProperties.isConfigured() || providedSecret == null) return false;
        return MessageDigest.isEqual(
                sePayProperties.getSecretKey().getBytes(StandardCharsets.UTF_8),
                providedSecret.getBytes(StandardCharsets.UTF_8));
    }

    @Transactional
    public SePayIpnAckRes processIpn(SePayIpnReq request) {
        if (!"ORDER_PAID".equals(request.notificationType())) {
            return new SePayIpnAckRes(request.order().orderInvoiceNumber(), "IGNORED");
        }
        if (!"CAPTURED".equals(request.order().orderStatus())
                || !"APPROVED".equals(request.transaction().transactionStatus())) {
            throw new BadRequestException("Trạng thái giao dịch SePay chưa thành công.");
        }

        SellerUpgradePayment payment = paymentRepository
                .findByOrderCodeForUpdate(request.order().orderInvoiceNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy invoice SePay tương ứng."));

        validatePaymentDetails(payment, request);
        String providerTransactionId = request.transaction().id();

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            if (!providerTransactionId.equals(payment.getProviderTransactionId())) {
                throw new BadRequestException("Invoice đã được thanh toán bởi giao dịch SePay khác.");
            }
            ensureSellerRole(payment.getUser());
            return new SePayIpnAckRes(payment.getOrderCode(), "DUPLICATE");
        }

        if (paymentRepository.existsByProviderTransactionIdAndIdNot(providerTransactionId, payment.getId())) {
            throw new BadRequestException("Giao dịch SePay đã được sử dụng cho invoice khác.");
        }

        payment.setProviderOrderId(request.order().id());
        payment.setProviderTransactionId(providerTransactionId);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setFailureReason(null);
        payment.setCompletedAt(LocalDateTime.now());
        ensureSellerRole(payment.getUser());
        paymentRepository.save(payment);
        return new SePayIpnAckRes(payment.getOrderCode(), "PROCESSED");
    }

    private SellerUpgradePayment createPayment(User user, LocalDateTime now) {
        if (upgradeAmount <= 0 || pendingMinutes <= 0) {
            throw new BadRequestException("Cấu hình gói nâng cấp người bán không hợp lệ.");
        }
        SellerUpgradePayment payment = new SellerUpgradePayment();
        payment.setOrderCode(createOrderCode());
        payment.setUser(user);
        payment.setPurpose(PaymentPurpose.SELLER_UPGRADE);
        payment.setAmount(upgradeAmount);
        payment.setCurrency(upgradeCurrency.toUpperCase(Locale.ROOT));
        payment.setStatus(PaymentStatus.PENDING);
        payment.setExpiresAt(now.plusMinutes(pendingMinutes));
        return paymentRepository.save(payment);
    }

    private SePayCheckoutRes createCheckoutResponse(SellerUpgradePayment payment) {
        String callbackBase = trimTrailingSlash(sePayProperties.getFrontendBaseUrl())
                + "/seller/upgrade?orderCode=" + payment.getOrderCode() + "&payment=";
        LinkedHashMap<String, String> fields = new LinkedHashMap<>();
        fields.put("operation", "PURCHASE");
        fields.put("payment_method", PAYMENT_METHOD);
        fields.put("order_invoice_number", payment.getOrderCode());
        fields.put("order_amount", Long.toString(payment.getAmount()));
        fields.put("currency", payment.getCurrency());
        fields.put("order_description", "Nang cap tai khoan Seller HomiGO " + payment.getOrderCode());
        fields.put("customer_id", Long.toString(payment.getUser().getId()));
        fields.put("success_url", callbackBase + "success");
        fields.put("error_url", callbackBase + "error");
        fields.put("cancel_url", callbackBase + "cancel");
        // The official Node SDK appends merchant to the caller-provided field object before signing.
        fields.put("merchant", sePayProperties.getMerchantId());
        fields.put("signature", signatureService.sign(fields, sePayProperties.getSecretKey()));

        return new SePayCheckoutRes(
                new SellerUpgradePaymentRes(payment),
                sePayProperties.getCheckoutUrl(),
                "POST",
                Collections.unmodifiableMap(new LinkedHashMap<>(fields)));
    }

    private void validatePaymentDetails(SellerUpgradePayment payment, SePayIpnReq request) {
        if (!payment.getCurrency().equalsIgnoreCase(request.order().orderCurrency())
                || !payment.getCurrency().equalsIgnoreCase(request.transaction().transactionCurrency())) {
            throw new BadRequestException("Tiền tệ trong IPN SePay không khớp invoice.");
        }
        BigDecimal expected = BigDecimal.valueOf(payment.getAmount());
        if (expected.compareTo(request.order().orderAmount()) != 0
                || expected.compareTo(request.transaction().transactionAmount()) != 0) {
            throw new BadRequestException("Số tiền trong IPN SePay không khớp invoice.");
        }
    }

    private SellerUpgradePayment expireIfNeeded(SellerUpgradePayment payment, LocalDateTime now) {
        if (payment.getStatus() == PaymentStatus.PENDING && !payment.getExpiresAt().isAfter(now)) {
            payment.setStatus(PaymentStatus.EXPIRED);
            payment.setFailureReason("Đơn đã hết thời gian chờ thanh toán.");
        }
        return payment;
    }

    private void ensureSellerRole(User user) {
        if (user.getRole() == UserRole.USER) {
            user.setRole(UserRole.SELLER);
        }
    }

    private User findActiveUserForUpdate(String email) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmailForUpdate(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));
        requireActive(user);
        return user;
    }

    private User findActiveUser(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));
        requireActive(user);
        return user;
    }

    private void requireActive(User user) {
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa.");
        }
    }

    private boolean isConfigurationValid() {
        return sePayProperties.isConfigured()
                && sePayProperties.getCheckoutUrl() != null
                && !sePayProperties.getCheckoutUrl().isBlank()
                && sePayProperties.getFrontendBaseUrl() != null
                && !sePayProperties.getFrontendBaseUrl().isBlank()
                && upgradeAmount > 0
                && pendingMinutes > 0;
    }

    private void requireConfiguration() {
        if (!isConfigurationValid()) {
            throw new BadRequestException("SePay Sandbox chưa được cấu hình trên backend.");
        }
    }

    private String normalizedEnvironment() {
        return sePayProperties.getEnvironment() == null
                ? "sandbox"
                : sePayProperties.getEnvironment().trim().toLowerCase(Locale.ROOT);
    }

    private String createOrderCode() {
        return "HMG-SEPAY-" + UUID.randomUUID().toString().replace("-", "")
                .substring(0, 20).toUpperCase(Locale.ROOT);
    }

    private String trimTrailingSlash(String value) {
        String trimmed = value.trim();
        while (trimmed.endsWith("/")) trimmed = trimmed.substring(0, trimmed.length() - 1);
        return trimmed;
    }
}
