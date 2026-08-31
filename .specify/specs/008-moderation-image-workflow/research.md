# Research: Safe Listing Moderation and Multi-Image Workflow

## 1. Administrator detail and action boundary

**Decision**: Keep the moderation queue as a summary-only, paginated workspace. Each row links to `/admin/listings/:id`; approve/reject/remove actions exist only in the dedicated detail view.

**Rationale**: The current queue does not expose enough listing, seller, address, contact, or image data for a responsible decision. A separate detail response prevents inflating every queue row and creates one auditable decision context.

**Rejected alternatives**:

- Expand each table row inline: difficult to scan, inaccessible on small screens, and still encourages action before review.
- Reuse the public listing page: it hides non-public statuses and includes user-only actions such as favorite/contact calls.

## 2. Published-listing enforcement

**Decision**: Add an `ACTIVE -> REMOVED` admin-only transition through `POST /api/v1/admin/listings/{id}/remove`. The request requires a trimmed 5–500 character reason and the listing remains stored.

**Rationale**: A soft takedown removes public visibility immediately while retaining evidence and giving the seller a repair path. `DELETE` would imply physical destruction and conflict with audit requirements.

**Rejected alternatives**:

- Reuse `REJECTED`: rejection describes pre-publication review, whereas removal is a post-publication enforcement event.
- Hard-delete as admin: destroys evidence and prevents seller remediation.
- Reuse `INACTIVE`: that state represents seller deactivation, not an admin enforcement action.

## 3. Audit and stale writes

**Decision**: Store `removal_reason`, `removed_by`, and `removed_at` on the listing for current-state display, and add `REMOVED` to listing-history status values. Every moderation mutation loads the listing with a pessimistic write lock and verifies a required `expectedVersion` against the entity `@Version`.

**Rationale**: History provides a durable sequence; listing fields make the current reason efficient to display. Lock plus version prevents two admin sessions from both applying actions based on stale screens.

**Rejected alternatives**:

- Version check only: useful but still allows more contention between read and write windows.
- Lock only: serializes operations but cannot explain that the browser acted on an old representation.

## 4. Seller remediation

**Decision**: Owners can view, edit, manage images, resubmit, or delete `REMOVED` listings. Editing moves `REMOVED -> DRAFT`; direct submission moves `REMOVED -> PENDING`. Either remediation clears stale removal and prior moderation/publication/expiry metadata that no longer describes the revised submission.

**Rationale**: The user can correct a violation without recreating all data, while the history table still retains the enforcement event.

## 5. Public visibility

**Decision**: Continue serving public listing detail/search/recommendations only for active, unexpired records and close the saved-listing path so it cannot return removed or otherwise non-public records.

**Rationale**: A removed listing must disappear consistently, not only from the main search. Image files under the existing public `/uploads/**` route are not made private in this feature; protected/quarantined media would require a separate storage and authorization design.

## 6. Multi-image transport

**Decision**: Retain one image per HTTP request and orchestrate up to ten requests sequentially in the frontend. Add optional multipart `uploadId` (UUID) and a nullable, unique `(listing_id, client_upload_id)` database key so a retry returns the existing image.

**Rationale**: The current architecture already supports ten images. Sequential requests keep each body below the current 6 MB proxy limit, allow retry per image, and avoid all-or-nothing multipart batches. An idempotency key addresses uncertain timeout outcomes.

**Rejected alternatives**:

- `files[]` batch endpoint: increases request size, weakens partial retry, and risks host Nginx rejection.
- Content-hash deduplication: would incorrectly forbid a seller from intentionally using the same binary more than once and is costlier than request identity.

## 7. Image ordering and concurrency

**Decision**: Under the existing listing write lock, assign `sort_order = MAX(sort_order) + 1`; do not use image count. The UI uses a synchronous upload mutex, a stable local `uploadId`, disables conflicting add/remove actions while the batch runs, and retries only pending/failed items.

**Rationale**: Count can reuse an occupied order after a middle image is deleted. Stable keys plus locked batch state prevent rapid double-click and timeout retries from duplicating rows.

## 8. User experience and accessibility

**Decision**: Show “Chọn nhiều ảnh”, current/maximum and remaining capacity, per-item states, batch progress, retry controls, and Vietnamese error details. Moderation detail uses an explicit empty gallery, a visible focus target, 44 px controls, status text (not color alone), inline reason validation, and a confirmation dialog with Escape, focus restoration, and keyboard focus containment.

**Rationale**: The input already permits multiple selection but current wording and feedback suggest a single-image flow. Destructive enforcement needs a clear, keyboard-accessible confirmation.

## 9. Deployment limits

**Decision**: Keep Spring at 5 MB per file / 6 MB request and ensure both container Nginx and host Nginx declare `client_max_body_size 6m` or greater.

**Rationale**: The app can accept a file that the outer proxy rejects first. VPS verification must inspect `nginx -T`, not only the repository container configuration.
