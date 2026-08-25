# Research: SePay Seller Upgrade

## Decision 1: SePay Sandbox checkout, not an in-app simulator

- **Decision**: Submit a signed HTML form to SePay Sandbox.
- **Rationale**: This exercises the real integration flow while keeping money isolated from production.
- **Source**: https://developer.sepay.vn/vi/cong-thanh-toan/sandbox

## Decision 2: Implement the official signing algorithm in Java

- **Decision**: Build a deterministic ordered map and sign `key=value` pairs joined by commas using HMAC-SHA256, Base64 output.
- **Rationale**: SePay publishes Node/PHP SDKs, not a Java SDK. The implementation mirrors the official Node SDK source and is covered by a regression fixture.
- **Source**: https://github.com/sepayvn/sepay-pg-node/blob/main/src/checkout.ts

## Decision 3: IPN is authoritative

- **Decision**: Only server-to-server IPN can mark SUCCESS and promote the user. Browser callbacks only select UI state and polling.
- **Rationale**: Query strings are user-controlled. SePay documents IPN as the secure order confirmation channel.
- **Source**: https://developer.sepay.vn/en/cong-thanh-toan/IPN

## Decision 4: IPN secret header plus business validation

- **Decision**: Constant-time validate `X-Secret-Key`, then match notification/order/transaction states, invoice, amount and currency.
- **Rationale**: Header authentication proves merchant configuration; business matching prevents accepting a valid notification for the wrong order.

## Decision 5: Local development uses a tunnel

- **Decision**: Keep frontend callback at localhost if desired, but register a public HTTPS tunnel URL ending in `/api/v1/payments/sepay/ipn` on SePay.
- **Rationale**: SePay explicitly cannot call localhost or private IPs.
