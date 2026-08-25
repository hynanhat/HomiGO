# REST API Contract: Advanced Property Insights

All responses use the existing envelope:

```json
{
  "success": true,
  "data": {},
  "message": "Thành công"
}
```

Errors use `{ "success": false, "data": null, "message": "...", "errorCode": "..." }`.

## Notifications

### `GET /api/v1/notifications?page=0&size=20&unreadOnly=false`

- Authentication: any authenticated role.
- Returns only the authenticated user's notifications, newest first, using the existing page response shape.

Notification item:

```json
{
  "id": 42,
  "type": "LISTING_APPROVED",
  "title": "Tin đăng đã được duyệt",
  "message": "Tin “Căn hộ trung tâm” đã được duyệt và đang hiển thị.",
  "listingId": 15,
  "listingPublicCode": "HMG-ABC123DEF456",
  "read": false,
  "readAt": null,
  "createdAt": "2026-08-17T10:30:00"
}
```

### `GET /api/v1/notifications/unread-count`

- Authentication: any authenticated role.
- Data: `{ "count": 3 }`.

### `PATCH /api/v1/notifications/{notificationId}/read`

- Authentication: recipient only.
- Returns updated notification item.
- Repeating the action is successful and retains the original `readAt`.

### `PATCH /api/v1/notifications/read-all`

- Authentication: any authenticated role.
- Data: `{ "updatedCount": 3 }`.

## Listing view analytics

### `POST /api/v1/listings/{publicCode}/views`

- Authentication: optional.
- Explicitly public in security configuration.
- Request:

```json
{
  "visitorId": "d1b70a08-f595-4e9a-a7d2-f10a6c23ca80"
}
```

- Authenticated identity overrides `visitorId` for deduplication, but the visitor ID remains required so the same frontend flow works before/after session resolution.
- Data: `{ "recorded": true }` for the first unique view; `{ "recorded": false }` for a duplicate on the same business day.
- Returns `404` when listing is not active/public, `400` for malformed visitor ID.

### `GET /api/v1/seller/listings/{listingId}/statistics?days=30`

- Authentication: role `SELLER`; requester must own listing.
- `days`: integer 7–90, default 30.

### `GET /api/v1/admin/listings/{listingId}/statistics?days=30`

- Authentication: role `ADMIN`.
- Same response as seller endpoint.

Statistics data:

```json
{
  "listingId": 15,
  "publicCode": "HMG-ABC123DEF456",
  "totalViews": 124,
  "todayViews": 7,
  "last7DaysViews": 46,
  "periodDays": 30,
  "dailyViews": [
    { "date": "2026-08-16", "views": 5 },
    { "date": "2026-08-17", "views": 7 }
  ]
}
```

## Recommendations

### `GET /api/v1/listings/{publicCode}/recommendations?size=6`

- Authentication: public.
- `size`: integer 1–12, default 6.
- Returns an ordered list; an empty list is valid.

Recommendation item:

```json
{
  "listing": {
    "id": 21,
    "publicCode": "HMG-987654ABCDEF",
    "title": "Căn hộ cùng khu vực"
  },
  "score": 83,
  "reasons": ["Cùng loại bất động sản", "Cùng quận/huyện", "Mức giá tương đương"]
}
```

The nested `listing` object follows the existing `ListingRes` contract. The target, inactive and expired listings never appear.

## Workflow side effects

- `POST /api/v1/seller/listings/{id}/submit`: creates one `LISTING_SUBMITTED` notification for each active administrator.
- Updating an active listing into `PENDING`: creates the same administrator notifications.
- `POST /api/v1/admin/listings/{id}/approve`: creates one `LISTING_APPROVED` notification for the owner.
- `POST /api/v1/admin/listings/{id}/reject`: creates one `LISTING_REJECTED` notification for the owner and includes the rejection reason.
- Scheduled expiration: creates one `LISTING_EXPIRED` notification for the owner.
