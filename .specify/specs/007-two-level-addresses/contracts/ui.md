# UI Contract: Two-Level Production Addresses

## Shared Address Language

- Province label: `Tỉnh / thành phố`
- Commune-level label: `Phường / xã / đặc khu`
- Structured display order: free-form address, commune-level unit, province/city
- District labels, controls, values, filters, columns, and compatibility notices do not appear.

## Shared Dependent Selector

`TwoLevelLocationFields` is the single controlled component used by seller listing forms, administrator project forms, and listing/project filters.

Inputs:

```text
provinceCode: string
communeCode: string
onProvinceChange(code: string): void
onCommuneChange(code: string): void
provinceError?: string
communeError?: string
disabled?: boolean
required?: boolean
```

Behavior:

1. Fetch all pages of the active province catalog.
2. Keep the commune selector disabled until a province is selected.
3. When province changes, synchronously clear `communeCode`, dependent validation state, and project selection before fetching new pages.
4. Fetch every page of `/locations/provinces/{provinceCode}/commune-units` until `last=true`; deduplicate by official code and sort by display name/code.
5. Never show stale commune options from the previous province.
6. A submit remains blocked while required options are loading or invalid.

States:

| State | Province control | Commune control | Supporting UI |
|---|---|---|---|
| Initial loading | Disabled | Disabled | `Đang tải tỉnh, thành phố…` |
| Ready/no province | Enabled | Disabled | Placeholder `Chọn tỉnh / thành phố trước` |
| Commune loading | Enabled | Disabled | `Đang tải phường, xã, đặc khu…` |
| Ready | Enabled | Enabled | Complete selected-province options |
| Empty | Enabled | Disabled | `Chưa có đơn vị cấp xã khả dụng.` |
| Error | Preserve valid selection | Disabled if required data absent | Vietnamese message plus `Thử lại` |
| No active release | Disabled | Disabled | `Dữ liệu địa chỉ đang được quản trị viên thiết lập.` |

Accessibility:

- Visible linked labels and descriptions.
- Native keyboard-accessible controls for this release.
- `required`, `aria-invalid`, and `aria-describedby` reflect form state.
- Loading uses `role="status"`; failure uses `role="alert"`.
- Validation summary links/focuses the first invalid field.
- Controls and retry buttons meet a 44px target.

## Seller Listing Form

Order:

1. Category
2. Province/city
3. Commune-level unit
4. Optional project filtered to the valid address context
5. Free-form street/address
6. Remaining listing fields

Validation messages:

- Missing province: `Vui lòng chọn tỉnh / thành phố.`
- Missing commune: `Vui lòng chọn phường, xã hoặc đặc khu.`
- Invalid relation: `Phường, xã hoặc đặc khu không thuộc tỉnh / thành phố đã chọn.`
- Catalog unavailable: `Dữ liệu địa chỉ chưa sẵn sàng. Vui lòng thử lại sau.`

Request payload contains `provinceCode` and `communeCode`; it contains no district or legacy ward field.

AI assistant reuses the form's selected codes. It is disabled until category, province, commune, price, area, and other existing prerequisites are valid.

## Administrator Project Form

- Reuse `TwoLevelLocationFields` without independent location logic.
- Require a valid province/commune pair before create/update.
- Changing province clears commune and any address-dependent state.
- Project table/detail shows `communeName, provinceName` and no district column.

## Public Listing and Project Filters

- Province and commune filter state uses `provinceCode` and `communeCode` URL parameters.
- Commune filter is disabled until province exists.
- Changing/clearing province removes commune from local state and URL in the same action.
- A URL containing commune without province is normalized by clearing commune; no legacy district resolution is attempted.
- Applying a valid filter preserves unrelated keyword, transaction, category, price, area, project, status, sort, and paging behavior.
- Reset clears both location codes.

## Address Display

All listing/project cards and detail/workspace screens call one formatter with:

```text
address, communeName, provinceName
```

The formatter omits empty segments, joins remaining segments with commas, and has no district argument or fallback.

Required surfaces:

- Home/recommendation listing cards
- Public listing list and detail
- Saved listings
- Seller listing list/detail/edit
- Admin moderation views
- Project list/detail/admin management

## ADMIN Location Management

Replace manual three-level CRUD with release operations.

### Administrative release panel

Shows:

- Version, authority, document number, effective date
- Source links and attribution
- Normalized SHA-256
- Expected/actual province and commune counts
- Type counts and sentinel result
- Status and validation/activation timestamps
- Current active badge

Actions:

- `Kiểm tra bộ dữ liệu`
- `Kích hoạt bộ dữ liệu` only after validation

Activation uses a confirmation dialog that repeats version, checksum prefix, and exact counts. A successful activation invalidates public/admin location queries.

### Category release panel

Shows version/checksum, 16 total, 8 BUY, 8 RENT, status, and the approved slug/name list. Actions are `Kiểm tra danh mục` and `Kích hoạt danh mục` with confirmation.

### Catalog inspection

- Paginated/searchable province table.
- Paginated/searchable commune-level table filterable by province and type.
- Read-only official code, name, type, effective date, and release columns.
- No direct create/update/delete buttons for official units.

### Authorization/failure

- Page and mutations require ADMIN.
- Non-admin users retain the existing access-denied experience.
- Validation failure shows safe diagnostics and leaves activation disabled.
- Repeated validation/activation displays success without duplicate wording.
- Concurrency conflict offers reload/retry; it never implies both releases are active.

## Responsive Requirements

Validate at 320, 360, 768, 1024, and 1440px.

- Form controls stack on narrow viewports and share available width on larger layouts.
- Release metadata wraps without clipping hashes/source links.
- Admin tables use contained horizontal scrolling when necessary; the page itself must not overflow horizontally.
- Dialog actions remain reachable without horizontal scrolling.

## Empty Production State

Immediately after V10 and before ADMIN activation:

- Public selectors show catalog unavailable, not demo options.
- Seller/project submission is blocked by catalog availability.
- Admin release page remains usable so an ADMIN can validate and activate the bundled artifacts.
- No synthetic project, listing, price, account, payment, view, or analytics card is shown.
