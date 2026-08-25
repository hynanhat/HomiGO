# Data Model: SePay Seller Upgrade

## `seller_upgrade_payments`

| Column | Type | Rules |
|---|---|---|
| `id` | BIGINT | PK, auto increment |
| `order_code` | VARCHAR(40) | unique, immutable SePay invoice number |
| `user_id` | BIGINT | FK `users.id`, owner |
| `purpose` | ENUM | `SELLER_UPGRADE` |
| `amount` | BIGINT | positive, server-owned VND amount |
| `currency` | VARCHAR(3) | `VND` |
| `status` | ENUM | `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `EXPIRED` |
| `provider_order_id` | VARCHAR(64) | nullable, SePay order UUID |
| `provider_transaction_id` | VARCHAR(64) | nullable, unique SePay transaction |
| `failure_reason` | VARCHAR(255) | nullable internal-safe reason |
| `expires_at` | DATETIME(6) | local pending expiry |
| `completed_at` | DATETIME(6) | nullable successful completion |
| `created_at`, `updated_at` | DATETIME(6) | audit timestamps |
| `version` | BIGINT | optimistic version |

## State transitions

```text
PENDING ──local timeout──> EXPIRED
PENDING/EXPIRED ──valid ORDER_PAID IPN──> SUCCESS
SUCCESS ──duplicate IPN──> SUCCESS
```

Browser success/error/cancel does not cause a database transition. `FAILED` and `CANCELLED` remain reserved for future authoritative provider events.

## Invariants

- One `order_code` identifies one payment and owner.
- A `provider_transaction_id` cannot be reused across payments.
- SUCCESS requires a matching provider order/transaction and user role SELLER.
- Reads by users always include `user_id` ownership.
