# UI Route Contract

## Public shell

| Route | Page | Access | Primary data |
|---|---|---|---|
| `/` | Home | Public | Recent listings, projects, locations |
| `/listings` | Listing search | Public | URL filters + paginated listings |
| `/listings/:publicCode` | Listing detail | Public | Public listing code |
| `/projects` | Project search | Public | URL filters + paginated projects |
| `/projects/:slug` | Project detail | Public | Project + active listings |
| `/auth/login` | Login | Anonymous preferred | Intended destination |
| `/auth/register` | Register | Anonymous preferred | Registration form |
| `*` | Not found | Public | No remote data required |

## Account shell

| Route | Page | Access |
|---|---|---|
| `/account/profile` | Profile | Authenticated |
| `/account/security` | Password/session | Authenticated |
| `/saved-listings` | Saved listings | Authenticated |

## Seller shell

| Route | Page | Access |
|---|---|---|
| `/seller` | Seller overview | SELLER |
| `/seller/listings` | My listings | SELLER |
| `/seller/listings/new` | Create draft | SELLER |
| `/seller/listings/:id` | Owned listing detail | Owner SELLER |
| `/seller/listings/:id/edit` | Edit listing | Owner SELLER |

USER visiting a seller route receives an upgrade-to-seller screen. ADMIN uses admin routes and does not silently mutate seller-owned content through seller UI.

## Admin shell

| Route | Page | Access |
|---|---|---|
| `/admin` | Operations overview | ADMIN |
| `/admin/listings` | Moderation queue | ADMIN |
| `/admin/users` | User management | ADMIN |
| `/admin/categories` | Category management | ADMIN |
| `/admin/projects` | Project management | ADMIN |
| `/admin/locations` | Province/district/ward management | ADMIN |

## Navigation rules

- Public navigation: Mua, Thuê, Dự án, Đăng tin, account menu.
- Mobile navigation uses a keyboard-accessible drawer and always exposes search and account actions.
- Unauthorized navigation saves the intended URL and returns there after login when role permits.
- Route guards show a restoring state while session rehydration runs; they do not flash protected content.
- Every detail route has an explicit not-found/unavailable presentation.
