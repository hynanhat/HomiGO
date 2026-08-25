# REST API Contract: HomiGO Backend Core

Base path: `/api/v1`. Mọi response dùng `ApiResponse`; danh sách dùng page metadata ổn định của HomiGO. Validation trả `400`, chưa đăng nhập `401`, thiếu quyền `403`, không tìm thấy `404`, xung đột version/unique `409`.

Page response có cấu trúc cố định: `content`, `number`, `size`, `totalElements`, `totalPages`, `numberOfElements`, `first`, `last`, `empty`. Các kiểu nội bộ của Spring như `pageable` và `sort` không được xuất hiện trong JSON contract.

## Authentication and profile

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Đăng ký USER |
| POST | `/auth/login` | Public | Cấp access + refresh token |
| POST | `/auth/refresh` | Public/token | Đổi refresh token |
| POST | `/auth/logout` | Authenticated | Thu hồi refresh token |
| PUT | `/auth/password` | Authenticated | Đổi mật khẩu và thu hồi phiên cũ |
| GET | `/users/me` | Authenticated | Hồ sơ hiện tại |
| PUT | `/users/me` | Authenticated | Cập nhật hồ sơ |
| GET | `/payments/sepay/seller-upgrade/offer` | Authenticated | Xem giá và trạng thái cấu hình SePay |
| POST | `/payments/sepay/seller-upgrade` | USER | Tạo checkout trả phí; không nâng quyền trực tiếp |
| GET | `/payments/sepay/seller-upgrade/{orderCode}` | Owner | Xem trạng thái thanh toán |
| POST | `/payments/sepay/ipn` | SePay/X-Secret-Key | Xác nhận thanh toán và nâng thành SELLER |

## Public discovery

`GET /listings` hỗ trợ `keyword`, `transactionType`, `provinceId`, `districtId`, `wardId`, `categoryId`, `projectId`, `minPrice`, `maxPrice`, `minArea`, `maxArea`, `bedrooms`, `minLat`, `maxLat`, `minLng`, `maxLng`, `sort`, `page`, `size`.

Sort whitelist: `newest`, `priceAsc`, `priceDesc`, `areaAsc`, `areaDesc`. Chỉ ACTIVE listing được trả về.

| Method | Path | Role |
|---|---|---|
| GET | `/listings` | Public |
| GET | `/listings/{publicCode}` | Public |
| GET | `/projects` | Public |
| GET | `/projects/{slug}` | Public |
| GET | `/categories` | Public; paginated, sorted by name then id |
| GET | `/locations/provinces` | Public |
| GET | `/locations/provinces/{id}/districts` | Public |
| GET | `/locations/districts/{id}/wards` | Public |

`GET /projects` hỗ trợ `keyword`, `districtId`, `status`, `page`, `size`.
Trạng thái hợp lệ: `PLANNING`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`.
`GET /projects/{slug}` nhận `page`, `size` để phân trang các tin ACTIVE, chưa hết hạn thuộc dự án.
Các danh sách location cũng nhận `page`, `size` theo chuẩn phân trang chung.

## Seller listing management

| Method | Path | Role |
|---|---|---|
| POST | `/seller/listings` | SELLER/ADMIN |
| GET | `/seller/listings` | SELLER/ADMIN; own listings |
| GET | `/seller/listings/{id}` | Owner/ADMIN |
| PUT | `/seller/listings/{id}` | Owner/ADMIN; requires version |
| DELETE | `/seller/listings/{id}` | Owner/ADMIN |
| POST | `/seller/listings/{id}/submit` | Owner |
| POST | `/seller/listings/{id}/deactivate` | Owner |
| POST | `/seller/listings/{id}/images` | Owner; multipart, max 10 total; returns image ID and metadata |
| DELETE | `/seller/listings/{id}/images/{imageId}` | Owner |

Create defaults to DRAFT. Submit transitions DRAFT/REJECTED/INACTIVE → PENDING. Editing ACTIVE moves it to PENDING.

## Favorites

| Method | Path | Role |
|---|---|---|
| GET | `/saved-listings` | Authenticated; paginated |
| POST | `/saved-listings/{listingId}` | Authenticated |
| DELETE | `/saved-listings/{listingId}` | Authenticated |

## Admin

| Method | Path | Role |
|---|---|---|
| GET | `/admin/listings?status=PENDING` | ADMIN; paginated |
| POST | `/admin/listings/{id}/approve` | ADMIN |
| POST | `/admin/listings/{id}/reject` | ADMIN; body `{reason}` |
| GET | `/admin/users` | ADMIN; paginated |
| POST | `/admin/users/{id}/ban` | ADMIN; body `{reason}` |
| POST | `/admin/users/{id}/unban` | ADMIN |
| GET/POST | `/admin/categories` | ADMIN; GET paginated |
| PUT/DELETE | `/admin/categories/{id}` | ADMIN |
| GET/POST | `/admin/projects` | ADMIN; GET paginated/filterable |
| PUT/DELETE | `/admin/projects/{id}` | ADMIN |
| GET/POST | `/admin/locations/provinces` | ADMIN; GET paginated |
| PUT/DELETE | `/admin/locations/provinces/{id}` | ADMIN |
| GET/POST | `/admin/locations/districts` | ADMIN; GET paginated |
| PUT/DELETE | `/admin/locations/districts/{id}` | ADMIN |
| GET/POST | `/admin/locations/wards` | ADMIN; GET paginated |
| PUT/DELETE | `/admin/locations/wards/{id}` | ADMIN |

## Security matrix

- Public: chỉ đọc listing ACTIVE, project, category và location.
- USER: public + favorite/profile + tạo checkout nâng cấp; chỉ IPN SePay hợp lệ mới cấp SELLER.
- SELLER: USER + quản lý listing sở hữu.
- ADMIN: moderation và master data; không dùng seller ownership endpoint để âm thầm sửa nội dung.
