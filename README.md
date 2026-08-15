# HomiGO Backend

Backend cho nền tảng bất động sản HomiGO, hỗ trợ xác thực người dùng, đăng và duyệt tin,
tìm kiếm bất động sản, lưu tin yêu thích, quản lý dự án và danh mục.

## Công nghệ

- Java 17
- Spring Boot 4.1
- Spring Web MVC, Spring Security và JWT
- Spring Data JPA
- MySQL 8
- Maven Wrapper
- H2 cho môi trường test

## Chạy local

Yêu cầu Java 17+ và MySQL 8. Tạo database:

```sql
CREATE DATABASE batdongsan;
```

Thiết lập biến môi trường:

```text
DB_HOST=localhost
DB_PORT=3306
DB_NAME=batdongsan
DB_USER=homigo
DB_PASSWORD=your_local_database_password
JWT_SECRET=replace_with_a_secret_of_at_least_32_bytes
```

Trên Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

API chạy tại `http://localhost:8080/api/v1`.

## Chạy kiểm thử

Test sử dụng H2 in-memory và không yêu cầu MySQL đang chạy:

```powershell
cd backend
.\mvnw.cmd test
```

## Chạy bằng Docker Compose

```powershell
Copy-Item .env.example .env
# Cập nhật các giá trị change-me trong .env trước khi chạy.
docker compose up --build -d
```

Compose khởi chạy MySQL và backend. Backend chỉ được khởi động sau khi MySQL sẵn sàng.

> Repository hiện tập trung hoàn toàn vào backend và không chứa frontend.
