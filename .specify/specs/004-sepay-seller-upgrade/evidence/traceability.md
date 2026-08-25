# Requirements Traceability: SePay Seller Upgrade

| Requirement | Implementation / evidence | Result |
|---|---|---|
| FR-001 | `SellerUpgradePaymentService#getOffer`; server config | Pass |
| FR-002 | USER security matcher + active-user/role validation | Pass |
| FR-003 | V7 unique `order_code`; payment saved before field generation | Pass |
| FR-004 | `SePaySignatureService`; static SDK-compatible fixture; secret grep | Pass |
| FR-005 | BANK_TRANSFER + configured Sandbox checkout URL | Pass |
| FR-006 | public IPN route + constant-time `X-Secret-Key` comparison | Pass |
| FR-007 | IPN invoice/status/amount/currency tests | Pass |
| FR-008 | transactional payment service updates payment + managed user | Pass |
| FR-009 | pessimistic invoice lock, unique transaction, duplicate-IPN test | Pass |
| FR-010 | callback PENDING frontend test | Pass |
| FR-011 | owner-scoped repository/controller test | Pass |
| FR-012 | `expireIfNeeded` and create/retry flow | Pass |
| FR-013 | frontend refresh JWT then reload profile after SUCCESS | Pass |
| FR-014 | sandbox defaults, production overrides, env example, no committed secret | Pass |
| FR-015 | root README and feature quickstart tunnel/IPN instructions | Pass |

All tasks T001–T018 and acceptance-critical scenarios are complete. A live SePay transaction remains an operator step because the credential supplied in chat must not be used and must be rotated first.
