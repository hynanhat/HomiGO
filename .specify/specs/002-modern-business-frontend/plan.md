# Implementation Plan: HomiGO Modern Business Frontend

**Branch**: `002-modern-business-frontend` | **Date**: 2026-08-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `.specify/specs/002-modern-business-frontend/spec.md`

## Summary

Thay prototype frontend hiện tại bằng một web application bất động sản responsive có chất lượng demo đồ án: giao diện business hiện đại, design system nhất quán, API client/type an toàn, route theo role và đầy đủ các hành trình guest → user → seller → admin. Cách triển khai ưu tiên vertical slice để mỗi giai đoạn đều có một luồng chạy được với backend thật, đồng thời giữ React/Vite/Router/Axios/Context đúng constitution.

## Technical Context

**Language/Version**: TypeScript 6, React 19

**Primary Dependencies**: Vite 8, React Router 7, Axios, Tailwind CSS 4, Lucide React; dự kiến bổ sung TanStack Query cho server state và React Hook Form + Zod cho form phức tạp

**Storage**: Không có database phía frontend; URL lưu search state, bộ nhớ trình duyệt lưu refresh session theo giới hạn contract hiện tại

**Testing**: Vitest, React Testing Library, MSW, Playwright và axe accessibility checks

**Target Platform**: Trình duyệt desktop/tablet/mobile hiện đại; responsive tại tối thiểu 360 px, 768 px và 1440 px

**Project Type**: Backend-first web application với frontend SPA riêng trong `frontend/`

**Performance Goals**: Nội dung chính của trang danh sách/chi tiết xuất hiện trong 2 giây ở môi trường phát triển bình thường; chuyển route có phản hồi loading trong 100 ms; ảnh ngoài viewport được lazy-load

**Constraints**: API `/api/v1`; giao diện tiếng Việt UTF-8; access theo USER/SELLER/ADMIN; tối đa 10 ảnh/tin và 5 MB/ảnh; không Docker trong giai đoạn frontend; không mở rộng backend sang chat/payment/map analytics

**Scale/Scope**: Khoảng 20 route, 4 layout/shell, 25–35 component dùng chung/domain, 6 nhóm chức năng và 3 nhóm breakpoint

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- I Backend Architecture: **PASS** — frontend không đưa business rule vào backend controller và chỉ dùng contract đã công bố.
- II Security: **PASS WITH CONTROL** — secret không nằm trong bundle; chỉ base URL công khai dùng `VITE_`; token handling tập trung và logout khi refresh thất bại.
- III Authorization: **PASS** — route guard cải thiện UX nhưng backend vẫn là nguồn xác minh quyền cuối cùng.
- IV Data Validation: **PASS** — client validation phản hồi sớm; backend DTO validation vẫn bắt buộc.
- V Error Handling: **PASS** — API error envelope được chuẩn hóa tại một tầng duy nhất, không hiển thị chi tiết nội bộ.
- VI Database Standards: **N/A** — frontend không truy cập database trực tiếp.
- VII API Standards: **PASS** — toàn bộ call dùng `/api/v1`, `ApiResponse<T>` và `PageResponse<T>`.
- VIII Frontend Architecture: **PASS** — giữ React/Vite, React Router, shared Axios instance và Auth Context.
- IX Testing: **PASS** — backend test không bị thay đổi; frontend bổ sung test riêng cho UI và E2E.
- X Language Policy: **PASS** — code/type/file bằng tiếng Anh; UI/error tiếng Việt UTF-8.

Không có gate violation cần ngoại lệ.

## Product and Visual Direction

### Brand attributes

- Đáng tin cậy: hierarchy rõ, số liệu và trạng thái minh bạch, không dùng hiệu ứng phô trương.
- Chuyên nghiệp: typography gọn, spacing rộng, card/table có mật độ hợp lý cho nội dung bất động sản.
- Hiện đại: responsive, skeleton, sticky actions có kiểm soát, micro-interaction 150–200 ms.
- Có bản sắc: không sao chép batdongsan.com.vn; HomiGO dùng ngôn ngữ hình ảnh và màu riêng.

### Design tokens dự kiến

- Primary: brick red cho CTA chính và trạng thái thương hiệu; không phủ đỏ trên diện tích lớn.
- Ink: navy/charcoal cho header, heading và dashboard navigation.
- Surface: white và cool gray cho nền, card, form và table.
- Semantic: green/success, amber/warning, red/error, blue/information với cả icon + text.
- Typography: ưu tiên `Be Vietnam Pro` với system fallback; scale 12/14/16/20/24/32/44.
- Radius: 8 px cho control, 12 px cho card, 16 px cho hero/dialog; shadow nhẹ và border rõ.
- Layout: content width 1200–1280 px; grid 12 cột desktop, 8 tablet, 4 mobile.

