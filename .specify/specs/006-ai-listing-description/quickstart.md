# Quickstart: AI Listing Description

This guide is for implementing and verifying the feature after tasks are generated. Do not place a real Gemini key in repository files, shell history, screenshots or test fixtures.

## 1. Prerequisites

- Java 17 and Maven wrapper support used by `backend`.
- Node/npm versions compatible with the existing `frontend` project.
- MySQL 8 or the existing local Docker stack.
- A Gemini **Auth API key** created in Google AI Studio.

## 2. Configure local environment

Set server-only environment variables in the backend run profile or secret store:

```text
GEMINI_ENABLED=true
GEMINI_API_KEY=<your Auth API key>
GEMINI_MODEL=gemini-3.7-flash
GEMINI_API_VERSION=v1
GEMINI_CONNECT_TIMEOUT_MS=2000
GEMINI_TIMEOUT_MS=15000
GEMINI_MAX_ATTEMPTS=2
GEMINI_MAX_OUTPUT_TOKENS=1024
GEMINI_THINKING_LEVEL=minimal
GEMINI_RESERVATION_LEASE_SECONDS=90
```

Repository defaults must keep `GEMINI_ENABLED=false` and API key empty. Frontend variables must not contain the key.

## 3. Cấu trúc đã triển khai

1. Flyway V9 và quota reservation/finalization nằm trong backend.
2. Gemini Interactions API chỉ được gọi từ backend qua `x-goog-api-key`; request dùng `store=false`.
3. Hai endpoint seller là `GET /api/v1/seller/ai-description/quota` và `POST /api/v1/seller/ai-description/drafts`.
4. Form tạo và chỉnh sửa dùng chung assistant xem trước/áp dụng/hủy.
5. Unit, HTTP contract, quota concurrency và Playwright coverage nằm cạnh source tương ứng.

Use a fake `AiDescriptionClient` for normal automated tests. A live Gemini smoke test must be opt-in and excluded when no key is configured.

## 4. Backend verification

From `backend`:

```powershell
./mvnw test
```

Minimum assertions:

- Flyway migrates a fresh MySQL 8 database and Hibernate validation passes.
- USER, ADMIN and inactive seller cannot generate.
- Missing/invalid fields do not reserve quota or call Gemini.
- Provider timeout, block, invalid JSON and invalid length release the reservation.
- A valid 600–900 character, 2–3 paragraph result increments success exactly once.
- Fixed clock tests cover 23:59:59/00:00 in `Asia/Ho_Chi_Minh`; a request keeps the reservation date it started with.
- Provider call runs without an active DB transaction.

## 5. Required concurrency test

Run against MySQL Testcontainers, not H2:

1. Use a barrier to start 10 requests for the same SELLER at once.
2. Fake Gemini returns valid output for every admitted request.
3. Assert exactly 5 successes and 5 quota rejections.
4. Assert `successful_count=5`, `reserved_count=0` and Gemini was called only 5 times.
5. Repeat with mixed provider failures; only valid successes count and released slots become reusable.
6. Simulate crash by reserving without finalize/release, advance clock past lease, run cleanup, then assert the old token cannot finalize and the slot is reusable.

## 6. Frontend verification

From `frontend`:

```powershell
npm test
npm run build
npm run lint
npm run e2e
```

Verify on both `/seller/listings/new` and `/seller/listings/:id/edit`:

- Draft appears in a separate preview; original description is untouched.
- Apply copies to textarea; Cancel preserves it; Regenerate creates another request.
- Remaining quota and reset time update from server responses.
- Loading prevents duplicate clicks and announces status accessibly.
- Timeout/unavailable/exhausted states preserve every form field and manual save remains usable.

## 7. Optional live smoke test

With a non-production seller account and Auth key configured:

1. Submit only non-sensitive sample listing data.
2. Confirm network traffic from the browser contains only the HomiGO endpoint, never Gemini or `x-goog-api-key`.
3. Confirm output is Vietnamese, 600–900 characters, 2–3 paragraphs and facts match input.
4. Trigger five successful generations and confirm the sixth is rejected before provider invocation.
5. Remove/disable the key and confirm manual description/save still works.

## 8. Pre-delivery security checks

- Search tracked and generated frontend files for `GEMINI_API_KEY`, `x-goog-api-key` and known key patterns; only configuration names/documentation placeholders may appear.
- Inspect logs and error responses from success, auth failure, 429, 5xx and timeout paths; no key, prompt, keywords, raw draft or provider body may appear.
- Confirm CORS and Spring Security have not exposed the seller endpoints publicly.
- Confirm no prompt or generated content is stored in the new database tables.
