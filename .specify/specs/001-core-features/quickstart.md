# Quickstart Validation: HomiGO Backend Core

## Prerequisites

- Java 17+
- Docker cho luồng MySQL end-to-end; unit/smoke tests không cần Docker
- `JWT_SECRET` tối thiểu 32 bytes khi chạy application

## Fast verification

```powershell
cd backend
.\mvnw.cmd test
```

Expected: context test và unit tests đều pass bằng test profile.

## Full verification

1. Khởi động MySQL/backend:

```powershell
docker compose up --build -d
```

2. Kiểm tra application khởi động từ database rỗng và Flyway áp dụng toàn bộ migration.
3. Mở OpenAPI UI và xác nhận các endpoint khớp [contract](./contracts/api.md).
4. Chạy `mvnw.cmd verify`; integration tests dùng MySQL Testcontainers.

## Required end-to-end scenarios

### Scenario A — Publication flow

1. Đăng ký USER và đăng nhập.
2. Nâng tài khoản thành SELLER.
3. Tạo DRAFT listing, upload hai ảnh hợp lệ và submit.
4. Xác nhận public search chưa thấy PENDING listing.
5. Admin duyệt.
6. Xác nhận public search/detail thấy listing và `expiresAt` bằng 30 ngày sau `publishedAt`.

### Scenario B — Re-approval and ownership

1. Seller sửa ACTIVE listing; trạng thái phải thành PENDING.
2. Seller khác sửa/xóa listing phải nhận 403.
3. Admin reject với reason; seller xem được reason và có thể sửa rồi submit lại.

### Scenario C — Search correctness

Seed tối thiểu 30 listing ở nhiều khu vực/giá/diện tích. Kiểm tra filter đơn, filter kết hợp, sort, pagination và bounding box. Kết quả không được chứa listing khác điều kiện hoặc không ACTIVE.

### Scenario D — Security

Kiểm tra token sai/hết hạn, refresh token đã revoke, BANNED user, USER gọi seller API, SELLER gọi admin API và endpoint saved-listings không xác thực.

### Scenario E — Files and failures

Kiểm tra file rỗng, quá 5 MB, MIME không hợp lệ, ảnh thứ 11, filename traversal, duplicate favorite, invalid range và optimistic locking conflict. Response không được lộ stack trace hoặc SQL.

## Completion evidence

- Báo cáo `mvn verify`.
- Migration history và ERD theo [data model](./data-model.md).
- OpenAPI JSON/YAML.
- Seed/demo script và ảnh chụp E2E publication flow.
- Bảng traceability từ FR/SC trong spec tới automated test.