### Required visual states

Mỗi component dữ liệu có đủ default, hover, focus, disabled, loading, empty, error và success. Status listing dùng badge thống nhất: DRAFT neutral, PENDING amber, ACTIVE green, REJECTED red, INACTIVE slate, EXPIRED muted.

## Application Architecture

```text
Browser route
  -> route guard/layout
    -> page/feature container
      -> query or mutation hook
        -> typed domain service
          -> shared Axios client
            -> HomiGO /api/v1
```

- Auth state: React Context chịu trách nhiệm session/user/role và hành động login/logout/refresh.
- Server state: query cache cho listing, project, location, saved listing và admin queues.
- Search state: URLSearchParams là nguồn sự thật; không sao chép bộ lọc sang global store.
- Form state: schema dùng lại cho validation, mapping field error và payload.
- UI state: local state cho dialog, gallery, mobile filter drawer và menu.
- API boundary: component không gọi Axios trực tiếp; chỉ gọi hook/service có type.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/002-modern-business-frontend/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-routes.md
│   └── frontend-api-map.md
└── tasks.md                 # tạo ở bước speckit-tasks, không thuộc plan này
```

### Source Code (repository root)

```text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── queryClient.ts
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── feedback/
│   ├── features/
│   │   ├── auth/
│   │   ├── listings/
│   │   ├── projects/
│   │   ├── saved-listings/
│   │   ├── seller/
│   │   ├── admin/
│   │   └── locations/
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   ├── formatters/
│   │   └── validation/
│   ├── pages/
│   ├── styles/
│   ├── types/
│   └── main.tsx
├── tests/
│   ├── fixtures/
│   ├── integration/
│   └── setup.ts
└── e2e/
```

**Structure Decision**: Giữ một frontend SPA duy nhất và tổ chức theo feature kết hợp design-system layer. Backend tiếp tục độc lập trong `backend/`; không tạo monorepo package hoặc microfrontend vì quy mô đồ án chưa cần.

## Delivery Roadmap

### Phase F0 — Baseline and contract lock (2 ngày)

1. Chạy `npm ci`, `npm run lint`, `npm run build` để ghi baseline.
2. Xóa boilerplate Vite/CSS, sửa UTF-8 và kiểm kê endpoint/route cũ.
3. Tạo type từ contract hiện có: `ApiResponse`, `PageResponse`, auth, listing, project, location và admin.
4. Ghi dependency backend còn thiếu: public category endpoint cho filter/form seller.

**Gate**: build sạch; không còn endpoint `/listings/saved`, `/listings/upload`, POST `/listings` hoặc route detail dùng ID nội bộ.

### Phase F1 — Foundation and design system (4 ngày)

1. Chuẩn hóa Vite env, Axios client, error mapping, refresh queue và logout fallback.
2. Tạo app providers, router, public/auth/role guards và 404/error boundary.
3. Tạo token màu/typography/spacing và component primitives.
4. Tạo public shell, account shell, seller shell, admin shell và responsive navigation.
5. Thiết lập Vitest, Testing Library, MSW và test component/API boundary đầu tiên.

**Gate**: Storybook không bắt buộc; một trang component showcase nội bộ hoặc test render chứng minh tất cả primitive/state.

### Phase F2 — Public discovery MVP (5 ngày)

1. Trang chủ business với hero search, transaction shortcuts và listing/project sections từ API thật.
2. Listing search với desktop sidebar/mobile drawer, URL-synced filters, sort, count và pagination.
3. ListingCard dùng `publicCode`, placeholder nội bộ, formatters và save action có điều kiện đăng nhập.
4. Listing detail với gallery, facts, description, location/project/contact card và unavailable state.
5. Responsive/accessibility tests cho 360/768/1440.

**Gate**: Guest hoàn thành home → search → filter → detail; không có dữ liệu mock/hardcode.

### Phase F3 — Identity, profile and favorites (4 ngày)

1. Login/register pages và field-level error mapping.
2. Auth Context hỗ trợ access/refresh token đúng field backend, rehydrate và single-flight refresh.
3. Profile, seller upgrade, password change, logout.
4. Saved listings page và optimistic save/unsave nhất quán.
5. Route guards giữ intended destination sau login.

**Gate**: Luồng auth/profile/favorite chạy end-to-end; expired/revoked session không loop.

### Phase F4 — Seller workspace (6 ngày)

1. Seller dashboard theo status với filter, pagination và action matrix.
2. Listing form đầy đủ; location cascading; category/project selector; validation và server errors.
3. Create DRAFT trước, sau đó upload/delete/reorder preview ảnh và submit.
4. Edit với `version`, conflict handling, reject reason và resubmit/deactivate/delete confirmation.
5. Test 10 ảnh, 5 MB, MIME, quyền và lifecycle.

**Gate**: USER → SELLER → DRAFT → images → PENDING chạy không cần Swagger.

### Phase F5 — Projects and admin workspace (6 ngày)

1. Project list/detail bằng slug, filter và paginated active listings.
2. Admin overview và moderation queue.
3. Approve/reject dialog, user ban/unban và role-protected navigation.
4. CRUD categories/projects/locations bằng table/form/dialog tái sử dụng.
5. Conflict, validation, destructive confirmation và success feedback.

**Gate**: Admin hoàn thành publication moderation và một vòng CRUD master data từ UI.

### Phase F6 — Quality hardening and demo (4 ngày)

1. Hoàn thiện unit/integration tests cho P1 và Playwright E2E cho guest/auth/seller/admin.
2. Kiểm tra accessibility, responsive, loading/error/empty và keyboard navigation.
3. Tối ưu ảnh, route lazy-loading, chunk size và render lại không cần thiết.
4. Xóa console/mock/TODO, chạy lint/test/build và đối chiếu 100% route/API.
5. Ghi demo script và ảnh chụp màn hình cho báo cáo đồ án.

**Final gate**: `npm run lint`, `npm run test`, `npm run build`, `npm run e2e` xanh; SC-001–SC-008 có evidence.

## Six-Week Schedule

| Tuần | Trọng tâm | Kết quả cuối tuần |
|---|---|---|
| 1 | F0 + F1 | Foundation, design system, shell và API/auth architecture |
| 2 | F2 | Public discovery MVP hoàn chỉnh |
| 3 | F3 | Auth, profile và favorites hoàn chỉnh |
| 4 | F4 phần 1 | Seller dashboard và form DRAFT |
| 5 | F4 phần 2 + F5 | Seller lifecycle, projects và admin core |
| 6 | F5 hoàn tất + F6 | Admin CRUD, E2E, accessibility và demo evidence |

Nhịp làm việc đề xuất: Thứ Hai xác định acceptance/test, Thứ Ba–Năm triển khai vertical slice, Thứ Sáu chạy quality gate, cập nhật evidence và commit. Không bắt đầu phase kế tiếp khi gate hiện tại chưa đạt.

## Dependencies and Risks

| Risk/Dependency | Impact | Mitigation |
|---|---|---|
| Backend chưa có public category endpoint | Chặn filter category và seller form không hardcode | Bổ sung endpoint read-only trước F2/F4 hoặc ghi ngoại lệ contract rõ ràng |
| Auth response hiện dùng `accessToken`, frontend cũ đọc `token` | Login prototype thất bại | Lock type và integration test ngay F1 |
| Refresh token không dùng HttpOnly cookie | Rủi ro XSS cao hơn | Giữ access token trong memory, hạn chế persistence, CSP/input hygiene; cân nhắc cookie backend ở hardening |
| Tailwind 4 nhưng CSS cũ còn boilerplate/nested syntax | Build/style thiếu ổn định | Chuẩn hóa toolchain và token CSS trong F0/F1 trước khi dựng page |
| Thiếu dữ liệu demo/ảnh thật | UI khó đánh giá | Dùng fixture có nguồn hợp lệ trong test và seed backend sau; không phụ thuộc URL placeholder ngoài |
| Phạm vi admin lớn | Dễ trễ deadline | Hoàn tất moderation trước, CRUD master data dùng chung table/form primitives |

## Post-Design Constitution Check

- React/Vite/Router/shared Axios/Auth Context được thể hiện trực tiếp trong kiến trúc: **PASS**.
- Route guard không thay backend authorization: **PASS**.
- API envelope, pagination và error handling có contract riêng: **PASS**.
- Source English/UI Vietnamese và accessibility gates được đưa vào acceptance: **PASS**.
- Không có secret hoặc database access trong frontend: **PASS**.

## Complexity Tracking

Không có constitution violation cần biện minh. TanStack Query và form schema được chọn để giảm logic lặp lại ở khoảng 20 route; không thêm Redux, microfrontend hoặc UI framework lớn.
