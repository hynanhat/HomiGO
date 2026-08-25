# Data Model: Advanced Property Insights

## Notification

Represents one durable in-app message for one recipient.

| Field | Type | Rules |
|-------|------|-------|
| `id` | Long | Primary key, generated |
| `user_id` | Long | Required FK to `users`; recipient owns the row; cascade on user deletion |
| `type` | Enum | `LISTING_SUBMITTED`, `LISTING_APPROVED`, `LISTING_REJECTED`, `LISTING_EXPIRED` |
| `title` | String(160) | Required Vietnamese display title |
| `message` | String(500) | Required Vietnamese display message |
| `listing_id` | Long | Optional FK to `listings`; set null when listing is deleted |
| `read_at` | DateTime | Null while unread; first read timestamp is retained |
| `created_at` | DateTime | Required immutable creation time |

Indexes:

- `(user_id, created_at DESC)` for inbox pagination.
- `(user_id, read_at, created_at DESC)` for unread list/count.

State transition:

```text
UNREAD (read_at = null) → READ (read_at set once)
```

Reading an already-read notification is idempotent. A recipient cannot transition another recipient's row.

## ListingView

Represents one unique viewer/listing/business-day observation.

| Field | Type | Rules |
|-------|------|-------|
| `id` | Long | Primary key, generated |
| `listing_id` | Long | Required FK to `listings`; cascade on listing deletion |
| `viewer_hash` | String(64) | Required lowercase HMAC-SHA-256 hex; no raw identity stored |
| `viewed_on` | Date | Required date in configured business time zone |
| `created_at` | DateTime | Required time when the unique view was first observed |

Constraints and indexes:

- Unique `(listing_id, viewer_hash, viewed_on)` makes retries/reloads idempotent.
- `(listing_id, viewed_on)` supports range counts and daily grouping.

Validation:

- Anonymous input must be a canonical UUID.
- Authenticated identity takes precedence over the anonymous UUID.
- Listing must be `ACTIVE` and not expired at recording time.

## ListingStatistics (read model)

Computed for an authorized owner or administrator; not persisted separately.

| Field | Type | Meaning |
|-------|------|---------|
| `listingId` | Long | Requested listing |
| `publicCode` | String | Stable public reference |
| `totalViews` | Long | All retained unique daily views |
| `todayViews` | Long | Unique views on current business date |
| `last7DaysViews` | Long | Inclusive current-day seven-day total |
| `periodDays` | Integer | Requested range, 7–90 |
| `dailyViews` | List | One `{date, views}` item for every date in the requested range |

Authorization rule: requester must own the listing or have role `ADMIN`.

## PropertyRecommendation (read model)

Computed from the target listing and eligible candidates; not persisted.

| Field | Type | Meaning |
|-------|------|---------|
| `listing` | Listing summary | Existing public-safe listing representation |
| `score` | Integer | Normalized deterministic similarity score from 0 to 100 |
| `reasons` | List of strings | Up to three Vietnamese explanations such as same district/category/project |

Eligibility:

- Candidate is not the target listing.
- Candidate is `ACTIVE` and not expired.
- Candidate shares at least one category, transaction type, project, district or province signal.

Ranking signals:

| Signal | Maximum contribution |
|--------|----------------------|
| Same category | 30 |
| Same transaction type | 15 |
| Same district / same province | 20 / 8 |
| Same project | 15 |
| Price proximity | 12 |
| Area proximity | 8 |

Exact score weights sum to 100. Publication time descending and ID descending break equal scores.

## Relationships

```text
User 1 ── * Notification
User 1 ── * Listing
Listing 1 ── * ListingView
Listing 1 ── * Notification (optional reference)
Listing 1 ── * PropertyRecommendation (computed, not stored)
```
