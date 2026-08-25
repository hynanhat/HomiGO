# Data Model: AI Listing Description

## Entity relationship

```text
users (1) ──── (*) ai_daily_usage (1) ──── (*) ai_description_reservations
```

Category, district, ward and project remain existing read-only reference data used to resolve trusted display names. The listing itself is not created or updated by the generation endpoint.

## 1. `ai_daily_usage`

Aggregate admission row for one SELLER and one Vietnam business date.

| Field | Type | Rules |
|---|---|---|
| `id` | BIGINT | Primary key, auto increment |
| `user_id` | BIGINT | Required, FK `users(id)` ON DELETE CASCADE |
| `business_date` | DATE | Required, date at reservation time in `Asia/Ho_Chi_Minh` |
| `successful_count` | TINYINT UNSIGNED | Required, default 0, range 0–5 |
| `reserved_count` | TINYINT UNSIGNED | Required, default 0, range 0–5 |
| `created_at` | DATETIME(6) | Required |
| `updated_at` | DATETIME(6) | Required |
| `version` | BIGINT | Required, default 0; observable JPA version, correctness uses row lock |

Constraints and indexes:

- Unique `(user_id, business_date)`.
- Check `successful_count BETWEEN 0 AND 5`.
- Check `reserved_count BETWEEN 0 AND 5`.
- Check `successful_count + reserved_count <= 5`.
- Repository method reads `(user_id, business_date)` with `PESSIMISTIC_WRITE` for each transition.

Derived values:

- `remainingAttempts = 5 - successful_count`.
- `availableNow = max(0, 5 - successful_count - reserved_count)`.
- `resetAt = start of business_date + 1 day in Asia/Ho_Chi_Minh`.

## 2. `ai_description_reservations`

Durable lease representing one admitted generation operation.

| Field | Type | Rules |
|---|---|---|
| `id` | BIGINT | Primary key, auto increment |
| `usage_id` | BIGINT | Required, FK `ai_daily_usage(id)` ON DELETE CASCADE |
| `reservation_token` | CHAR(36) | Required, unique server-generated UUID; never returned to browser |
| `status` | ENUM | `RESERVED`, `SUCCEEDED`, `RELEASED`, `EXPIRED` |
| `reserved_at` | DATETIME(6) | Required |
| `lease_expires_at` | DATETIME(6) | Required; baseline 90 seconds after reservation |
| `completed_at` | DATETIME(6) | Null until terminal |
| `release_reason` | VARCHAR(64) | Optional safe code only; no provider response/content |

Indexes:

- `(usage_id, status, lease_expires_at)` for per-user cleanup.
- `(status, lease_expires_at)` for scheduled cleanup.

Privacy rule: neither table stores keywords, prompt, generated description, contact data, API key or raw Gemini errors.

### State transitions

```text
RESERVED ──valid output + finalize before lease──> SUCCEEDED
    ├──────provider/validation/system failure────> RELEASED
    └──────lease elapsed/crash cleanup───────────> EXPIRED
```

- `RESERVED -> SUCCEEDED`: decrement `reserved_count`, increment `successful_count` exactly once.
- `RESERVED -> RELEASED` or `EXPIRED`: decrement `reserved_count`; success count unchanged.
- Terminal states do not transition again.
- Finalize/release are idempotent for the same token.
- Lock order is always usage row first, reservation second to avoid deadlock.
- A late worker cannot finalize an expired/reclaimed reservation and must not return its draft.

## 3. AI description request (non-persistent)

| Field | Validation/use |
|---|---|
| `keywords` | Required, trim, 3–500 Unicode characters; treated as untrusted data |
| `categoryId` | Required, positive, resolve existing category name |
| `districtId` | Required, positive, resolve existing district/province names |
| `wardId` | Optional, must belong to district if present |
| `projectId` | Optional, resolve existing project and validate location compatibility |
| `title` | Optional, trim/limit using listing rules |
| `price` | Required, positive |
| `area` | Required, positive |
| `address` | Optional, trim/limit |
| `bedrooms`, `bathrooms`, `floors` | Optional non-negative values |
| `direction`, `furnishing`, `legalStatus` | Optional known enum/text values from current listing form |

Explicitly absent: `description`, `contactName`, `contactPhone`, `latitude`, `longitude`, listing owner/auth data and arbitrary extra properties.

## 4. AI description draft (non-persistent)

| Field | Meaning |
|---|---|
| `description` | Validated Vietnamese text, 600–900 characters, 2–3 paragraphs |
| `quota` | Updated quota snapshot after successful finalize |

The draft remains client-side preview state. It becomes part of `ListingFormValues.description` only after the SELLER selects “Dùng mô tả này”; normal listing create/update persists it later.

## 5. Quota transaction boundaries

1. Validate request and SELLER before quota.
2. In transaction A, insert daily usage row if absent, lock it, reclaim expired reservations, check capacity, create `RESERVED`, increment `reserved_count`, commit.
3. Call Gemini and validate output with no database transaction active.
4. In transaction B, lock usage then reservation and finalize `SUCCEEDED`; only after commit return draft.
5. On any failure, transaction C releases the reservation. If release itself fails, lease cleanup restores availability later.

The orchestrator is not `@Transactional`. Transactional quota methods live in a separate bean or use `TransactionTemplate` so Spring proxy boundaries cannot be bypassed by self-invocation.
