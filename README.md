# HomiGO

**HomiGO** là nền tảng bất động sản trực tuyến giúp người dùng tìm kiếm nơi ở, khám phá dự án và theo dõi các tin đăng phù hợp với nhu cầu mua hoặc thuê. Sản phẩm hướng đến trải nghiệm rõ ràng, thuận tiện và minh bạch cho thị trường bất động sản Việt Nam.

## Mục tiêu của project

HomiGO kết nối người tìm bất động sản, người đăng tin và đội ngũ quản trị trong một hệ thống thống nhất. Project số hóa toàn bộ hành trình từ tìm kiếm, lưu tin, đăng bán hoặc cho thuê đến kiểm duyệt nội dung và quản lý dữ liệu vận hành.

## Chức năng nổi bật

- Tìm kiếm và lọc tin bất động sản theo nhu cầu, vị trí, loại hình, mức giá và diện tích.
- Khám phá thông tin dự án, khoảng giá, quy mô và vị trí.
- Đăng ký, đăng nhập, quản lý hồ sơ, bảo mật tài khoản và danh sách tin yêu thích.
- Gợi ý các bất động sản liên quan dựa trên đặc điểm của tin đang xem.
- Nhận thông báo về trạng thái tin đăng và các hoạt động quan trọng trong hệ thống.
- Hỗ trợ người bán tạo, chỉnh sửa, quản lý vòng đời tin đăng và theo dõi lượt xem.
- Hỗ trợ viết mô tả tin đăng bằng AI và tải lên nhiều hình ảnh.
- Tích hợp thanh toán SePay để nâng cấp tài khoản người bán.
- Cung cấp chatbot hỗ trợ tra cứu thông tin và hướng dẫn sử dụng nền tảng.
- Cho phép quản trị viên kiểm duyệt tin, quản lý người dùng, danh mục, dự án và dữ liệu địa giới hành chính.

## Vai trò người dùng

- **Khách truy cập:** tìm kiếm, xem tin đăng và khám phá dự án.
- **Thành viên:** quản lý tài khoản, lưu tin yêu thích và nhận thông báo.
- **Người bán:** đăng tin, quản lý nội dung, hình ảnh và theo dõi hiệu quả tin đăng.
- **Quản trị viên:** kiểm duyệt nội dung và quản lý dữ liệu toàn hệ thống.

## Công nghệ sử dụng

- **Frontend:** React, TypeScript, Vite, React Router, TanStack Query, React Hook Form và Zod.
- **Backend:** Java, Spring Boot, Spring Security, JWT, Spring Data JPA và Flyway.
- **Cơ sở dữ liệu:** MySQL.
- **Tích hợp:** Gemini AI và SePay.
- **Kiểm thử:** JUnit, Testcontainers, Vitest, Testing Library, MSW, Playwright và axe.
- **Triển khai:** Docker, Docker Compose và Nginx.

## Kiến trúc tổng quan

HomiGO được xây dựng theo mô hình ứng dụng web full-stack. Giao diện React giao tiếp với REST API của Spring Boot; backend xử lý nghiệp vụ, xác thực và phân quyền, đồng thời lưu trữ dữ liệu trong MySQL. Hệ thống tách biệt các khu vực công khai, tài khoản, người bán và quản trị để bảo đảm mỗi nhóm người dùng có đúng chức năng cần thiết.

## Cấu hình file `.env`

Project cung cấp sẵn file `.env.example` chứa các biến môi trường mẫu. Tại thư mục gốc của project, tạo file `.env` bằng một trong các lệnh sau:

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Sau đó mở file `.env` và thay toàn bộ giá trị bắt đầu bằng `change-me`:

- `MYSQL_ROOT_PASSWORD` và `DB_PASSWORD`: mật khẩu cho MySQL.
- `JWT_SECRET`: chuỗi bí mật ngẫu nhiên dài tối thiểu 32 byte dùng để ký JWT.
- `ANALYTICS_VIEWER_HASH_SECRET`: một chuỗi bí mật ngẫu nhiên khác dùng cho thống kê lượt xem.
- `SEPAY_MERCHANT_ID` và `SEPAY_SECRET_KEY`: thông tin SePay Sandbox; có thể để trống nếu không sử dụng chức năng thanh toán.
- `GEMINI_API_KEY`: API key của Gemini; chỉ cần khai báo khi đặt `GEMINI_ENABLED=true`.
- `HTTP_PORT` và `DB_PORT_FORWARD`: có thể đổi nếu cổng mặc định đang được ứng dụng khác sử dụng.

File `.env` ở thư mục gốc được Docker Compose tự động sử dụng. Nếu chạy Spring Boot trực tiếp bằng Maven, cần khai báo các biến tương ứng trong terminal hoặc cấu hình chạy của IDE.

Khi chạy frontend trực tiếp bằng Vite, tạo thêm file môi trường dành cho frontend:

```powershell
Copy-Item frontend/.env.example frontend/.env.local
```

Trên macOS/Linux, dùng lệnh tương đương:

```bash
cp frontend/.env.example frontend/.env.local
```

Các biến bắt đầu bằng `VITE_` được đưa tới trình duyệt, vì vậy không đặt mật khẩu, API key hoặc secret trong `frontend/.env.local`. Hai file `.env` và `frontend/.env.local` chỉ dùng trên máy cá nhân và không được commit lên Git.

---

HomiGO — *Tìm đúng nơi. Sống đúng chất.*
