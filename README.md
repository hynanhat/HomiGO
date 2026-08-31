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

## Khởi tạo dữ liệu production

HomiGO không tạo user, dự án, tin đăng hoặc giao dịch mẫu. Bản triển khai mới chỉ đóng gói hai catalog tham chiếu có phiên bản:

- `vn-administrative-units-2025-07-01`: 34 tỉnh/thành phố và 3.321 phường/xã/đặc khu theo Quyết định 19/2025/QĐ-TTg.
- `categories-v1`: 16 danh mục mua bán/cho thuê dùng cho production.

Migration `V10` là clean cutover: nó tự dừng nếu `listings` hoặc `projects` có dữ liệu; nếu hai bảng trống, nó xóa cấu trúc `provinces/districts/wards` cũ và chuyển hẳn sang địa chỉ hai cấp. Không chỉnh sửa các migration `V1`–`V9` đã chạy.

Sau khi deploy, đăng ký tài khoản thật qua UI. Nâng đúng tài khoản đó thành admin bằng MySQL tương tác (thay email trong câu `UPDATE`):

```bash
cd /opt/homigo
sudo docker compose exec db sh
mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"
```

Tại dấu nhắc `mysql>`, chạy từng câu riêng biệt:

```sql
SELECT id, name, email, role, status FROM users ORDER BY id;
UPDATE users SET role = 'ADMIN', status = 'ACTIVE'
WHERE email = 'email-that-cua-ban@example.com';
SELECT ROW_COUNT() AS changed_rows;
SELECT id, name, email, role, status
FROM users WHERE email = 'email-that-cua-ban@example.com';
EXIT;
```

Gõ `exit` thêm một lần để rời shell container, đăng xuất rồi đăng nhập lại để JWT nhận role mới. Mở `/admin/locations` và thực hiện theo thứ tự:

1. **Kiểm tra bộ dữ liệu chính thức** — xác minh checksum, mã, quan hệ cha và số lượng 34/3.321.
2. **Kích hoạt bộ dữ liệu** — nhập catalog đã xác minh và đặt nó thành bản hiện hành.
3. **Khởi tạo 16 danh mục production** — thao tác idempotent, chạy lại không tạo bản ghi trùng.

Project và listing thật được tạo qua các màn quản trị/người bán sau bước này; chúng không nằm trong bootstrap.

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

Trên VPS tại `/opt/homigo`, deploy và kiểm tra bằng:

```bash
cd /opt/homigo
sudo docker compose up -d --build
sudo docker compose ps
curl -fsS http://127.0.0.1:8080/healthz
sudo docker inspect homigo-frontend-1 --format '{{.State.Health.Status}}'
sudo docker inspect homigo-backend-1 --format '{{.State.Health.Status}}'
```

Frontend healthcheck dùng rõ `127.0.0.1` trong container để tránh trường hợp `localhost` phân giải sang IPv6 trong khi Nginx chỉ nghe IPv4. Khi đã kích hoạt catalog, kiểm tra số lượng qua reverse proxy:

```bash
curl -fsS 'http://127.0.0.1:8080/api/v1/locations/provinces?page=0&size=100'
```

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
