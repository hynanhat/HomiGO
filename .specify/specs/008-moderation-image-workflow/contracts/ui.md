# UI Contract

## Moderation queue `/admin/listings`

- Retains status filters and pagination.
- Each listing exposes one primary row action: **Xem chi tiết**.
- No approve/reject/remove control appears in the queue.
- Filter/page state should survive return navigation via URL query parameters.

## Administrator detail `/admin/listings/:id`

### Content

- Breadcrumb back to moderation and visible listing ID/public code.
- Status label and version/update context.
- Explicit image gallery; when empty, display “Tin đăng chưa có hình ảnh”.
- Complete title, description, transaction/category, price, area, address, province/commune, project, coordinates, property attributes, contact data, seller identity, timestamps, current reasons, and ordered history.

### Actions

| Status | Actions |
|---|---|
| `PENDING` | Approve, reject |
| `ACTIVE` | Remove from publication |
| all others | Read-only |

- Reject/remove open a confirmation dialog with the reason field.
- Removal reason is mandatory and 5–500 characters; validation is inline and associated with the field.
- While submitting, controls are disabled and communicate progress.
- A stale `409` explains that the record changed and automatically refreshes detail.
- Successful action updates the detail and returns/focuses the user in a predictable moderation context.

### Layout and accessibility

- Desktop: main detail content plus approximately 22rem sticky action/history rail.
- Mobile/tablet: one column with content before actions.
- Route entry focuses the page heading.
- Controls have a minimum 44px target, visible focus state, and status is not conveyed by color alone.
- Dialog traps Tab/Shift+Tab, closes on Escape, restores opener focus, and preserves entered reason until explicit close/success.

## Seller image manager

- Picker label: **Chọn nhiều ảnh**.
- Helper: JPEG, PNG hoặc WebP; tối đa 5 MB/ảnh; tối đa 10 ảnh.
- Persistent capacity text: `N/10 ảnh` and remaining slots.
- Multiple selected files become separate preview cards immediately.
- The input resets after selection so choosing the same file later triggers `change` again.
- Batch CTA: **Tải N ảnh lên** and live text `Đang tải ảnh X/Y`.
- Each card displays `Chờ tải`, `Đang tải N%`, `Đã tải`, or `Thất bại`.
- During a batch, picker, removal, and a second batch action are disabled.
- Each failed item can be retried; retry never resends successful items.
- Safe error text identifies validation/network/server failures without exposing internals.

## Removed listing for seller

- Status badge includes text **Đã bị gỡ**.
- The removal reason is prominent in the owned detail/list view.
- Available actions: edit, manage images, submit again, delete.
- Removed listings never expose public/share discovery actions as if still published.
