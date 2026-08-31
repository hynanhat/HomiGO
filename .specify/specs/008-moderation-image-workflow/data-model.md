# Data Model

## Listing

Existing listing records gain a new lifecycle state and current-removal metadata.

| Field | Type | Rule |
|---|---|---|
| `status` | enum | Add `REMOVED` |
| `removal_reason` | varchar(500), nullable | Present while current state is `REMOVED` |
| `removed_by` | bigint, nullable FK `users.id` | Administrator who applied the current removal |
| `removed_at` | datetime(6), nullable | Time of current removal |
| `version` | existing bigint | Compared with `expectedVersion` on moderation mutations |

`rejection_reason` remains specific to pre-publication rejection and is not reused.

### Listing transitions

```text
DRAFT --------submit--------> PENDING
REJECTED -----edit----------> DRAFT
REJECTED -----submit--------> PENDING
INACTIVE -----edit----------> DRAFT
INACTIVE -----submit--------> PENDING
REMOVED ------edit----------> DRAFT
REMOVED ------submit--------> PENDING
PENDING ------approve-------> ACTIVE
PENDING ------reject--------> REJECTED
ACTIVE -------seller off----> INACTIVE
ACTIVE -------admin remove--> REMOVED
```

- `ACTIVE -> REMOVED` requires an administrator and a valid reason.
- Editing/submitting a removed listing clears the current removal metadata and stale approval/publication/expiry metadata.
- History rows remain after remediation.
- Owner hard-delete remains available for `REMOVED` and follows the existing cascade/file cleanup lifecycle.

## Listing history

The existing moderation history table adds `REMOVED` to both `from_status` and `to_status` enums. Each removal row stores listing, actor (`changed_by`), previous status `ACTIVE`, new status `REMOVED`, reason, and timestamp.

The detail API returns rows oldest-to-newest so the UI can render a timeline deterministically.

## Listing image

| Field | Type | Rule |
|---|---|---|
| `client_upload_id` | varchar(36), nullable | Client-generated UUID for retry identity |
| `sort_order` | existing integer | Allocated as maximum existing order plus one |

Add a unique index on `(listing_id, client_upload_id)`. MySQL permits multiple nullable values, so pre-feature rows remain valid. If the same owner retries the same `uploadId` for the same listing, the service returns the existing image and does not write the file again.

## Notification

Add notification type `LISTING_REMOVED`. The seller notification links to the owned listing and communicates that an administrator removed it and supplied a reason. Sensitive or arbitrary exception detail is never embedded.

## Read models

### Administrator listing detail

- `listing`: existing complete `ListingRes`, including ordered images and version
- `seller`: id, name, email, phone, status, and creation context already safe for administrators
- `history`: ordered moderation transition records with actor display data

### Local image draft

Frontend-only fields:

| Field | Purpose |
|---|---|
| `localId` | Stable React identity |
| `uploadId` | Stable UUID reused for retries |
| `file` / preview URL | Pending local source |
| `status` | `pending`, `uploading`, `uploaded`, or `failed` |
| `progress` | Per-file upload percentage |
| `error` | Safe Vietnamese failure description |
| `serverImage` | Present after success |

Object URLs are revoked when items are removed, succeed, or the component unmounts.
