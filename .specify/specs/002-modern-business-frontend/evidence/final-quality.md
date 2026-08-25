# Final Quality Gate

Ngày chạy: 2026-08-17

| Gate | Kết quả | Chi tiết |
|---|---|---|
| `npm run lint` | PASS | Oxlint exit code 0, không có warning/error |
| `npm test` | PASS | 23 test files, 70 tests passed, 0 failed |
| `npm run build` | PASS | TypeScript build và Vite production build thành công; 2048 modules transformed |
| `npm run e2e` | PASS | 27 deterministic tests passed ở 360/768/1440; 9 real-backend variants chủ động skipped |
| Real backend Playwright | PASS | 3/3 tests passed với MySQL/Spring Boot thật |
| `mvnw.cmd test` | PASS | 66 backend tests passed, 0 failure/error/skipped; BUILD SUCCESS |

## Production bundle

- Entry JS: `319.85 kB`, gzip `103.64 kB`.
- CSS: `34.42 kB`, gzip `7.62 kB`.
- Các route public/account/seller/admin được tách thành lazy chunks; không có chunk vượt ngưỡng cảnh báo 500 kB.

## Ghi chú

- Vitest/axe trên jsdom in thông báo `HTMLCanvasElement.getContext` chưa được mô phỏng; đây là giới hạn môi trường contrast check, không làm test fail. Axe browser checks chạy bằng Chromium đã pass.
- Real-backend specs được skip trong suite deterministic để CI không phụ thuộc credential/MySQL; chúng chỉ chạy khi `HOMIGO_REAL_BACKEND=1`.
- Source scan không tìm thấy `console`, `TODO`, `FIXME`, URL localhost, URL ngoài hoặc chuỗi mojibake trong `frontend/src`.

## Convergence revalidation — 2026-08-17

| Gate | Kết quả | Chi tiết |
|---|---|---|
| Backend test suite | PASS | 77 tests passed, 0 failure/error/skipped |
| Backend package | PASS | Spring Boot executable JAR được đóng gói thành công |
| Frontend lint | PASS | Oxlint exit code 0 |
| Frontend unit/integration | PASS | 25 files, 74 tests passed |
| Frontend production build | PASS | TypeScript + Vite build thành công, 2048 modules transformed |
| Frontend Playwright | PASS | 27 deterministic tests passed tại 360/768/1440; 9 real-backend variants skipped theo thiết kế |

Các regression mới bảo vệ public upload access, seller lifecycle/image policy, file cleanup sau commit, image upload DTO, project consistency/full edit data, refresh-token locking/cleanup và bounded entity graphs.
