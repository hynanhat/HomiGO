# Tasks: SePay Seller Upgrade

**Input**: Design documents from `.specify/specs/004-sepay-seller-upgrade/`  
**Tests**: Required for signing, authorization, IPN validation/idempotency and frontend callback behavior.

## Phase 1 - Foundation

- [x] T001 Finalize V7 schema and entity/provider identifiers in `backend/src/main/resources/db/migration/V7__seller_upgrade_payments.sql` and `backend/src/main/java/com/batdongsan/entity/SellerUpgradePayment.java`
- [x] T002 Add environment-only SePay/seller-upgrade configuration in `backend/src/main/resources/application.yml`, test config and `.env.example`
- [x] T003 Remove every free-upgrade and MoMo-simulator code path from backend/frontend/tests

## Phase 2 - Backend checkout (US1)

- [x] T004 [US1] Implement deterministic HMAC-SHA256/Base64 checkout signing in `backend/src/main/java/com/batdongsan/service/SePaySignatureService.java`
- [x] T005 [US1] Add offer/checkout/IPN DTOs in `backend/src/main/java/com/batdongsan/dto/payment/`
- [x] T006 [US1] Implement order create/reuse/expiry, checkout fields and owner reads in `backend/src/main/java/com/batdongsan/service/SellerUpgradePaymentService.java`
- [x] T007 [US1] Implement constant-time IPN secret validation, business matching and atomic/idempotent role upgrade in the payment service
- [x] T008 [US1] Add SePay offer/create/status/history/IPN endpoints and security rules in `SePayPaymentController.java` and `SecurityConfig.java`

## Phase 3 - Frontend flow (US2/US3)

- [x] T009 [P] Add payment types/API/query hooks in `frontend/src/features/payments/`
- [x] T010 [P] Add safe native POST-form submission helper in `frontend/src/features/payments/sePayForm.ts`
- [x] T011 Rebuild `frontend/src/pages/SellerUpgradePage.tsx` for offer, checkout, callback polling, role refresh and history
- [x] T012 Update profile copy and MSW fixtures/handlers for paid SePay upgrade

## Phase 4 - Verification and documentation

- [x] T013 [P] Add signature fixture and payment service unit tests
- [x] T014 [P] Add MockMvc tests for security, ownership, mismatches, valid and duplicate IPN
- [x] T015 [P] Add frontend API/form/page tests and update seller publication E2E contract
- [x] T016 Update README and quickstart with rotated-secret, sandbox and tunnel/IPN setup
- [x] T017 Run backend suite, frontend tests/lint/build and clean MySQL V1→V7 validation
- [x] T018 Validate FR-001–FR-015 and record evidence/traceability

## Dependencies

`T001–T003 → T004–T008 → T009–T012 → T013–T018`

Tasks marked `[P]` can run independently after their phase prerequisites.
