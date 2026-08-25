# Implementation Plan: SePay Seller Upgrade

**Branch**: `[004-sepay-seller-upgrade]` | **Date**: 2026-08-17 | **Spec**: [spec.md](spec.md)

## Summary

Thay endpoint nâng cấp miễn phí bằng checkout SePay Sandbox có chữ ký HMAC. Backend sở hữu giá, lưu invoice PENDING, tạo ordered form fields, xác thực IPN bằng `X-Secret-Key` và chỉ nâng USER thành SELLER trong transaction sau khi kiểm tra toàn bộ dữ liệu. Frontend submit form POST sang SePay, xử lý callback như tín hiệu hiển thị và poll trạng thái backend.

## Technical Context

- Backend: Java 17, Spring Boot 4.1, Spring MVC/Security/Data JPA, MySQL/Flyway.
- Frontend: React 19, TypeScript, Vite, TanStack Query, Axios.
- Tests: JUnit/MockMvc/H2; Vitest/MSW; Playwright.
- External integration: `https://pay-sandbox.sepay.vn/v1/checkout/init`; IPN secret header.
- Constraints: không lưu credential; browser callback không authoritative; local IPN cần public HTTPS tunnel.

## Constitution Check

- API-first: hợp đồng trong `contracts/api.md` trước implementation.
- Migration-first: V7 tạo bảng và constraints; Hibernate chỉ validate ở runtime.
- Security: secret server-only, IPN authenticated, amount/currency server-owned, ownership checks.
- Testability: signature service thuần, IPN service transaction, provider không được gọi trong automated tests.
- Responsive UX: một checkout page có recovery states và lịch sử.

## Project Structure

```text
backend/src/main/java/com/batdongsan/
├── controller/SePayPaymentController.java
├── dto/payment/{SePayCheckoutRes,SePayIpnReq,SePayIpnAckRes,SellerUpgradeOfferRes,...}.java
├── entity/{SellerUpgradePayment,PaymentStatus,PaymentPurpose}.java
├── repository/SellerUpgradePaymentRepository.java
└── service/{SePaySignatureService,SellerUpgradePaymentService}.java

backend/src/main/resources/db/migration/V7__seller_upgrade_payments.sql

frontend/src/features/payments/
├── paymentApi.ts
├── paymentQueries.ts
├── paymentTypes.ts
└── sePayForm.ts

frontend/src/pages/SellerUpgradePage.tsx
```

## Delivery Phases

1. Schema/config/domain foundation.
2. HMAC checkout generation and authenticated IPN processing.
3. Controller/security/OpenAPI contract.
4. Responsive frontend checkout, callback polling, role refresh and history.
5. Security/idempotency tests, docs, clean migration and local sandbox demo.
