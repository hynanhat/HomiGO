# REST API Contract: SePay Seller Upgrade

All application responses use `{ success, data, message, errorCode }`. Secret values are never returned.

## Offer

`GET /api/v1/payments/sepay/seller-upgrade/offer` — authenticated.

```json
{"amount":99000,"currency":"VND","provider":"SEPAY","environment":"sandbox","configured":true}
```

## Create/reuse checkout

`POST /api/v1/payments/sepay/seller-upgrade` — role USER.

```json
{
  "payment":{"orderCode":"HMG-SEPAY-A1B2C3D4","amount":99000,"currency":"VND","status":"PENDING"},
  "checkoutUrl":"https://pay-sandbox.sepay.vn/v1/checkout/init",
  "method":"POST",
  "fields":{"operation":"PURCHASE","payment_method":"BANK_TRANSFER","order_invoice_number":"HMG-SEPAY-A1B2C3D4","order_amount":"99000","currency":"VND","signature":"...","merchant":"..."}
}
```

## Status and history

- `GET /api/v1/payments/sepay/seller-upgrade/{orderCode}` — owner only.
- `GET /api/v1/payments/sepay/seller-upgrade?page=0&size=10` — authenticated owner's paged history.

## IPN

`POST /api/v1/payments/sepay/ipn` — public network route, authenticated by `X-Secret-Key`.

Required success event:

- `notification_type = ORDER_PAID`
- `order.order_status = CAPTURED`
- `transaction.transaction_status = APPROVED`
- `order_invoice_number`, both amount fields and currency match the local order.

Response 200 acknowledges a processed/duplicate supported event. Wrong secret returns 401. Malformed or mismatched business data returns 400 and never changes role.
