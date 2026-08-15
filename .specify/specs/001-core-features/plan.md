# Implementation Plan: HomiGO Backend Core

**Branch**: `001-core-features` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

## Summary

Hoàn thiện backend cho nền tảng bất động sản HomiGO trước khi phát triển giao diện. Phạm vi gồm xác thực và phân quyền, vòng đời tin đăng, tìm kiếm/lọc, ảnh, dự án, yêu thích, kiểm duyệt và nền tảng kiểm thử. Frontend React được giữ trong lộ trình đồ án nhưng không thuộc đợt triển khai này.

## Technical Context

**Language/Version**: Java 17, Spring Boot 4.1

**Dependencies**: Spring Web MVC, Spring Data JPA, Spring Security, Bean Validation, JJWT, MySQL Driver, H2 (test), Maven Wrapper

**Storage**: MySQL 8; local filesystem cho ảnh trong giai đoạn phát triển

**Testing**: JUnit 5, Mockito, Spring Boot Test, H2; Testcontainers MySQL ở giai đoạn hardening

**Target Platform**: REST API chạy trên Linux/Windows hoặc Docker

**Project Type**: Backend-first web application

**Performance Goals**: API danh sách phản hồi dưới 500 ms với 10.000 tin trong môi trường kiểm thử; mọi danh sách phân trang tối đa 100 phần tử

**Constraints**: `/api/v1`, JWT, BCrypt, secret từ biến môi trường, tối đa 10 ảnh/tin, ảnh tối đa 5 MB, tin hoạt động 30 ngày
**Scale/Scope**: Một backend monolith, ba vai trò, một database; không payment/chat/news trong core phase

## Constitution Check

### Pre-design

- I Backend Architecture: **PASS** — tiếp tục controller → service → repository → entity/dto; chuyển validation nghiệp vụ khỏi controller.
- II Security: **PASS WITH WORK** — JWT/BCrypt đã có; cần refresh token, secret production và kiểm thử token.
- III Authorization: **PASS WITH WORK** — cần giới hạn tạo tin cho SELLER/ADMIN và kiểm thử ownership.
- IV Data Validation: **PASS WITH WORK** — bổ sung DTO cho admin/project/filter và cross-field validation.
- V Error Handling: **PASS** — có handler tập trung; cần logging server-side.
- VI Database: **PASS WITH WORK** — MySQL đã dùng; cần Flyway và constraint/index rõ ràng.
- VII API Standards: **PASS WITH WORK** — chuẩn hóa endpoint, status code, pagination và OpenAPI.
- VIII Frontend Architecture: **DEFERRED WITH JUSTIFICATION** — người dùng yêu cầu backend-first; React vẫn là phase sau của đồ án, không bị thay thế bằng công nghệ khác.
- IX Testing: **FAIL UNTIL IMPLEMENTED** — mới có context test, chưa có unit test cho AuthService/ListingService. Đây là gate bắt buộc trước khi kết thúc feature.
- X Language Policy: **PASS WITH WORK** — chuẩn hóa source UTF-8 và thông báo tiếng Việt.

Không bắt đầu frontend hoặc tính năng nâng cao trước khi gate IX đạt PASS.

## Project Structure

```text
backend/
├── src/main/java/com/batdongsan/
│   ├── config/
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── exception/
│   ├── repository/
│   ├── security/
│   └── service/
├── src/main/resources/
│   ├── db/migration/
│   ├── application.yml
│   ├── application-dev.yml
│   └── application-prod.yml
└── src/test/
    ├── java/com/batdongsan/
    └── resources/application-test.yml
```

## Delivery Phases

### Phase A — Foundation hardening

1. Thêm Flyway và migration baseline từ schema hiện tại.
2. Tắt `ddl-auto: update` ngoài test; dùng `validate` cho dev/prod.
3. Chuẩn hóa UTF-8, DTO, error code và HTTP status.
4. Thêm springdoc OpenAPI và tài liệu cấu hình môi trường.
5. Chuyển field injection sang constructor injection.

**Exit criteria**: ứng dụng khởi động từ database rỗng bằng migration; OpenAPI hiển thị đầy đủ; không trả JPA entity trực tiếp.

### Phase B — Identity and authorization

1. Hoàn thiện profile và nâng USER → SELLER.
2. Giới hạn tạo/sửa/xóa tin theo role và ownership.
3. Thêm access/refresh token và thu hồi refresh token.
4. Kiểm thử login, banned user, token hết hạn và quyền truy cập.

**Exit criteria**: ma trận quyền trong contract được kiểm thử tự động.

### Phase C — Complete listing lifecycle

1. Mở rộng listing với địa chỉ, tọa độ, thuộc tính nhà đất và version optimistic locking.
2. Hỗ trợ DRAFT → PENDING → ACTIVE → EXPIRED/INACTIVE và REJECTED.
3. Lưu lý do từ chối, thời điểm duyệt/hết hạn và người duyệt.
4. Thêm “tin của tôi”, admin queue, sửa rồi duyệt lại và scheduled expiration.
5. Gắn tối đa 10 ảnh trực tiếp với listing; kiểm tra MIME, size và ownership.

**Exit criteria**: luồng đăng ký → nâng seller → tạo tin → duyệt → tìm thấy công khai chạy end-to-end.

### Phase D — Search, projects and favorites

1. Thêm sort whitelist, keyword, thuộc tính BĐS và bounding-box map filter.
2. Thêm index cho status/location/category/price/area/created_at.
3. Trả Project DTO và danh sách active listings thuộc dự án.
4. Hoàn thiện favorite với pagination và unique constraint.

**Exit criteria**: bộ test chứng minh filter chính xác và không lộ tin không ACTIVE.

### Phase E — Quality and delivery

1. Unit test AuthService, ListingService và AdminService.
2. Integration test API/security với Testcontainers MySQL.
3. Seed dữ liệu demo và script chạy E2E.
4. CI chạy `mvn verify`, build Docker image và kiểm tra migration.
5. Đo truy vấn tìm kiếm, bổ sung index tránh N+1.

**Exit criteria**: `mvn verify` xanh, Docker khởi động được, quickstart hoàn thành không lỗi.

## Post-design Constitution Check

- I–VII: thiết kế tuân thủ; các mục `PASS WITH WORK` trở thành tiêu chí nghiệm thu.
- VIII: frontend được hoãn có chủ đích, không bị loại khỏi đồ án tổng thể.
- IX: unit/integration tests là deliverable bắt buộc của Phase E.
- X: migration, code và API field dùng tiếng Anh; message người dùng dùng tiếng Việt UTF-8.

## Roadmap After Core Backend

1. Frontend React cho guest/seller/admin.
2. Đặt lịch xem nhà, báo cáo tin và notification.
3. Chọn một điểm nhấn học thuật: phân tích giá theo khu vực (khuyến nghị) hoặc recommendation.
4. Triển khai cloud, thu thập metric và hoàn thiện báo cáo đồ án.

## Complexity Tracking

| Decision | Why needed | Simpler alternative rejected because |
|---|---|---|
| Monolith Spring Boot | Phù hợp quy mô đồ án và dễ triển khai | Microservices tăng vận hành nhưng không tăng giá trị nghiệp vụ |
| Flyway | Schema cần tái lập và kiểm chứng | `ddl-auto:update` không quản lý lịch sử thay đổi |
| Testcontainers sau unit tests | Xác minh tương thích MySQL thật | Chỉ H2 có thể bỏ sót khác biệt dialect |
| Local image storage trước cloud | Đủ cho core và demo local | S3 sớm làm tăng cấu hình; thiết kế storage service vẫn cho phép thay thế |
