# API Contract

All responses use the existing envelope. Error examples omit unrelated fields:

```json
{ "success": false, "message": "Dữ liệu đã thay đổi. Vui lòng tải lại.", "errorCode": "CONFLICT" }
```

## GET `/api/v1/admin/listings/{id}`

**Authorization**: ADMIN  
**Purpose**: Inspect any listing status before or after moderation.

```json
{
  "success": true,
  "message": "Lấy chi tiết tin đăng thành công",
  "data": {
    "listing": {
      "id": 42,
      "publicCode": "HMG-000042",
      "title": "Nhà phố 2 tầng",
      "description": "...",
      "status": "PENDING",
      "version": 3,
      "images": []
    },
    "seller": {
      "id": 7,
      "name": "Nguyễn Văn A",
      "email": "seller@example.com",
      "phone": "0900000000",
      "status": "ACTIVE",
      "createdAt": "2026-08-01T09:00:00Z"
    },
    "history": []
  }
}
```

Returns `403` for non-admin and `404` when absent.

## POST `/api/v1/admin/listings/{id}/approve`

```json
{ "expectedVersion": 3 }
```

Allowed only for `PENDING`. Returns `409` when version or status changed.

## POST `/api/v1/admin/listings/{id}/reject`

```json
{ "expectedVersion": 3, "reason": "Thông tin pháp lý chưa đầy đủ" }
```

Allowed only for `PENDING`. Existing rejection validation remains in force. Returns `409` when version or status changed.

## POST `/api/v1/admin/listings/{id}/remove`

```json
{
  "expectedVersion": 5,
  "reason": "Nội dung sau khi đăng vi phạm chính sách nền tảng"
}
```

Validation:

- `expectedVersion`: required, non-negative
- `reason`: required after trimming, 5–500 characters
- current status: exactly `ACTIVE`

Success changes the listing to `REMOVED`, writes history, stores current removal metadata, and notifies the seller. Invalid status/stale version returns `409`; invalid input returns `400`.

## POST `/api/v1/listings/{id}/images`

Existing multipart fields remain, with one addition:

| Part | Required | Description |
|---|---|---|
| `file` | yes | One JPEG/PNG/WebP file, maximum 5 MB |
| `uploadId` | no for compatibility, yes for new UI | UUID reused for every retry of this local item |

The response remains `ListingImageRes`. Sending the same `uploadId` again for the same listing returns the original image successfully without creating a row or second file.

## Seller mutation contract changes

- Owner edit, image add/delete, submit, and delete accept `REMOVED` where appropriate.
- Edit transitions a removed listing to `DRAFT`.
- Submit transitions it directly to `PENDING`.
- Owner detail includes `removalReason` while removed.
- Public detail/search/recommendation/saved-listing reads never return removed or otherwise non-public listings.
