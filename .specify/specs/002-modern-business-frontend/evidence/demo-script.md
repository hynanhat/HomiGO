# Graduation Demo Script

Thời lượng đề xuất: 8-10 phút.

## Chuẩn bị trước khi trình bày

1. Bật MySQL và backend ở port `8080`.
2. Bật frontend ở port `5173` với `VITE_API_BASE_URL=http://localhost:8080/api/v1`.
3. Chuẩn bị một tài khoản SELLER, một tài khoản ADMIN và ít nhất một tin PENDING.
4. Mở sẵn tab trang chủ, seller dashboard và admin moderation.

## Luồng trình bày

1. **Giới thiệu (45 giây)** — HomiGO là nền tảng web bất động sản có quy trình kiểm duyệt, phân quyền guest/account/seller/admin và giao diện business responsive.
2. **Guest discovery (2 phút)** — từ trang chủ chọn Mua/Thuê, nhập từ khóa, sang `/listings`, dùng bộ lọc URL-backed, mở chi tiết qua `publicCode`, xem gallery/thông tin/liên hệ.
3. **Account (1 phút)** — đăng nhập, lưu/bỏ lưu tin, mở danh sách yêu thích, cập nhật hồ sơ và giới thiệu cơ chế refresh/logout.
4. **Seller (2 phút)** — mở dashboard, tạo DRAFT bằng form đầy đủ, tải ảnh, submit sang PENDING và chỉ ra các action hợp lệ theo trạng thái.
5. **Admin (2 phút)** — mở overview, moderation queue, approve/reject; lướt qua quản lý user, category, project và location.
6. **Chất lượng (1 phút)** — thu trình duyệt về mobile, điều hướng bằng bàn phím, nêu kết quả Vitest/Playwright/axe và lazy-loaded production build.
7. **Kết luận (30 giây)** — demo đường đi khép kín seller → admin → guest và nêu phần mở rộng sau đồ án như bản đồ/chat/payment chỉ khi có backend contract.

## Ảnh đã duyệt

- `screenshots/home-mobile-360.png`
- `screenshots/home-tablet-768.png`
- `screenshots/home-desktop-1440.png`

Ba ảnh được sinh từ cùng dữ liệu deterministic và đã kiểm tra trực quan: không tràn ngang, không cắt CTA, phân cấp heading/card/footer rõ ràng.
