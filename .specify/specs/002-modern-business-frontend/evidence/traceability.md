# Frontend Requirement Traceability

Ngày đối chiếu: 2026-08-17

| Yêu cầu | Phần triển khai chính | Task | Kiểm thử / minh chứng |
|---|---|---|---|
| FR-001 | App shell, header, navigation, footer, trạng thái theo role | T015, T018, T085-T086 | `appShell.test.tsx`, `responsive.spec.ts` |
| FR-002 | Trang chủ, tìm kiếm chính, lối tắt và dữ liệu nổi bật | T034-T035 | `publicListings.test.tsx`, `public-discovery.spec.ts` |
| FR-003 | Bộ lọc, sort, phân trang và URL search state | T027-T031 | `listingSearchState.test.ts`, `public-discovery.spec.ts` |
| FR-004 | Route `publicCode`, formatter tiếng Việt | T028, T032-T033 | `listingApi.test.ts`, `public-discovery.spec.ts` |
| FR-005 | Gallery, thuộc tính, mô tả, vị trí, dự án, liên hệ | T032-T033 | `publicListings.test.tsx`, `public-discovery.spec.ts` |
| FR-006 | Đăng ký/đăng nhập/phiên/hồ sơ/nâng cấp/đổi mật khẩu | T054-T060 | `account.test.tsx`, `account.spec.ts` |
| FR-007 | Lưu/bỏ lưu và danh sách tin đã lưu | T061-T064 | `savedListings.test.tsx`, `account.spec.ts` |
| FR-008 | Dashboard seller, form, ảnh và lifecycle | T067-T078 | `sellerWorkspace.test.tsx`, `seller-publication.spec.ts` |
| FR-009 | Layout admin, kiểm duyệt, user và master data | T094-T102 | `adminWorkspace.test.tsx`, `admin.spec.ts` |
| FR-010 | Danh sách, filter, slug detail và tin thuộc dự án | T041-T050 | `projects.test.tsx`, `projects.spec.ts` |
| FR-011 | API client, error mapper, toast và mutation handling | T009-T014, T019 | API unit tests và story integration tests |
| FR-012 | Auth/role guard phía frontend; backend vẫn xác minh quyền | T017, T066, T103 | `guards.test.tsx`, `admin.spec.ts` |
| FR-013 | Bộ UI dùng chung và feedback states | T020-T025 | component/unit tests và các trang story |
| FR-014 | Design tokens, typography, spacing và breakpoint | T002-T005, T084 | `foundation.md`, screenshot 360/768/1440 |
| FR-015 | Nội dung UTF-8 tiếng Việt, tên code tiếng Anh | T004, T106 | lint, regression scan và review source |
| FR-016 | Responsive, keyboard, label, focus, heading, contrast | T083-T090 | `accessibility.test.tsx`, `accessibility.spec.ts`, `responsive.spec.ts` |
| FR-017 | Error boundary, 404, loading/empty/error/retry | T016, T024-T026 | component và integration tests |
| FR-018 | Hành trình P1 có integration và end-to-end tests | T037-T039, T052-T053, T064-T065, T078-T080, T091-T093 | Vitest + Playwright suites |
| FR-019 | Không còn integration cũ, ID cố định hay localhost trong business logic | T010, T106-T107 | `regression.test.tsx`, source scan |
| FR-020 | Không thêm chat/payment/recommendation/map/price analytics | Toàn bộ scope | Review router, API modules và `tasks.md` |
| SC-001 | Tìm kiếm → mở chi tiết ngắn gọn, trực tiếp | T030-T039 | `public-discovery.spec.ts`; demo script |
| SC-002 | P1 có loading/empty/error/success | T024-T026 và từng story | Integration suites + evidence từng story |
| SC-003 | Không tràn ngang ở 360/768/1440 | T084, T088, T111 | `responsive.spec.ts`; screenshots |
| SC-004 | Axe và kiểm tra bàn phím đạt, không có lỗi nghiêm trọng | T083, T087, T089-T090, T110 | `accessibility.test.tsx`, `accessibility.spec.ts` |
| SC-005 | Nội dung chính render trong mục tiêu 2 giây ở môi trường local | T036, T051, T104 | Playwright timing assertions và lazy route chunks |
| SC-006 | Contract backend khớp, không mock path/ID public sai | T009-T014, T028, T042, T054, T068, T094, T106 | API unit tests, backend validation |
| SC-007 | Seller submit; admin approve/reject không dùng Swagger | T073-T080, T096-T097 | seller/admin Playwright và real-backend validation |
| SC-008 | Lint, test, build và Playwright đều thành công | T108 | `final-quality.md` |

Mỗi yêu cầu chức năng và tiêu chí thành công đều có ít nhất một task triển khai và một điểm kiểm chứng. Kết quả chạy cuối cùng được khóa tại `final-quality.md`.
