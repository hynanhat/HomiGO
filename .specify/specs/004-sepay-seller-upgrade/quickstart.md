# Quickstart Validation: SePay Sandbox Seller Upgrade

## Environment

Set these in the backend process; do not commit their values:

```text
SEPAY_MERCHANT_ID=<new sandbox merchant id>
SEPAY_SECRET_KEY=<new rotated sandbox secret>
SEPAY_ENVIRONMENT=sandbox
SEPAY_FRONTEND_BASE_URL=http://localhost:5173
SELLER_UPGRADE_PRICE=99000
```

The secret exposed in chat must be revoked and regenerated first.

## IPN for local development

1. Run backend on port 8080.
2. Expose it through an HTTPS tunnel, for example `https://<random>.trycloudflare.com` → `http://localhost:8080`.
3. In SePay merchant management, configure authentication `SECRET_KEY` and IPN URL:
   `https://<random>.trycloudflare.com/api/v1/payments/sepay/ipn`.
4. Keep the browser callback base at `http://localhost:5173`; browser redirects can reach local frontend.

## Demo

1. Sign in as USER and open `/seller/upgrade`.
2. Confirm 99,000 VND and click “Thanh toán qua SePay”.
3. Complete a successful transaction in SePay Sandbox.
4. On return, observe “Đang xác nhận”; after IPN, the page reports SUCCESS and session becomes SELLER.
5. Repeat with cancel/error and confirm no role upgrade.

## Automated verification

```powershell
cd backend
.\mvnw.cmd test

cd ..\frontend
npm test
npm run lint
npm run build
```
