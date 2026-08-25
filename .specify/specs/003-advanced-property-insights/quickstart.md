# Quickstart Validation: Advanced Property Insights

## Prerequisites

- MySQL is running with the existing HomiGO database credentials supplied through environment variables.
- Java 17, Maven 3.9+, Node.js and the frontend packages are available.
- Existing seed/demo accounts include one seller and one active administrator.
- Configure `JWT_SECRET` and optionally `ANALYTICS_VIEWER_HASH_SECRET`; configure `APP_BUSINESS_ZONE` only when a zone other than `Asia/Ho_Chi_Minh` is required.

## Automated validation

From `backend/`:

```powershell
mvn test
```

Expected: all legacy tests and new notification, view analytics, recommendation and controller tests pass.

From `frontend/`:

```powershell
npm test
npm run lint
npm run build
npm run e2e
```

Expected: unit/component tests, static checks, production build and deterministic browser scenarios pass.

## Database migration validation

Start the backend against an existing schema at Flyway version V5.

Expected:

- V6 applies successfully.
- `notifications` and `listing_views` exist with their foreign keys, uniqueness constraints and indexes.
- Spring validation starts without schema mismatch.
- Re-running the application does not reapply or alter V6.

## Scenario 1: Notification workflow

1. Sign in as a seller, submit a draft listing.
2. Sign in as an administrator and observe the unread badge/list entry.
3. Approve or reject the listing.
4. Return to the seller account and wait no longer than 60 seconds.
5. Open the notification, follow its listing link when present, then mark all as read.

Expected: each role receives exactly the relevant message; unread count decreases; another account cannot access the notification ID.

## Scenario 2: Unique view statistics

1. Open an active public listing in one browser profile and reload it several times.
2. Open it in a different browser profile once.
3. Sign in as the listing owner and open seller listing detail/statistics.
4. Change the period between 7, 30 and 90 days.

Expected: the current date increases by two unique viewers, not by reload count; totals and daily series agree; zero-view dates remain visible. A different seller receives an access error.

## Scenario 3: Property recommendations

1. Prepare active listings with the same category/district/project at close and distant prices, plus inactive/expired controls.
2. Open the target public listing.
3. Inspect the recommendation cards and their reason labels.

Expected: the closest active listing ranks first; target, inactive and expired controls are absent; at most six cards appear by default; no-candidate state leaves the main listing page usable.

## Local demo route map

- Public listing and recommendations: `/listings/{publicCode}`
- Private notification inbox: `/notifications`
- Seller analytics: `/seller/listings/{listingId}`
- Admin moderation workflow: `/admin/listings`

The frontend polls notifications every 30 seconds by default. Set `VITE_NOTIFICATION_POLL_INTERVAL_MS` only before building the frontend when a different local demo interval is required.

## Responsive and accessibility check

Validate notification controls, statistics and recommendations at 360 px, 768 px and 1440 px. Keyboard focus must reach the notification bell, read actions, range selector and recommendation links; chart values must remain available as text, not only through bar height or color.
