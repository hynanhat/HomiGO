# HomiGO

HomiGO là đồ án web bất động sản full-stack theo phong cách business hiện đại. Hệ thống hỗ trợ tìm kiếm tin, dự án, tài khoản/yêu thích, quy trình đăng và duyệt tin, cùng workspace quản trị master data.

## Công nghệ

- Backend: Java, Spring Boot, Spring Security + JWT, JPA, Flyway, MySQL
- Frontend: React, TypeScript, Vite, React Query, React Hook Form, Zod
- Kiểm thử: JUnit/H2, Testcontainers/MySQL, Vitest, Testing Library, MSW, Playwright, axe

## Cấu trúc

```text
backend/    Spring Boot API
frontend/   React SPA
.specify/   spec, plan, tasks và evidence của Spec Kit
```

## 1. Chuẩn bị database

Yêu cầu MySQL 8. Tạo database nếu chưa có:

```sql
CREATE DATABASE homigo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Không commit password. Backend đọc cấu hình qua environment:

```text
DB_HOST=localhost
DB_PORT=3306
DB_NAME=homigo
DB_USER=your_mysql_user
DB_PASSWORD=your_local_database_password
JWT_SECRET=replace_with_a_secret_of_at_least_32_bytes
FILE_UPLOAD_DIR=uploads
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ANALYTICS_VIEWER_HASH_SECRET=replace_with_a_separate_random_secret
APP_BUSINESS_ZONE=Asia/Ho_Chi_Minh
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=Strict
SELLER_UPGRADE_PRICE=99000
SEPAY_MERCHANT_ID=your_sandbox_merchant_id
SEPAY_SECRET_KEY=your_rotated_sandbox_secret
SEPAY_ENVIRONMENT=sandbox
SEPAY_FRONTEND_BASE_URL=http://localhost:5173
GEMINI_ENABLED=false
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.7-flash
GEMINI_API_VERSION=v1
GEMINI_CONNECT_TIMEOUT_MS=2000
GEMINI_TIMEOUT_MS=15000
GEMINI_MAX_ATTEMPTS=2
```

Profile mặc định là `dev`. Khi triển khai thật, đặt `SPRING_PROFILES_ACTIVE=prod` và khai báo rõ `CORS_ALLOWED_ORIGINS`, `FILE_UPLOAD_DIR`; không sửa cứng các giá trị này trong source.

## 2. Chạy backend

PowerShell:

```powershell
$env:DB_HOST='localhost'
$env:DB_PORT='3306'
$env:DB_NAME='homigo'
$env:DB_USER='your_mysql_user'
$env:DB_PASSWORD='your_local_database_password'
$env:JWT_SECRET='replace-with-a-long-local-secret-at-least-32-bytes'
$env:SEPAY_MERCHANT_ID='your-sandbox-merchant-id'
$env:SEPAY_SECRET_KEY='your-new-rotated-sandbox-secret'
cd backend
.\mvnw.cmd spring-boot:run
```

- API: `http://localhost:8080/api/v1`
- OpenAPI: `http://localhost:8080/swagger-ui.html`

Flyway tự chạy migration. Phần lớn backend tests dùng H2; test migration/schema dùng Testcontainers và tự bỏ qua khi máy không có Docker:

```powershell
cd backend
.\mvnw.cmd test
```

## 3. Chạy frontend

Mở terminal khác:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Ứng dụng: `http://localhost:5173`. Xem [frontend/README.md](frontend/README.md) để biết route, account và toàn bộ lệnh kiểm thử.

## Tài khoản và dữ liệu demo

- Đăng ký qua UI tạo `USER`.
- `USER` thanh toán một lần qua SePay Sandbox tại `/seller/upgrade`; chỉ IPN hợp lệ mới nâng quyền thành `SELLER`.
- `ADMIN` không có credential mặc định và phải được bootstrap trong môi trường local/seed có kiểm soát.
- Trước demo, admin cần tạo category/location/project; seller tạo rồi submit tin; admin approve để tin xuất hiện ở public search.

## Chức năng nâng cao

- **Thông báo trong ứng dụng:** seller/admin nhận cập nhật khi tin được gửi duyệt, duyệt, từ chối hoặc hết hạn. Chuông thông báo tự kiểm tra dữ liệu mới mỗi 30 giây; có trang hộp thư, lọc chưa đọc và đánh dấu tất cả đã đọc.
- **Thống kê lượt xem:** trang chi tiết công khai ghi tối đa một lượt xem cho mỗi khách/tin/ngày. Seller xem tổng lượt, hôm nay, 7 ngày gần nhất và biểu đồ 7/30/90 ngày tại trang chi tiết tin của mình.
- **Gợi ý bất động sản:** cuối trang chi tiết hiển thị tối đa sáu tin đang hoạt động, xếp hạng theo loại hình, giao dịch, vị trí, dự án, giá và diện tích; mỗi thẻ nêu lý do được gợi ý.
- **Viết mô tả bằng AI:** chỉ `SELLER` có thể tạo bản xem trước từ từ khóa và dữ liệu đang có trong form. Mỗi seller có tối đa 5 lần tạo thành công mỗi ngày theo múi giờ Việt Nam; lỗi Gemini không trừ lượt. API key chỉ được cấu hình ở backend, không đặt trong biến `VITE_*` hoặc source frontend.

Để bật AI ở môi trường local, đặt `GEMINI_ENABLED=true` và `GEMINI_API_KEY` trong file `.env` không được commit, rồi khởi động lại backend. Giao diện tạo/chỉnh sửa tin vẫn cho nhập mô tả thủ công khi AI bị tắt hoặc tạm lỗi. Hướng dẫn kiểm tra chi tiết nằm tại [.specify/specs/006-ai-listing-description/quickstart.md](.specify/specs/006-ai-listing-description/quickstart.md).

## Cấu hình SePay Sandbox và IPN

- Secret SePay chỉ đặt ở environment của backend; không đặt vào `.env` frontend hoặc biến `VITE_*`.
- Nếu một secret từng được gửi qua chat/log, hãy thu hồi và tạo secret mới trước khi chạy.
- Trên trang quản lý merchant SePay, chọn xác thực IPN bằng `SECRET_KEY`.
- SePay không gọi được `localhost`. Khi demo local, dùng HTTPS tunnel trỏ tới port 8080 rồi cấu hình IPN URL là `https://<tunnel>/api/v1/payments/sepay/ipn`.
- Browser callback vẫn có thể dùng `http://localhost:5173` vì chính trình duyệt người demo thực hiện redirect.

Chi tiết từng bước nằm tại [.specify/specs/004-sepay-seller-upgrade/quickstart.md](.specify/specs/004-sepay-seller-upgrade/quickstart.md).

Refresh token chỉ được lưu trong cookie `HttpOnly`; frontend không ghi access/refresh token vào `localStorage`. Khi chạy HTTPS production, bắt buộc đặt `AUTH_COOKIE_SECURE=true`.

## Chạy toàn bộ stack bằng Docker

```powershell
Copy-Item .env.example .env
# Thay toàn bộ giá trị change-me trước khi chạy
docker compose up --build
```

Ứng dụng mở tại `http://localhost` (hoặc `HTTP_PORT` đã cấu hình). Compose có healthcheck, SPA fallback/proxy API, volume bền vững cho MySQL và ảnh upload. Khi triển khai public qua HTTPS, đặt `AUTH_COOKIE_SECURE=true`; không công khai trực tiếp port backend/database.

## Kiểm tra release

```powershell
cd backend
.\mvnw.cmd test

cd ..\frontend
npm run lint
npm run test:coverage
npm run build
npm run e2e
```
