# Feature Specification: Safe Listing Moderation and Multi-Image Workflow

**Feature Branch**: `008-moderation-image-workflow`

**Created**: 2026-08-31

**Status**: Ready for implementation

**Input**: User description: "Admin must be able to inspect the complete listing before approval, remove an approved listing when necessary, and sellers must have a clear multi-image upload workflow."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inspect Before Moderating (Priority: P1)

As an administrator, I open a pending listing and review its complete submitted content, seller identity, location, commercial details, contact data, and all images before deciding whether to approve or reject it.

**Why this priority**: Approving from summary data creates an unacceptable trust and safety gap because the administrator cannot verify the content being published.

**Independent Test**: Create a pending listing with multiple images, open it from the moderation queue, and verify that every submitted field and image is visible before either moderation action is available.

**Acceptance Scenarios**:

1. **Given** a pending listing, **When** an administrator selects it from the moderation queue, **Then** a dedicated detail view shows the title, description, category, transaction type, price, area, complete two-level address, project, property attributes, seller/contact data, timestamps, status, and all images.
2. **Given** a pending listing in the queue, **When** the administrator has not opened its detail view, **Then** the queue offers a view action but no direct approve or reject action.
3. **Given** the administrator is viewing a pending listing, **When** they approve it, **Then** it becomes publicly active and the administrator returns to an updated moderation context.
4. **Given** the administrator is viewing a pending listing, **When** they reject it with a valid reason, **Then** it becomes rejected, the reason is recorded, and the seller is notified.

---

### User Story 2 - Remove a Published Listing Safely (Priority: P1)

As an administrator, I remove an active listing from public discovery with a mandatory reason while preserving the listing and its moderation history for audit and seller remediation.

**Why this priority**: Administrators need a proportionate post-publication enforcement action that does not destroy evidence or require banning the seller.

**Independent Test**: Start with an active public listing, remove it as an administrator with a reason, verify it disappears from public discovery, remains visible to admin and owner with the reason, and can be edited and resubmitted by the owner.

**Acceptance Scenarios**:

1. **Given** an active listing, **When** an administrator confirms removal with a reason, **Then** the listing immediately stops appearing on public pages and its status becomes removed.
2. **Given** an active listing, **When** an administrator submits a blank or invalid removal reason, **Then** no state change occurs and an inline validation message is shown.
3. **Given** a removed listing, **When** the seller opens it, **Then** the removal reason is visible and the seller may edit, manage images, resubmit, or delete it.
4. **Given** any removal, **When** the state change completes, **Then** the system records actor, time, previous status, new status, and reason and notifies the seller.
5. **Given** a listing that is not active, **When** a removal is attempted, **Then** the operation is rejected without changing data.

---

### User Story 3 - Upload Multiple Listing Images Clearly (Priority: P2)

As a seller, I select and upload several listing images in one batch, see how many slots remain, follow each image's progress, and retry failed items without re-uploading successful images.

**Why this priority**: The underlying capacity already supports multiple images, but unclear selection and upload feedback makes sellers believe only one image is allowed.

**Independent Test**: On an editable listing, select three valid images together, upload them, verify all three remain visible after reload, then simulate one failed item and retry only that item.

**Acceptance Scenarios**:

1. **Given** an editable listing with fewer than ten images, **When** the seller selects multiple valid images, **Then** every selected image appears in a queue and the interface reports the selected/maximum count.
2. **Given** queued images, **When** upload starts, **Then** each image shows a visible pending, uploading, uploaded, or failed state and the batch action communicates progress.
3. **Given** a batch containing a failed image, **When** the seller retries it, **Then** only failed or pending items are uploaded and successful items are not duplicated.
4. **Given** ten stored or queued images, **When** the seller tries to add more, **Then** the excess is rejected with a clear Vietnamese message.
5. **Given** an image with an unsupported format, duplicate identity, or size above 5 MB, **When** it is selected, **Then** that image is rejected without preventing other valid selections from being queued.

### Edge Cases

