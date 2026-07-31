# Feature Specification: Core Features (HomiGO Real Estate Platform)

**Feature Branch**: `[001-core-features]`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "Xây dựng một nền tảng website bất động sản (rút gọn theo mô hình batdongsan.com.vn) cho phép người dùng tìm kiếm, đăng tin mua bán/cho thuê nhà đất, và xem thông tin các dự án bất động sản..."

## Clarifications

### Session 2026-07-30
- Q: How does a standard USER become a SELLER to start posting listings? → A: Any USER can upgrade to SELLER from their profile without Admin approval.
- Q: What is the maximum number of images allowed per property listing? → A: 10 images maximum.
- Q: How long does a listing remain "Active" before it expires? → A: 30 days.
- Q: If an Admin bans a seller's account, what happens to their currently active listings? → A: They are immediately hidden/deactivated from search results.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search and Browse Listings (Priority: P1)

As a Guest or User, I want to search and filter real estate listings so that I can find properties that match my needs (location, price, area, type).

**Why this priority**: Core functionality of a real estate platform; without it, buyers cannot find properties.

**Independent Test**: Can be fully tested by seeding the database with listings and verifying if the search filters and sorting mechanisms return the expected results.

**Acceptance Scenarios**:

1. **Given** I am on the home page, **When** I filter by transaction type (buy/rent), location, and price, **Then** I see a paginated list of properties matching those criteria.
2. **Given** a list of search results, **When** I sort by "Newest" or "Price", **Then** the list updates its order accordingly.
3. **Given** a listing in the search results, **When** I click on it, **Then** I can see full details (multiple images, description, map location, and seller contact info).

---

### User Story 2 - User Registration and Profile Management (Priority: P1)

As a Guest, I want to register for an account so that I can save my favorite listings and manage my personal information.

**Why this priority**: Necessary for tracking user identity, roles, and preferences.

**Independent Test**: Can be fully tested by completing the sign-up flow and modifying profile data.

**Acceptance Scenarios**:

1. **Given** I am an unregistered guest, **When** I submit valid registration details, **Then** my account is created with the default `USER` role.
2. **Given** I am logged in, **When** I update my profile or change my password, **Then** my information is securely saved.
3. **Given** I am logged in, **When** I click "Favorite" on a listing, **Then** it is added to my saved listings page for later viewing.
4. **Given** I am a `USER`, **When** I click the upgrade button in my profile, **Then** my role is immediately changed to `SELLER` without requiring Admin approval.

---

### User Story 3 - Listing Creation and Management (Priority: P1)

As a Seller/Broker, I want to post new property listings with images and manage my existing listings.

**Why this priority**: Generates the primary content (supply) for the platform.

**Independent Test**: Can be tested by logging in as a SELLER, creating a listing, and verifying its pending status.

**Acceptance Scenarios**:

1. **Given** I am logged in as a `SELLER`, **When** I submit a new listing with images and details, **Then** the listing is saved in "Pending Approval" status.
2. **Given** I have active and pending listings, **When** I visit my dashboard, **Then** I can see their statuses (pending/active/expired/rejected).
3. **Given** I own a listing, **When** I edit or delete it, **Then** the changes are applied immediately (or sent for re-approval).

---

### User Story 4 - Admin Listing Moderation (Priority: P1)

As an Admin, I want to review pending listings so that I can ensure platform quality and prevent spam.

**Why this priority**: Crucial for content moderation and completing the end-to-end listing publication flow.

**Independent Test**: Can be tested by having an Admin approve a pending listing and verifying its visibility to Guests.

**Acceptance Scenarios**:

1. **Given** there are pending listings, **When** I log in as an `ADMIN` and approve a listing, **Then** its status changes to "Active" and it becomes publicly searchable.
2. **Given** a pending listing, **When** I reject it, **Then** it remains hidden from the public and the seller is notified.
3. **Given** a user violates policies, **When** I block their account, **Then** they can no longer log in.

---

### User Story 5 - Project Browsing (Priority: P2)

As a Guest, I want to view real estate projects and see the listings associated with them.

**Why this priority**: Enhances the platform's value but is secondary to individual property listings.

**Independent Test**: Can be tested by navigating the projects directory and viewing project details.

**Acceptance Scenarios**:

1. **Given** I am browsing projects, **When** I filter by location or type, **Then** I see matching development projects.
2. **Given** I am on a project details page, **When** I scroll down, **Then** I see developer info, progress, and a list of properties for sale/rent within that project.

### Edge Cases

- What happens when a user tries to upload an image exceeding the size limit during listing creation?
- How does the system handle concurrent edits to the same listing by the seller and admin?
- What happens to a user's active listings if an Admin bans their account?
  - **Resolution**: All active listings belonging to the banned user are immediately hidden and deactivated from search results.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to search listings using filters: transaction type, location (province -> district), price range, area range, and property category.
- **FR-002**: System MUST allow sorting of search results by price and post date.
- **FR-003**: System MUST display listing details including multiple images, rich description, location data, and seller contact information.
- **FR-004**: System MUST support user authentication (Registration, Login, Password Change) with secure password hashing.
- **FR-005**: System MUST allow authenticated users to save/favorite listings and view them in a dedicated list.
- **FR-006**: System MUST allow users with the `SELLER` role to create listings and upload up to 10 images per listing.
- **FR-007**: System MUST allow Sellers to view, edit, delete, and track the status of their own listings (pending, active, expired, rejected).
- **FR-008**: System MUST provide an Admin dashboard to approve or reject pending listings.
- **FR-009**: System MUST allow Admins to manage (ban/unban) user accounts.
- **FR-010**: System MUST allow Admins to manage property categories and geographic locations.
- **FR-011**: System MUST display a dedicated section for Real Estate Projects, showing developer info, progress, and reference price.
- **FR-012**: System MUST link individual property listings to their parent Real Estate Project (if applicable).
- **FR-013**: System MUST NOT include payment gateways, paid memberships, real-time chat, news/wiki, or loan calculation features in this phase.

### Key Entities

- **User**: Core account entity. Roles: `USER`, `SELLER`, `ADMIN`.
- **Listing**: The property being sold or rented. Contains status, price, area, details.
- **ListingImage**: Images associated with a listing.
- **Project**: Real estate development projects.
- **Category**: Property types (e.g., Apartment, House, Land).
- **Location**: Provinces and Districts hierarchy.
- **Favorite**: Mapping table between Users and saved Listings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: End-to-End Flow Verification: A complete journey (Registration -> Post Listing -> Admin Approve -> Public Search -> View Details) can be successfully executed without errors.
- **SC-002**: Search Accuracy: 100% of search queries return results that strictly adhere to the applied filters (price, area, location).
- **SC-003**: Access Control: `USER`, `SELLER`, and `ADMIN` roles strictly enforce permission boundaries (e.g., users cannot edit others' listings, only admins can approve).
- **SC-004**: No stack traces or raw database errors are ever exposed to the user interface during failure scenarios.

## Assumptions

- Standard email and password authentication will be used.
- Location data (Provinces/Districts) will be pre-seeded in the database or managed manually by Admins.
- Image storage will rely on standard file uploads (local or basic cloud storage) without complex CDN requirements for this phase.
- Listing expiration logic can be handled via a daily cron job or evaluated at query time. Listings automatically expire after 30 days of being Active.
