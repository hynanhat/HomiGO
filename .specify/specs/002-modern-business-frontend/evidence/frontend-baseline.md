# Frontend Baseline Evidence

**Task**: T001  
**Recorded**: 2026-08-15  
**Environment**: Windows, Node.js 22.20.0, npm 10.9.3

## Command Results

### `npm ci`

**Status**: PASS

- Installed 94 packages from `frontend/package-lock.json`.
- Audited 95 installed packages in the normal install summary.
- `npm audit --json` reports one transitive high-severity advisory in `nanoid < 3.3.18` (`GHSA-2v37-7h3g-55p8`); a fix is available.
- No automatic audit fix was applied because dependency changes belong to T002 and must be reviewed with the planned toolchain update.

### `npm run lint`

**Status**: PASS WITH 1 WARNING

```text
src/context/AuthContext.tsx:53:14 react(only-export-components)
Fast refresh only works when a file only exports components.
```

The warning should be resolved when auth types/hooks are separated during the foundational auth work.

### `npm run build`

**Status**: PASS

```text
vite v8.2.0
1855 modules transformed
dist/index.html                  0.47 kB (gzip 0.30 kB)
dist/assets/index-*.css          6.63 kB (gzip 1.64 kB)
dist/assets/index-*.js         301.99 kB (gzip 97.68 kB)
build time                      6.33 s
```

Vite emitted a plugin timing advisory: `vite:css` used 49% and `vite:build-html` used 48% of measured plugin time. This is informational at baseline and will be checked again after replacing starter CSS.

## Stale Route Inventory

| Location | Current behavior | Required target |
|---|---|---|
| `frontend/src/App.tsx:16` | Public listing route uses `/listings/:id` | Use `/listings/:publicCode` |
| `frontend/src/App.tsx` | Only `/auth`, `/dashboard`, `/post`, and `/admin` prototype routes exist | Adopt the route contract in `contracts/ui-routes.md` |
| `frontend/src/App.tsx` | Project pages are not registered | Add `/projects` and `/projects/:slug` |
| `frontend/src/App.tsx` | No not-found route or public/account/seller/admin shells | Add guarded layouts and `*` route |

## Stale Endpoint and Contract Inventory

| Location | Baseline issue | Contract target |
|---|---|---|
| `frontend/src/services/api.ts:4` | API base URL hardcoded to localhost | Read `VITE_API_BASE_URL` |
| `frontend/src/pages/AuthPage.tsx:23` | Reads `data.token` | Read `data.accessToken` and `data.refreshToken` |
| `frontend/src/pages/SellerDashboard.tsx:18` | Calls obsolete `/listings/saved` and treats page as an array | Use paginated `GET /seller/listings` |
| `frontend/src/pages/PostListingPage.tsx:40` | Calls obsolete `POST /listings` | Use `POST /seller/listings` to create DRAFT |
| `frontend/src/pages/PostListingPage.tsx:108` | References obsolete `/listings/upload` | Use multipart `/seller/listings/{id}/images` |
| `frontend/src/components/ListingCard.tsx:36` | Public link uses internal `listing.id` | Use `listing.publicCode` |
| `frontend/src/pages/PostListingPage.tsx:14-15` | Category and district IDs hardcoded to `1` | Load category/location options from APIs |
| `frontend/src/components/ListingCard.tsx:21` | Image host hardcoded to localhost | Resolve media URLs from environment/API policy |
| `frontend/src/pages/ListingDetailPage.tsx:49` | Image host hardcoded to localhost | Resolve media URLs from environment/API policy |

## Incomplete Prototype Areas

- `ProjectListPage.tsx` and `ProjectDetailPage.tsx` are placeholders.
- `AdminDashboard.tsx` contains static cards without moderation, user, or master-data operations.
- `SellerDashboard.tsx` does not render the backend listing lifecycle or valid actions.
- `PostListingPage.tsx` omits required address, contact, property, ward/project, version, and image workflow fields.
- Listing/public pages use untyped `any` data and do not provide consistent retry/error/empty states.
- No frontend test command or automated test suite exists yet; this is planned in T002–T004.

## Baseline Conclusion

The current frontend is buildable and lintable but remains a visual prototype rather than a contract-complete application. T002 can proceed without fixing baseline issues in T001.