- A listing changes status in another session while its admin detail view is open; the stale moderation action must fail safely and the view must refresh.
- A removed listing must not be reachable through public detail, recommendations, search, or saved-listing discovery even if its old public code is known.
- An administrator must be able to inspect listings in pending, active, rejected, removed, inactive, and expired states, but actions must be limited by current status.
- A listing with no image still has a usable admin detail view with an explicit empty-gallery state.
- Closing or navigating away during an image batch must not create duplicate records on retry; successfully completed items remain completed.
- Selecting the same local file again after removing a failed or queued item must trigger validation and selection normally.
- Deleting a removed listing must also clean up its stored image files according to the existing deletion lifecycle.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide administrators a dedicated detail view for every listing status.
- **FR-002**: The administrator detail view MUST display all seller-submitted content, all images, seller identity/contact context, current moderation reason, and relevant timestamps.
- **FR-003**: The moderation queue MUST require navigation to the detail view before offering approve or reject actions.
- **FR-004**: The system MUST restrict approve and reject actions to pending listings and require a non-blank rejection reason within the existing validation bounds.
- **FR-005**: The system MUST allow an administrator to remove only an active listing with a non-blank reason between 5 and 500 characters.
- **FR-006**: Administrative removal MUST be a reversible business-state transition rather than physical deletion, and MUST immediately exclude the listing from all public discovery surfaces.
- **FR-007**: The system MUST preserve and expose moderation history containing actor, timestamp, source status, destination status, and reason.
- **FR-008**: The system MUST notify the seller when an administrator removes an active listing and include the removal reason.
- **FR-009**: A seller MUST be able to edit, manage images, resubmit, or delete their own removed listing.
- **FR-010**: Editing a removed listing MUST return it to a non-public draft state before it can be resubmitted.
- **FR-011**: The system MUST accept up to ten images per listing, limited to JPEG, PNG, or WebP and 5 MB per file.
- **FR-012**: The seller interface MUST support selecting multiple images in one picker action and adding valid files across repeated selections.
- **FR-013**: The seller interface MUST show the current image count, remaining capacity, batch progress, and status for each queued image.
- **FR-014**: Failed image uploads MUST be independently retryable without duplicating successfully uploaded images.
- **FR-015**: File validation MUST report errors per image while retaining other valid selections.
- **FR-016**: All administrative endpoints MUST require an active ADMIN account, and all seller image/remediation operations MUST retain ownership checks.
- **FR-017**: All state-changing operations MUST use centralized error responses and Vietnamese user-facing messages.
- **FR-018**: Automated tests MUST cover administrator detail authorization and payload, approve/reject gating, active-listing removal, seller remediation, multi-file selection, batch upload success/failure/retry, and the ten-image boundary.

### Key Entities

- **Listing**: The moderated property advertisement, extended with a removed lifecycle state and a visible moderation reason while retaining its submitted content and images.
- **Listing Status History**: The immutable audit event for listing transitions, including the acting user and reason.
- **Listing Image**: One stored image belonging to a listing, ordered within a maximum collection of ten.
- **Notification**: A seller-facing event announcing approval, rejection, expiration, submission, or administrative removal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An administrator can open a pending listing and review all submitted fields and images before deciding, with zero approve/reject controls remaining in the summary queue.
- **SC-002**: An administrator can remove an active listing in under 30 seconds, and the listing is absent from every public discovery surface on the next request.
- **SC-003**: Every administrative removal produces exactly one audit transition and one seller notification containing the reason.
- **SC-004**: A seller can select and successfully retain three valid images in one batch, and all three remain visible after page reload.
- **SC-005**: A seller can reach and understand every upload state without relying on color alone, using keyboard or touch controls of at least 44 by 44 CSS pixels for primary actions.
- **SC-006**: Automated backend and frontend suites cover all three user stories with no regression in existing listing lifecycle behavior.

## Assumptions

- “Delete an approved listing” means remove it from public visibility while preserving evidence; physical deletion is intentionally not available directly from the active state.
- Removed listings may be corrected and resubmitted by their owner; resubmission follows the existing pending-review workflow.
- The existing ten-image, 5 MB, and JPEG/PNG/WebP limits remain unchanged.
- Images continue to upload through the existing authenticated seller endpoint one file per request; the interface orchestrates the batch safely.
- Existing authentication, authorization, centralized API envelope, notification polling, Docker storage volume, and public active-status filters remain in use.
- The established HomiGO visual system remains unchanged; this feature adds content-first detail and clearer feedback rather than a new design language.
