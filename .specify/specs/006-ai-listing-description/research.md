# Phase 0 Research: AI Listing Description

**Date**: 2026-08-24

**Scope**: Gemini integration, key security, prompt/output safety, daily quota and failure semantics.

## 1. Gemini API surface

**Decision**: Dùng Gemini Interactions API v1 qua một request REST không streaming, `store=false`, `background=false`, không truyền `previous_interaction_id`.

**Rationale**: Interactions API đã GA và là API Google khuyến nghị cho dự án mới; tác vụ này vẫn là single-turn nhưng không cần trạng thái hoặc streaming. Tách client sau interface `AiDescriptionClient` để thay transport/SDK mà không ảnh hưởng domain service.

**Alternatives considered**:

- `generateContent`: vẫn được hỗ trợ nhưng không còn là hướng ưu tiên cho dự án mới.
- Stateful interaction: không có hội thoại cần nối tiếp và tạo thêm lưu trữ không cần thiết.
- Streaming: đoạn 600–900 ký tự không đủ lợi ích để bù độ phức tạp SSE.

**Sources**: [Interactions API overview](https://ai.google.dev/gemini-api/docs/interactions-overview), [Interactions REST reference](https://ai.google.dev/api/interactions-api-v1), [API versions](https://ai.google.dev/gemini-api/docs/api-versions)

## 2. Java transport

**Decision**: Dùng Spring WebMVC `RestClient` gọi trực tiếp `POST https://generativelanguage.googleapis.com/v1/interactions`.

**Rationale**: HomiGO đã dùng Spring Boot 4.1/WebMVC. REST tránh thêm WebFlux và tránh phụ thuộc vào Interactions abstraction chưa ổn định trong Java SDK; interface nội bộ vẫn cho phép chuyển sang SDK sau này.

**Alternatives considered**:

- Google Gen AI Java SDK với `generateContent`: typed client tốt nhưng khóa feature vào API cũ hơn.
- `WebClient`: thêm reactive stack không cần thiết cho một unary call.

**Sources**: [Interactions SDK status](https://ai.google.dev/gemini-api/docs/interactions-overview#sdks), [Google Gen AI Java SDK](https://github.com/googleapis/java-genai)

## 3. API key, model and configuration

**Decision**: Tạo Gemini Auth API key trong Google AI Studio, chỉ đọc ở backend qua `GEMINI_API_KEY` và gửi trong header `x-goog-api-key`. Model, feature flag, timeout và retry đều lấy từ cấu hình; mặc định model stable `gemini-3.7-flash`, không dùng alias `latest` hoặc preview.

**Rationale**: Key phía browser sẽ bị lộ và cho phép bỏ qua quota HomiGO. Google thông báo Standard key sẽ bị từ chối từ tháng 9/2026; Auth key là lựa chọn vận hành phù hợp. Model cấu hình qua environment cho phép đổi theo vòng đời mà không build lại.

**Configuration baseline**:

```text
GEMINI_ENABLED=false
GEMINI_API_KEY=<server-only Auth key>
GEMINI_MODEL=gemini-3.7-flash
GEMINI_API_VERSION=v1
GEMINI_TIMEOUT_MS=15000
GEMINI_MAX_ATTEMPTS=2
GEMINI_MAX_OUTPUT_TOKENS=1024
GEMINI_THINKING_LEVEL=minimal
```

**Alternatives considered**:

- Standard key: sắp hết vòng đời.
- Model `latest`/preview: có thể thay đổi hành vi hoặc ngừng bất ngờ.
- Hard-code key/model: không đạt yêu cầu bảo mật và vận hành.

**Sources**: [Using Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key), [Gemini models](https://ai.google.dev/gemini-api/docs/models)

## 4. Structured response and output validation

**Decision**: Yêu cầu JSON structured output với đúng một trường `description`, sau đó backend vẫn kiểm tra trạng thái `completed`, JSON parse, ký tự, số đoạn và nội dung cấm trước khi trả draft.

**Rationale**: JSON schema giữ response shape ổn định, nhưng giới hạn ký tự và factuality vẫn là nghiệp vụ phía server. Output rỗng, malformed, incomplete, ngoài 600–900 ký tự hoặc không có 2–3 đoạn đều là thất bại và phải release reservation.

**Validation baseline**:

- Plain Vietnamese text, 600–900 Unicode code points sau normalize/trim.
- Hai hoặc ba đoạn không rỗng, phân tách bằng newline trống.
- Không Markdown/code fence, HTML/script, email, URL hoặc số điện thoại.
- Không chứa field kỹ thuật, system instruction hoặc dữ kiện ngoài allowlist.

**Alternatives considered**:

- Plain text không schema: khó phân biệt phần giải thích dư với mô tả.
- Tin hoàn toàn vào schema/model: không bảo đảm độ dài hoặc tính đúng dữ kiện.

**Sources**: [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output), [Safety and factuality guidance](https://ai.google.dev/gemini-api/docs/safety-guidance)

## 5. Prompt construction and injection resistance

**Decision**: System instruction do backend kiểm soát; form data/keywords được truyền trong cấu trúc rõ ràng như untrusted data. Backend resolve tên category/district/ward/project từ ID và chỉ allowlist field cần thiết. Không bật tools, search, function calling hoặc quyền truy cập dữ liệu khác.

**Rationale**: Không tin tên/ID do client tự diễn giải giúp prompt chính xác hơn và giảm spoofing. Delimiter, nhiệm vụ hẹp, input/output validation và human preview là nhiều lớp bảo vệ phù hợp cho MVP.

**Alternatives considered**:

- Nối keywords trực tiếp vào instruction: dễ bị prompt injection.
- Blocklist riêng cụm “ignore previous instructions”: dễ vượt qua và có false positive.
- Model Armor: hữu ích ở mức bảo vệ cao hơn nhưng thêm dịch vụ/chi phí cho MVP không có tool.

**Sources**: [Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies), [Safety guidance](https://ai.google.dev/gemini-api/docs/safety-guidance)

## 6. Daily quota and concurrency

**Decision**: Dùng `ai_daily_usage` làm aggregate theo SELLER/business date và `ai_description_reservations` làm lease cho từng request. Reserve, finalize, release và expire chạy trong transaction ngắn với pessimistic row lock; Gemini call nằm ngoài transaction.

**Rationale**: Hàng usage tuần tự hóa admission theo đúng một SELLER/ngày; lease ngăn vượt 5 khi gửi đồng thời và tự hoàn slot sau crash/hang. Chỉ transition `RESERVED -> SUCCEEDED` tăng `successful_count`.

**Operational semantics**:

- Ngày lấy từ injected `Clock` với `Asia/Ho_Chi_Minh` tại lúc reserve.
- Request qua nửa đêm vẫn thuộc ngày đã reserve.
- Lease dài hơn tổng timeout/retry budget và margin; baseline 90 giây.
- Lazy cleanup chạy khi reserve/read, cộng scheduled sweeper mỗi phút.
- `remainingAttempts = 5 - successful_count`; `availableNow = 5 - successful_count - reserved_count`.
- Nếu success đã là 5: `AI_DAILY_LIMIT_REACHED`; nếu 5 slot đang success/reserved: `AI_QUOTA_TEMPORARILY_RESERVED`.

**Alternatives considered**:

- In-memory/Redis counter: in-memory mất khi restart/multi-instance; Redis là hạ tầng chưa cần và vẫn cần lease/atomic script.
- Chỉ aggregate counter: crash có thể làm slot kẹt và thiếu token để vô hiệu hóa worker cũ.
- Giữ DB transaction lúc gọi Gemini: giữ connection/row lock quá lâu.
- Optimistic locking: đúng nhưng tạo nhiều conflict/retry khi 10 request cùng SELLER.

## 7. Retry, timeout and error mapping

**Decision**: Connect timeout khoảng 2 giây, tổng request timeout mặc định 15 giây, tối đa 2 attempts, exponential backoff + jitter và tôn trọng `Retry-After`. Retry network error, 408, 429 rate-limit và 5xx; không retry lỗi auth/config/input/content/quota provider hoặc output validation.

**Rationale**: Retry giới hạn giữ trải nghiệm trong 45 giây và vẫn chịu được lỗi tạm thời. Tất cả attempts của provider nằm trong cùng một reservation, nên tối đa trừ một lượt HomiGO.

**Error mapping**:

| Condition | HTTP | HomiGO code |
|---|---:|---|
| Input HomiGO không hợp lệ | 400 | `VALIDATION_ERROR` |
| Nội dung bị safety policy chặn | 422 | `AI_CONTENT_REJECTED` |
| Hết 5 lượt thành công | 429 | `AI_DAILY_LIMIT_REACHED` |
| Tất cả slot tạm được giữ | 429 | `AI_QUOTA_TEMPORARILY_RESERVED` |
| Provider rate limit/quota/service lỗi sau retry | 503 | `AI_SERVICE_UNAVAILABLE` |
| Timeout | 504 | `AI_GENERATION_TIMEOUT` |
| Key/model/config không hợp lệ | 503 | `AI_CONFIGURATION_ERROR` |
| Response/output không hợp lệ | 502 | `AI_INVALID_RESPONSE` |

Không trả raw provider error, request body, key hoặc internal reservation token. Log chỉ gồm correlation ID, status/code, model, attempt count và latency.

**Sources**: [Gemini troubleshooting](https://ai.google.dev/gemini-api/docs/troubleshooting), [Interactions API errors](https://ai.google.dev/gemini-api/docs/api-errors), [Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
