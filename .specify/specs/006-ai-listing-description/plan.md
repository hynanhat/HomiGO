# Implementation Plan: AI Listing Description

**Branch**: `[006-ai-listing-description]` | **Date**: 2026-08-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `.specify/specs/006-ai-listing-description/spec.md`

## Summary

Thêm trợ lý viết mô tả bằng Gemini vào form tạo và chỉnh sửa tin đăng dành riêng cho SELLER. Backend nhận từ khóa cùng danh sách trường form được cho phép, tự tra cứu tên danh mục/vị trí/dự án từ ID, gọi Gemini Interactions API v1 ở chế độ một lượt và trả bản nháp tiếng Việt 600–900 ký tự để xem trước. API key chỉ tồn tại ở backend. Quota được thực thi bằng hàng tổng hợp theo SELLER/ngày và reservation có thời hạn trong MySQL, nhờ đó chỉ kết quả hợp lệ mới trừ lượt và các yêu cầu đồng thời không thể vượt quá 5 lượt/ngày.

## Technical Context

**Language/Version**: Java 17, Spring Boot 4.1; TypeScript 6.0, React 19

**Primary Dependencies**: Spring WebMVC `RestClient`, Spring Data JPA, Spring Security, Bean Validation, Flyway; React Query, Axios, React Hook Form, Zod

**Storage**: MySQL 8/InnoDB với `ai_daily_usage` và `ai_description_reservations`; không lưu prompt hoặc bản nháp AI

**Testing**: JUnit 5, Mockito, Spring MVC tests, MySQL Testcontainers; Vitest, React Testing Library, MSW, Playwright

**Target Platform**: Backend Linux/container, trình duyệt desktop và mobile hiện đại

**Project Type**: Ứng dụng web full-stack với REST API

**Performance Goals**: Hoàn thành thao tác tạo và áp dụng bản nháp trong 45 giây; timeout Gemini mặc định 15 giây; từ chối quota trước khi gọi provider; 10 yêu cầu đồng thời của một SELLER không có quá 5 kết quả thành công

**Constraints**: Chỉ SELLER hoạt động; 5 kết quả thành công/ngày theo `Asia/Ho_Chi_Minh`; đầu ra tiếng Việt 600–900 ký tự, 2–3 đoạn; không gửi dữ liệu liên hệ, tọa độ hoặc xác thực; API key/model/feature flag chỉ cấu hình server; mô tả thủ công luôn dùng được khi AI lỗi
**Scale/Scope**: Hai form seller hiện có, hai endpoint mới, một integration Gemini, hai bảng quota và bộ kiểm thử đồng thời/khôi phục; không có streaming, chat nhiều lượt, tool calling hoặc tự động đăng tin

## Constitution Check

*GATE: Passed before Phase 0 and re-checked after Phase 1 design.*

- **I. Backend Architecture**: PASS — controller chỉ quản lý HTTP; orchestration, Gemini client, quota transaction, repository, entity và DTO được tách đúng layer.
- **II. Security**: PASS — Spring Security/JWT hiện có bảo vệ endpoint; Auth API key chỉ đọc từ environment ở backend và không xuất hiện trong source, log, response hoặc bundle frontend.
- **III. Authorization**: PASS — route `/api/v1/seller/**` yêu cầu role SELLER; service kiểm tra tài khoản active và mọi quota row gắn với authenticated seller.
- **IV. Data Validation**: PASS — request DTO dùng Bean Validation cho required/range/size; các kiểm tra tham chiếu chéo và output nằm ở domain service/validator chuyên trách.
- **V. Error Handling**: PASS — lỗi được map tập trung qua `@ControllerAdvice`, dùng `ApiResponse`/`ErrorCode` và không trả stack trace hay raw Gemini error.
- **VI. Database Standards**: PASS — MySQL/InnoDB, tên bảng/cột `snake_case`, foreign key rõ ràng, Flyway V9 và transaction/lock bảo vệ integrity.
- **VII. API Standards**: PASS — hai REST endpoint dùng prefix `/api/v1`, success/error envelope thống nhất; không có collection endpoint cần pagination.
- **VIII. Frontend Architecture**: PASS — React/Vite/Router hiện có được giữ nguyên, mọi call đi qua centralized Axios và server auth tiếp tục dùng Auth Context.
- **IX. Testing**: PASS — JUnit/Mockito cho core services, Spring MVC contract tests và MySQL Testcontainers cho concurrency; frontend có Vitest/RTL/Playwright.
- **X. Language Policy**: PASS — identifier/source code dự kiến dùng tiếng Anh; toàn bộ label và thông báo end-user dùng tiếng Việt.
- **Post-design re-check**: PASS — data model và API contracts không tạo ngoại lệ Hiến pháp.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/006-ai-listing-description/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api.md
│   └── ui.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/batdongsan/
│   ├── config/
│   │   ├── GeminiProperties.java
│   │   ├── GeminiClientConfig.java
│   │   └── TimeConfig.java
│   ├── controller/AiDescriptionController.java
│   ├── dto/ai/
│   │   ├── AiDescriptionGenerateReq.java
│   │   ├── AiDescriptionDraftRes.java
│   │   └── AiDescriptionQuotaRes.java
│   ├── entity/
│   │   ├── AiDailyUsage.java
│   │   └── AiDescriptionReservation.java
│   ├── repository/
│   │   ├── AiDailyUsageRepository.java
│   │   └── AiDescriptionReservationRepository.java
│   ├── service/ai/
│   │   ├── AiDescriptionService.java
│   │   ├── AiDescriptionPromptFactory.java
│   │   ├── AiDescriptionOutputValidator.java
│   │   ├── AiDescriptionClient.java
│   │   ├── GeminiInteractionsClient.java
│   │   ├── AiQuotaService.java
│   │   └── AiQuotaCleanupJob.java
│   └── exception/ErrorCode.java
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/V9__ai_description_quota.sql
└── src/test/java/com/batdongsan/
    ├── controller/AiDescriptionControllerTest.java
    ├── service/ai/AiDescriptionServiceTest.java
    ├── service/ai/AiQuotaServiceTest.java
    └── integration/AiDescriptionQuotaConcurrencyIT.java

