# Quickstart and Verification

## Backend

```powershell
Set-Location backend
./mvnw test
```

For the MySQL/Flyway integration suite, Docker must be available so Testcontainers can start MySQL 8.4.

## Frontend

```powershell
Set-Location frontend
npm test -- --run
npm run build
npm run lint
```

Run focused browser journeys when the local stack is available:

```powershell
npm run e2e
```

## Manual acceptance

1. Create a pending listing with three images as a seller.
2. Open `/admin/listings`, verify the row offers only **Xem chi tiết**, and open it.
3. Confirm every listing field, seller/contact value, image, and history row is visible.
4. Approve from the detail view and verify the listing is publicly accessible.
5. Remove it as admin with a valid reason; verify it disappears from search, public detail, recommendations, and saved-list discovery.
6. Open it as the seller, verify the reason, edit/manage images, and resubmit.
7. Select several images at once, double-click the upload button during the batch, simulate one failed response, and verify only the failed item retries and no duplicate image rows appear.
8. Open two admin sessions on the same version, act in the first, and confirm the second receives a stale-data message and refreshed detail.

## VPS proxy verification

Repository container Nginx already needs `client_max_body_size 6m`; the host proxy must match it:

```bash
sudo nginx -T | grep -n client_max_body_size
```

If the host virtual host has no suitable value, add `client_max_body_size 6m;` inside the `server` block, then validate and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

After pulling the feature, rebuild the application containers so schema and compiled assets update:

```bash
sudo docker compose up -d --build
sudo docker compose ps
sudo docker compose logs --tail=100 backend frontend
```
