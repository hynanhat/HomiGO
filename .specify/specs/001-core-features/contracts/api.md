# API Contracts: Core Features

**Base Path**: `/api/v1`

**Global Response Format**:
```json
{
  "success": true | false,
  "data": { ... } | [ ... ] | null,
  "message": "String message",
  "errorCode": "OPTIONAL_ERROR_CODE"
}
```

## Authentication

### `POST /auth/register`
- **Role**: PUBLIC
- **Body**: `{ name, email, password, phone }`
- **Response**: `{ id, email, role }`

### `POST /auth/login`
- **Role**: PUBLIC
- **Body**: `{ email, password }`
- **Response**: `{ token, user: { id, name, email, role } }`

### `PUT /auth/password`
- **Role**: USER, SELLER, ADMIN
- **Body**: `{ currentPassword, newPassword }`
- **Response**: Success message.

## Listings (Public & Management)

### `GET /listings`
- **Role**: PUBLIC
- **Query Params**: `type` (BUY/RENT), `province`, `district`, `category`, `minPrice`, `maxPrice`, `minArea`, `maxArea`, `page`, `size`
- **Response**: Paginated list of listings (status = ACTIVE only).

### `GET /listings/{id}`
- **Role**: PUBLIC
- **Response**: Full listing details, including images and seller contact info.

### `POST /listings`
- **Role**: SELLER, ADMIN
- **Body**: `{ categoryId, districtId, projectId(optional), title, description, price, area }`
- **Response**: Created listing ID. (Status defaults to PENDING).

### `PUT /listings/{id}`
- **Role**: SELLER (Owner), ADMIN
- **Body**: `{ categoryId, districtId, projectId(optional), title, description, price, area }`
- **Response**: Updated listing details.

### `DELETE /listings/{id}`
- **Role**: SELLER (Owner), ADMIN
- **Response**: Success message.

### `POST /listings/{id}/images`
- **Role**: SELLER (Owner), ADMIN
- **Body**: `multipart/form-data` containing files.
- **Response**: List of uploaded image URLs.

## Projects

### `GET /projects`
- **Role**: PUBLIC
- **Query Params**: `district`, `page`, `size`
- **Response**: Paginated list of projects.

### `GET /projects/{id}`
- **Role**: PUBLIC
- **Response**: Project details, including associated active listings.

## Saved Listings (Favorites)

### `POST /saved-listings/{listingId}`
- **Role**: USER, SELLER, ADMIN
- **Response**: Success message.

### `DELETE /saved-listings/{listingId}`
- **Role**: USER, SELLER, ADMIN
- **Response**: Success message.

## Admin Moderation

### `GET /admin/listings`
- **Role**: ADMIN
- **Query Params**: `status` (e.g., PENDING), `page`, `size`
- **Response**: Paginated list of listings matching the status.

### `PATCH /admin/listings/{id}/status`
- **Role**: ADMIN
- **Body**: `{ status: "ACTIVE" | "REJECTED" }`
- **Response**: Success message.

### `PATCH /admin/users/{id}/status`
- **Role**: ADMIN
- **Body**: `{ status: "BANNED" | "ACTIVE" }`
- **Response**: Success message.

### `POST /admin/categories`
- **Role**: ADMIN
- **Body**: `{ name, slug, transactionType }`
- **Response**: Created Category object.

### `PUT /admin/categories/{id}`
- **Role**: ADMIN
- **Body**: `{ name, slug, transactionType }`
- **Response**: Updated Category object.

### `DELETE /admin/categories/{id}`
- **Role**: ADMIN
- **Response**: Success message.

### `POST /admin/locations`
- **Role**: ADMIN
- **Body**: `{ name, type, parentId (optional) }`
- **Response**: Created Location object (Province or District).

### `DELETE /admin/locations/{id}`
- **Role**: ADMIN
- **Response**: Success message.
