# Data Model: HomiGO Backend Core

## User

`id`, `name`, `email` (unique), `password_hash`, `phone`, `avatar_url`, `role` (`USER|SELLER|ADMIN`), `status` (`ACTIVE|BANNED`), `created_at`, `updated_at`.

- Email được chuẩn hóa lowercase trước khi lưu.
- BANNED user không được xác thực và toàn bộ ACTIVE listing chuyển INACTIVE.

## RefreshToken

`id`, `user_id`, `token_hash` (unique), `expires_at`, `revoked_at`, `created_at`.

- Chỉ lưu hash, không lưu raw token.
- Token hết hạn/đã thu hồi không thể cấp access token.

## Province, District, Ward

- `Province(id, name, code)`
- `District(id, province_id, name, code)`
- `Ward(id, district_id, name, code)`

Code là unique trong cấp tương ứng; khóa ngoại không nullable.

## Category

`id`, `name`, `slug` (unique), `transaction_type` (`BUY|RENT`), `active`.

## Project

`id`, `name`, `slug`, `investor`, `district_id`, `ward_id`, `address`, `latitude`, `longitude`, `status`, `description`, `price_from`, `price_to`, `created_at`, `updated_at`.

## Listing

`id`, `public_code`, `user_id`, `category_id`, `district_id`, `ward_id`, `project_id?`, `title`, `description`, `price`, `area`, `address`, `latitude`, `longitude`, `bedrooms?`, `bathrooms?`, `floors?`, `direction?`, `furnishing?`, `legal_status?`, `contact_name`, `contact_phone`, `status`, `rejection_reason?`, `approved_by?`, `approved_at?`, `published_at?`, `expires_at?`, `created_at`, `updated_at`, `version`.

Validation:

- `price > 0`, `area > 0`; text có giới hạn chiều dài.
- Tọa độ hợp lệ nếu được cung cấp.
- Seller chỉ sửa tin của mình; admin có workflow riêng.
- Public query chỉ trả `ACTIVE` và chưa hết hạn.
- `version` dùng optimistic locking để phát hiện cập nhật đồng thời.

State transitions:

```text
DRAFT -> PENDING
PENDING -> ACTIVE | REJECTED
REJECTED -> DRAFT | PENDING
ACTIVE -> PENDING (seller edits) | INACTIVE | EXPIRED
INACTIVE -> PENDING
```

Khi chuyển ACTIVE: đặt `published_at=now`, `expires_at=now+30 days`. Từ chối bắt buộc có lý do.

## ListingImage

`id`, `listing_id`, `storage_key`, `url`, `content_type`, `size_bytes`, `sort_order`, `created_at`.

- Unique `(listing_id, sort_order)`.
- Tối đa 10 ảnh/tin; JPEG/PNG/WebP; mỗi ảnh tối đa 5 MB.

## SavedListing

`id`, `user_id`, `listing_id`, `created_at`; unique `(user_id, listing_id)`.

## ListingStatusHistory

`id`, `listing_id`, `from_status?`, `to_status`, `changed_by`, `reason?`, `created_at`.

Mọi thay đổi trạng thái đều được ghi để audit và trình bày lịch sử duyệt.

## Relationships

- User 1—N Listing, RefreshToken, SavedListing, ListingStatusHistory(changed_by).
- Province 1—N District; District 1—N Ward/Project/Listing.
- Project 1—N Listing (optional phía Listing).
- Listing 1—N ListingImage, SavedListing, ListingStatusHistory.
- Category 1—N Listing.

## Required Indexes

- Listing: `(status, created_at)`, `(district_id, status)`, `(category_id, status)`, `price`, `area`, `expires_at`, `public_code` unique.
- SavedListing: `(user_id, created_at)` và unique `(user_id, listing_id)`.
- Project: `(district_id, status)` và `slug` unique.
