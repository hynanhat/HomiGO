# Real Local Backend Validation

Ngày chạy: 2026-08-17  
Môi trường: Windows, MySQL 8 (`MySQL80`), database `homigo`, Spring Boot `dev`, frontend Vite tại `127.0.0.1:5173`.

## Chuẩn bị

- MySQL service đã chạy và Flyway xác nhận schema V1-V5.
- Backend khởi động ở `http://127.0.0.1:8080` bằng biến môi trường; mật khẩu database và JWT secret không được ghi vào repository.
- Tạo hai tài khoản validation local. Tài khoản seller được nâng cấp qua API; tài khoản admin được bootstrap role trực tiếp một lần trong database local vì ứng dụng cố ý không có API tự cấp quyền admin.
- Admin tạo dữ liệu master thật: category, province, district, ward và project.

## Kết quả API và vòng đời dữ liệu

| Vai trò | Kịch bản | Kết quả |
|---|---|---|
| Guest | GET danh sách ACTIVE và mở chi tiết bằng `publicCode` | PASS — HTTP 200, tìm thấy `HMG-632226958F18` |
| Account | Đăng nhập, đọc hồ sơ, lưu tin và đọc danh sách đã lưu | PASS — hồ sơ đúng, `SavedCount = 1` |
| Seller | Nâng cấp role, tạo DRAFT và submit | PASS — listing id `1`, trạng thái `PENDING` |
| Admin | Đọc queue PENDING và approve | PASS — queue thấy listing id `1`, kết quả `ACTIVE` |
| Project | Tạo project master data và mở bằng slug | PASS — `homi-riverside-20260817102529` |

## Kết quả giao diện trên backend thật

Lệnh chạy được bảo vệ bằng `HOMIGO_REAL_BACKEND=1`; email/mật khẩu được truyền qua environment và không hardcode:

```powershell
npx playwright test --config playwright.real.config.ts
```

Kết quả: **3/3 passed (10.6s)**.

- Guest tìm và mở tin ACTIVE thật.
- Account mở hồ sơ, tin đã lưu và seller workspace thật.
- Admin mở overview và category management thật.

Hai user và bộ dữ liệu có hậu tố `20260817102529` hiện còn trong MySQL local để phục vụ demo. Không có credential nào được commit.

## Convergence smoke check — 2026-08-17

- MySQL `homigo` kết nối thành công; Flyway V1–V5 đều ở trạng thái success.
- Backend chạy bằng profile mặc định `dev` với credential lấy từ environment.
- `GET /api/v1/listings?page=0&size=1`: HTTP 200.
- `GET /api/v1/projects?page=0&size=1`: HTTP 200.
- Guest gọi `/uploads/missing-smoke.jpg`: HTTP 404 từ resource handler, không còn bị Security trả 401.
- CORS preflight từ `http://localhost:5173` trả đúng `Access-Control-Allow-Origin`.
- Flyway V1→V5 chạy thành công trên một schema MySQL 8 trống; schema kiểm tra tạm đã được xóa sau khi xác nhận đủ 5 migration.
- Tiến trình backend smoke được dừng sau khi kiểm tra; không thay đổi dữ liệu nghiệp vụ.