frontend/
├── src/features/seller/
│   ├── aiDescriptionApi.ts
│   ├── aiDescriptionQueries.ts
│   ├── aiDescriptionTypes.ts
│   ├── AiDescriptionAssistant.tsx
│   ├── AiDescriptionAssistant.test.tsx
│   └── ListingForm.tsx
└── e2e/ai-listing-description.spec.ts
```

**Structure Decision**: Giữ nguyên cấu trúc backend/frontend hiện tại. Chức năng AI phía backend được cô lập dưới `service/ai`; frontend đặt cạnh feature seller và tích hợp một component vào `ListingForm`, nên cả Create/Edit tự dùng chung hành vi mà không nhân đôi code.

## Implementation Phases

### Phase A — Persistence and quota admission

1. Thêm Flyway V9 cho hai bảng quota, unique constraint, foreign key, check constraint và index cleanup.
2. Bổ sung `Clock` theo business zone để test chính xác thời điểm reset.
3. Cài đặt reserve/finalize/release/expire trong các transaction ngắn, cùng thứ tự lock; lời gọi Gemini luôn ở ngoài transaction.
4. Thêm lazy cleanup khi đọc/reserve và scheduled cleanup theo batch cho reservation hết hạn.

### Phase B — Gemini integration and domain service

1. Thêm typed configuration cho feature flag, Auth API key, model stable, endpoint, timeout, retry và output budget.
2. Cài `GeminiInteractionsClient` bằng Spring `RestClient`, `store=false`, structured JSON output và retry có giới hạn cho lỗi tạm thời.
3. Xây prompt server-controlled từ dữ liệu allowlist đã được backend resolve; coi keywords là dữ liệu không tin cậy.
4. Kiểm tra response completed, JSON schema, 600–900 ký tự, 2–3 đoạn và nội dung cấm trước khi finalize quota.

### Phase C — Seller API

1. Thêm endpoint đọc quota và endpoint tạo draft theo hợp đồng trong `contracts/api.md`.
2. Kiểm tra SELLER active, validate dữ liệu và map lỗi thành mã HomiGO an toàn.
3. Bảo đảm request hết quota, feature tắt hoặc dữ liệu sai không gọi Gemini.

### Phase D — Frontend preview workflow

1. Thêm API hooks/types và `AiDescriptionAssistant` trong `ListingForm` dùng chung.
2. Hiển thị keywords, lượt còn lại/reset time, loading và bản xem trước tách khỏi textarea mô tả.
3. “Dùng mô tả này” mới cập nhật form; “Hủy” giữ nguyên; “Tạo lại” gửi request mới và thông báo rõ việc dùng thêm lượt nếu thành công.
4. Khi AI lỗi/tắt/hết quota, không khóa textarea hoặc thao tác lưu tin thủ công.

### Phase E — Verification

1. Unit test prompt/output/error/retry và quota state machine với fixed clock.
2. MySQL Testcontainers test 10 request đồng thời, provider failure, expiry/crash, restart persistence và boundary không giữ transaction khi gọi provider.
3. Frontend component tests cho preview/apply/cancel/regenerate/quota/error; Playwright cho Create/Edit.
4. Chạy backend tests, frontend test/build/lint, Flyway validation và secret scan trước bàn giao.

## Complexity Tracking

Không có vi phạm Hiến pháp cần biện minh. Hai bảng quota là độ phức tạp có chủ đích để vừa bảo đảm giới hạn đồng thời vừa khôi phục slot sau timeout/crash mà không giữ transaction trong lúc gọi Gemini.
