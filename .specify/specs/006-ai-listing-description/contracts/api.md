# REST API Contract: AI Listing Description

All routes require an authenticated, active account with role `SELLER`. Responses use the existing `ApiResponse<T>` envelope. Dates are ISO-8601 instants; display formatting is a frontend concern.

## GET `/api/v1/seller/ai-description/quota`

Returns feature availability and the current seller's Vietnam business-day quota. Reading quota lazily expires stale reservations.

### 200 response

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "limit": 5,
    "successfulAttempts": 2,
    "remainingAttempts": 3,
    "availableNow": 3,
    "resetAt": "2026-08-25T00:00:00+07:00"
  },
  "message": "Thành công.",
  "errorCode": null
}
```

When configuration disables AI, return `enabled=false` while preserving quota values. Manual description entry remains available.

## POST `/api/v1/seller/ai-description/drafts`

Creates one preview draft. A valid completed draft consumes one daily success; invalid input and all unsuccessful provider/system outcomes consume none.

### Request

```json
{
  "keywords": "ban công thoáng, phù hợp gia đình trẻ, nội thất cơ bản",
  "categoryId": 2,
  "districtId": 7,
  "wardId": 72,
  "projectId": 15,
  "title": "Căn hộ 2 phòng ngủ tại Homi Residence",
  "price": 3200000000,
  "area": 72.5,
  "address": "Đường Nguyễn Văn Linh",
  "bedrooms": 2,
  "bathrooms": 2,
  "floors": 12,
  "direction": "Đông Nam",
  "furnishing": "Nội thất cơ bản",
  "legalStatus": "Sổ hồng"
}
```

Rules:

- Required: `keywords`, `categoryId`, `districtId`, `price`, `area`.
- `keywords` after trim: 3–500 Unicode characters.
- Backend resolves category/location/project names and rejects nonexistent or inconsistent references.
- Unknown JSON fields are rejected. Contact data, coordinates, current description and auth identity are not accepted.
- A retry caused by transient Gemini failure remains part of this one operation and cannot consume more than one HomiGO quota.

### 200 response

```json
{
  "success": true,
  "data": {
    "description": "Căn hộ có diện tích 72,5 m² ...\n\nKhông gian phù hợp ...",
    "quota": {
      "enabled": true,
      "limit": 5,
      "successfulAttempts": 3,
      "remainingAttempts": 2,
      "availableNow": 2,
      "resetAt": "2026-08-25T00:00:00+07:00"
    }
  },
  "message": "Thành công.",
  "errorCode": null
}
```

The response never includes Gemini interaction IDs, model raw output, prompt, API key or reservation token.

## Error responses

Error envelope:

```json
{
  "success": false,
  "data": null,
  "message": "Bạn đã dùng hết 5 lượt tạo mô tả hôm nay. Có thể sử dụng lại sau 00:00 ngày 25/08/2026.",
  "errorCode": "AI_DAILY_LIMIT_REACHED"
}
```

| HTTP | `errorCode` | Client behavior | Quota |
|---:|---|---|---|
| 400 | `VALIDATION_ERROR` | Show field/global validation; do not call provider | Unchanged |
| 401 | `UNAUTHORIZED` | Existing session handling | Unchanged |
| 403 | `ACCESS_DENIED` | Existing seller access handling | Unchanged |
| 422 | `AI_CONTENT_REJECTED` | Ask seller to revise keywords | Unchanged |
| 429 | `AI_DAILY_LIMIT_REACHED` | Disable generate until `resetAt` | Already exhausted; unchanged |
| 429 | `AI_QUOTA_TEMPORARILY_RESERVED` | Keep manual flow; allow retry after `retryAt` | Unchanged |
| 502 | `AI_INVALID_RESPONSE` | Safe retry message | Unchanged |
| 503 | `AI_FEATURE_UNAVAILABLE` | Hide/disable assistant; manual form works | Unchanged |
| 503 | `AI_CONFIGURATION_ERROR` | Generic unavailable message; alert operations | Unchanged |
| 503 | `AI_SERVICE_UNAVAILABLE` | Generic temporary failure | Unchanged |
| 504 | `AI_GENERATION_TIMEOUT` | Timeout message; seller may retry | Unchanged |

Error messages exposed to the browser are Vietnamese and curated by HomiGO. Provider bodies, internal exceptions and secrets are never forwarded.

## Security and observability contract

- Security config continues enforcing `hasRole("SELLER")` for `/api/v1/seller/**`; service also checks active account state.
- `x-goog-api-key` is added only by backend `RestClient` and is redacted from HTTP logging.
- No keywords, prompt, generated draft, contact data or raw provider response in application logs.
- Safe telemetry: correlation ID, seller internal ID, model, latency, attempt count, terminal outcome and HomiGO error code.
- Provider calls are prohibited when input validation, role/state, feature flag or quota admission fails.
