# HomiGO - Bất Động Sản Platform

Nền tảng website bất động sản (rút gọn theo mô hình batdongsan.com.vn) cho phép người dùng tìm kiếm, đăng tin mua bán/cho thuê nhà đất, và xem thông tin các dự án bất động sản.

## Công nghệ sử dụng
- **Backend:** Java Spring Boot 3.x (Spring Web, Spring Data JPA, Spring Security), MySQL 8, JWT
- **Frontend:** React (Vite), Tailwind CSS

## Cài đặt và chạy dự án (Local)

### 1. Database
Yêu cầu MySQL 8.
Tạo database tên `batdongsan`.
```sql
CREATE DATABASE batdongsan;
```

### 2. Chạy Backend
Chuyển tới thư mục `backend/` và cấu hình các biến môi trường trong file `.env` hoặc trực tiếp trong IDE:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=batdongsan
DB_USER=root
DB_PASSWORD=root
JWT_SECRET=your_super_secret_jwt_key_that_is_at_least_32_bytes_long
```
Chạy ứng dụng:
```bash
mvn spring-boot:run
```

### 3. Chạy Frontend
Chuyển tới thư mục `frontend/`:
```bash
npm install
npm run dev
```

## Triển khai bằng Docker

Dự án bao gồm `docker-compose.yml` để dễ dàng triển khai toàn bộ (Database, Backend, Frontend).

Tại thư mục gốc của dự án, chạy:
```bash
docker-compose up --build -d
```
Ứng dụng sẽ được chạy tại:
- Frontend: http://localhost:80
- Backend API: http://localhost:8080/api/v1
