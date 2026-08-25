# HomiGO Frontend

Frontend React + TypeScript cho nền tảng bất động sản HomiGO. Ứng dụng có trải nghiệm public, account, seller và admin; dùng React Query cho server state, React Hook Form + Zod cho form và Axios cho API contract.

## Yêu cầu

- Node.js 22+ và npm
- Backend HomiGO chạy tại `http://localhost:8080`
- Chromium của Playwright khi chạy E2E

## Cài đặt và chạy local

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

`.env.local` chỉ chứa cấu hình public:

```text
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Không đặt password, JWT secret hoặc credential vào biến `VITE_*` vì chúng được đóng gói vào trình duyệt.

## Các route chính

| Nhóm | Route |
|---|---|
| Public | `/`, `/listings`, `/listings/:publicCode`, `/projects`, `/projects/:slug` |
| Auth/account | `/auth/login`, `/auth/register`, `/account/profile`, `/account/security`, `/saved-listings` |
| Seller | `/seller/upgrade`, `/seller/listings`, `/seller/listings/new`, `/seller/listings/:id`, `/seller/listings/:id/edit` |
| Admin | `/admin`, `/admin/listings`, `/admin/users`, `/admin/categories`, `/admin/projects`, `/admin/locations` |

Đăng ký mới luôn tạo role `USER`. Người dùng thanh toán qua SePay Sandbox để nâng cấp thành `SELLER`; frontend không bao giờ chứa merchant secret và không tự nâng quyền từ callback URL. Role `ADMIN` phải được bootstrap an toàn ở database/local seed; không có tài khoản admin mặc định trong source.

Phiên đăng nhập dùng refresh cookie `HttpOnly` do backend quản lý. Axios luôn gửi credentials; access token chỉ nằm trong bộ nhớ và refresh giữa nhiều tab được tuần tự hóa bằng Web Locks API.

## Kiểm thử và build

```powershell
npm run lint
npm run test:coverage
npm run build
npm run e2e
```

Cài browser nếu máy chưa có:

```powershell
npx playwright install chromium
```

Real-backend suite chỉ chạy chủ động và lấy credential từ environment:

```powershell
$env:HOMIGO_REAL_BACKEND='1'
$env:HOMIGO_TEST_SELLER='seller@example.com'
$env:HOMIGO_TEST_ADMIN='admin@example.com'
$env:HOMIGO_TEST_PASSWORD='your-test-password'
npx playwright test --config playwright.real.config.ts
```

## Demo

Kịch bản và ảnh responsive nằm trong `.specify/specs/002-modern-business-frontend/evidence/`. Khi demo, chạy MySQL → backend → frontend theo thứ tự, sau đó trình bày luồng guest → account/seller → admin.
