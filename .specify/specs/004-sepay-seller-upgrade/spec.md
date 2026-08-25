# Feature Specification: SePay Seller Upgrade

**Feature Branch**: `[004-sepay-seller-upgrade]`  
**Created**: 2026-08-17  
**Status**: Approved  
**Input**: Tích hợp SePay Payment Gateway Sandbox; người dùng chỉ trở thành SELLER sau khi backend xác nhận thanh toán hợp lệ.

## User Scenarios & Testing

### User Story 1 - Thanh toán để trở thành người bán (Priority: P1)

Một USER xem giá và quyền lợi, tạo đơn nâng cấp, được chuyển sang trang SePay Sandbox và thanh toán. SePay gửi IPN hợp lệ; hệ thống đánh dấu đơn thành công và đổi vai trò thành SELLER.

**Independent Test**: Tạo checkout với USER, gửi IPN `ORDER_PAID` có đúng secret, invoice, số tiền, tiền tệ và trạng thái; kiểm tra đơn `SUCCESS` và người dùng `SELLER`.

**Acceptance Scenarios**:

1. **Given** SePay đã cấu hình và USER đang hoạt động, **When** tạo checkout, **Then** server tạo đơn PENDING với giá do server quản lý và trả về URL/form fields đã ký, không trả secret.
2. **Given** đơn PENDING, **When** nhận IPN hợp lệ với order `CAPTURED` và transaction `APPROVED`, **Then** đơn và vai trò được cập nhật atomically.
3. **Given** IPN thiếu hoặc sai `X-Secret-Key`, **When** gọi endpoint IPN, **Then** trả 401 và không thay đổi đơn/người dùng.

### User Story 2 - Trở về và khôi phục trạng thái (Priority: P2)

Sau khi SePay chuyển trình duyệt về, người dùng thấy trạng thái đang xác nhận, thành công, lỗi hoặc hủy; giao diện truy vấn backend cho tới khi nhận trạng thái cuối.

**Independent Test**: Mở URL callback `payment=success` khi đơn vẫn PENDING; kiểm tra giao diện không tự nâng quyền và chỉ hiển thị thành công sau khi API trả `SUCCESS`.

**Acceptance Scenarios**:

1. **Given** trình duyệt quay về success URL nhưng IPN chưa đến, **When** trang tải, **Then** hiển thị “đang xác nhận” và poll trạng thái; không cấp SELLER từ query string.
2. **Given** callback error/cancel, **When** trang tải, **Then** giải thích chưa thanh toán và cho phép thử lại.
3. **Given** đơn PENDING đã quá hạn, **When** đọc/tạo lại checkout, **Then** đơn cũ chuyển EXPIRED và có thể tạo đơn mới.

### User Story 3 - Theo dõi lịch sử và chống xử lý lặp (Priority: P3)

Người dùng xem lịch sử đơn của chính mình. IPN gửi lại nhiều lần không tạo thêm nâng cấp hoặc làm sai dữ liệu.

**Independent Test**: Gửi cùng IPN hai lần và truy vấn lịch sử bằng hai người dùng khác nhau; chỉ một cập nhật thành công và không lộ đơn của tài khoản khác.

## Edge Cases

- Merchant ID/secret chưa cấu hình: offer báo chưa sẵn sàng và endpoint tạo checkout từ chối an toàn.
- USER nhấn nhiều lần: tái sử dụng đơn PENDING chưa hết hạn thay vì sinh nhiều đơn.
- IPN sai invoice, số tiền, currency hoặc trạng thái: không nâng quyền.
- IPN đến lặp hoặc đồng thời: xử lý idempotent dưới database lock.
- IPN hợp lệ đến muộn sau local expiry: vẫn ghi nhận vì tiền đã được SePay xác nhận.
- Tài khoản đã là SELLER/ADMIN hoặc bị khóa: không tạo checkout mới.

## Requirements

### Functional Requirements

- **FR-001**: Hệ thống MUST cung cấp offer nâng cấp với mức phí và currency do backend quản lý (mặc định 99.000 VND).
- **FR-002**: Chỉ USER đang hoạt động MUST được tạo checkout nâng cấp.
- **FR-003**: Backend MUST tạo invoice duy nhất, lưu PENDING trước khi tạo form checkout.
- **FR-004**: Backend MUST ký đúng các field checkout bằng HMAC-SHA256 với secret trong biến môi trường và MUST NOT gửi/log secret.
- **FR-005**: Checkout MUST dùng endpoint SePay Sandbox và phương thức `BANK_TRANSFER`.
- **FR-006**: IPN endpoint MUST công khai cho SePay nhưng MUST xác thực `X-Secret-Key` bằng so sánh constant-time.
- **FR-007**: Chỉ IPN `ORDER_PAID` với order `CAPTURED`, transaction `APPROVED`, đúng invoice/amount/currency mới được đổi USER thành SELLER.
- **FR-008**: Cập nhật payment SUCCESS và user role MUST nằm trong cùng transaction database.
- **FR-009**: Xử lý IPN MUST idempotent và an toàn trước request lặp/đồng thời.
- **FR-010**: Browser success/error/cancel URL MUST NOT trực tiếp nâng quyền.
- **FR-011**: Người dùng MUST chỉ xem được trạng thái/lịch sử đơn của mình.
- **FR-012**: PENDING quá hạn MUST được biểu diễn thành EXPIRED; người dùng có thể thử lại.
- **FR-013**: Sau SUCCESS, frontend MUST làm mới JWT/profile để quyền SELLER có hiệu lực.
- **FR-014**: Cấu hình MUST phân biệt sandbox/production và mặc định local là sandbox; không có credential thật trong repository.
- **FR-015**: Tài liệu local MUST nêu rõ IPN cần public HTTPS tunnel và cách cấu hình URL trên SePay.

### Key Entities

- **SellerUpgradePayment**: invoice nội bộ, chủ sở hữu, amount/currency, trạng thái, provider order/transaction, thời hạn và timestamps.
- **User**: tài khoản được chuyển USER → SELLER duy nhất sau IPN đã xác minh.
- **SePayCheckout**: URL và ordered signed form fields trả cho trình duyệt; không persist secret.

## Success Criteria

- **SC-001**: 100% trường hợp sai secret/amount/currency/invoice/status trong automated tests không nâng quyền.
- **SC-002**: IPN hợp lệ nâng quyền và payment trong một lần; gửi lặp ít nhất 2 lần không đổi kết quả.
- **SC-003**: Không có chuỗi credential SePay trong source, artifact frontend, log hoặc git diff.
- **SC-004**: Trang checkout sử dụng được ở 360px, 768px và 1440px, có trạng thái loading/error/success rõ ràng.
- **SC-005**: Backend tests, frontend tests, lint và production build đều pass.

## Assumptions / Out of Scope

- Dùng SePay Sandbox phục vụ đồ án; không có tiền thật.
- Merchant cấu hình kiểu xác thực IPN `SECRET_KEY`.
- Hoàn tiền, subscription, hóa đơn thuế, production onboarding và tự động dựng tunnel nằm ngoài phạm vi.
