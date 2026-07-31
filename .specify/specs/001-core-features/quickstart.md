# Quickstart Validation Guide: Core Features

This guide details the scenarios to run to validate that the core feature flow (End-to-End) works correctly on your local environment.

## Prerequisites

1. Ensure the backend Spring Boot server is running on `http://localhost:8080`.
2. Ensure the frontend React app is running on `http://localhost:5173`.
3. Ensure MySQL is running and the schema is migrated.

## End-to-End Core Flow

### 1. Account Creation (Guest -> User)

- Navigate to `http://localhost:5173/register`.
- Fill in Name, Email, Password, and Phone.
- Submit the form.
- **Expected Outcome**: Account created successfully, redirected to the Login page.

### 2. Role Upgrade (User -> Seller)

- Login with the newly created account.
- Navigate to the User Profile page.
- Click the "Upgrade to Seller" button.
- **Expected Outcome**: The user's role is immediately updated to `SELLER`, and they gain access to the "Post Listing" button.

### 3. Posting a Listing (Seller)

- Click "Post Listing".
- Fill in the required details (Category, District, Title, Description, Price, Area) and upload 2 images.
- Submit the form.
- **Expected Outcome**: Listing is created and visible in the "My Listings" dashboard with the status `PENDING`.

### 4. Admin Moderation (Admin)

- Log out of the Seller account.
- Log in with a pre-seeded Admin account.
- Navigate to the Admin Dashboard -> Pending Listings.
- Find the newly created listing and click "Approve".
- **Expected Outcome**: The listing status changes to `ACTIVE`.

### 5. Listing Discovery (Guest/User)

- Navigate to the Home page (`http://localhost:5173/`).
- Use the search bar to filter by the District and Category of the newly created listing.
- **Expected Outcome**: The listing appears in the search results.
- Click on the listing.
- **Expected Outcome**: The detail page loads with all information, images, and the seller's contact info visible.
