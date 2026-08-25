# Quickstart Validation: HomiGO Modern Business Frontend

## Prerequisites

- Node.js version compatible with Vite 8
- Backend HomiGO available locally at `http://localhost:8080`
- MySQL only when running backend dev profile; Docker is not required for frontend work

## Local setup

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Set `VITE_API_BASE_URL=http://localhost:8080/api/v1` in `.env.local`. Do not place secrets in a `VITE_` variable because browser bundles are public.

## Fast verification

```powershell
npm run lint
npm run test
npm run build
```

Expected: no TypeScript/lint errors, all unit/integration tests pass, and a production bundle is created.

## Browser verification

```powershell
npm run e2e
```

The E2E suite may use MSW/fixtures for deterministic UI checks and a separate real-backend profile for graduation evidence.

## Required scenarios

### Scenario A — Public discovery

1. Open home at 360 px and 1440 px.
2. Search for BUY or RENT, update location/price/area filters and sorting.
3. Verify URL and displayed result state match.
4. Open listing detail using `publicCode`; verify gallery, facts and contact information.
5. Repeat for empty, 404 and network-error fixtures.

### Scenario B — Account and favorites

1. Register and login using the backend contract fields.
2. Reload and verify session restoration.
3. Save and remove a listing from card/detail/saved page.
4. Update profile, change password and logout.
5. Verify revoked refresh token returns to login without a request loop.

### Scenario C — Seller publication

1. Upgrade USER to SELLER.
2. Create a DRAFT using API-provided category and location options.
3. Upload two valid images and reject invalid/oversized/11th images.
4. Submit to PENDING and verify dashboard status.
5. Edit a REJECTED listing with reason visible, then resubmit.

### Scenario D — Admin moderation

1. Login as ADMIN and open the PENDING queue.
2. Approve one listing and reject another with a required reason.
3. Ban/unban a user using confirmation dialogs.
4. Complete create/update/delete validation on one master-data type.

### Scenario E — Responsive and accessibility

1. Validate primary routes at 360 px, 768 px and 1440 px.
2. Navigate menus, forms, filter drawer, gallery and dialogs using only keyboard.
3. Run automated accessibility checks and verify no serious/critical issue.
4. Confirm focus returns to the triggering control after closing a dialog/drawer.

## Completion evidence

- Output of lint, test, build and E2E commands.
- API route coverage against [frontend-api-map.md](./contracts/frontend-api-map.md).
- Screenshots of public, seller and admin layouts at mobile and desktop sizes.
- Accessibility report and list of resolved issues.
- Recorded guest → seller → admin publication demo against the real backend.
