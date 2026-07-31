# Data Model: Core Features

## Entities

### User
Represents a registered account in the system (Guests are unauthenticated and not stored).
- `id` (Long, PK)
- `name` (String, required)
- `email` (String, required, unique)
- `password_hash` (String, required)
- `phone` (String)
- `role` (Enum: `USER`, `SELLER`, `ADMIN`, default: `USER`)
- `status` (Enum: `ACTIVE`, `BANNED`, default: `ACTIVE`)
- `created_at` (Timestamp)

### Category
Represents the property type (e.g., Apartment, House, Land).
- `id` (Long, PK)
- `name` (String, required)
- `slug` (String, required, unique)
- `transaction_type` (Enum: `BUY`, `RENT`)

### Province
Represents a primary geographic location.
- `id` (Long, PK)
- `name` (String, required)

### District
Represents a sub-location within a Province.
- `id` (Long, PK)
- `province_id` (Long, FK to Province)
- `name` (String, required)

### Project
Represents a real estate development project.
- `id` (Long, PK)
- `name` (String, required)
- `investor` (String)
- `district_id` (Long, FK to District)
- `status` (String - e.g., "Under Construction", "Handed Over")
- `price_range` (String - e.g., "2-4 Tỷ")

### Listing
Represents a real estate property for sale or rent posted by a SELLER.
- `id` (Long, PK)
- `user_id` (Long, FK to User, required)
- `category_id` (Long, FK to Category, required)
- `district_id` (Long, FK to District, required)
- `project_id` (Long, FK to Project, nullable)
- `title` (String, required)
- `description` (Text, required)
- `price` (BigDecimal, required)
- `area` (Double, required)
- `status` (Enum: `PENDING`, `ACTIVE`, `REJECTED`, `EXPIRED`, default: `PENDING`)
- `created_at` (Timestamp)
- `expires_at` (Timestamp)

### ListingImage
Represents images attached to a listing (max 10 per listing).
- `id` (Long, PK)
- `listing_id` (Long, FK to Listing, required)
- `url` (String, required)
- `sort_order` (Integer)

### SavedListing
Represents the many-to-many relationship for users favoriting listings.
- `id` (Long, PK)
- `user_id` (Long, FK to User, required)
- `listing_id` (Long, FK to Listing, required)
- `created_at` (Timestamp)

## Relationships

- **User (1) to Listing (N)**: A seller can post multiple listings.
- **Category (1) to Listing (N)**: A category contains multiple listings.
- **Province (1) to District (N)**: A province contains multiple districts.
- **District (1) to Listing (N)**: A district contains multiple listings.
- **Project (1) to Listing (N)** (Nullable): A project can have multiple listings associated with it.
- **Listing (1) to ListingImage (N)**: A listing can have up to 10 images.
- **User (N) to Listing (N)**: Users can favorite multiple listings, mapped via the `SavedListing` entity.
