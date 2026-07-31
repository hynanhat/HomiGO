# Tasks: Core Features (HomiGO)

**Input**: Design documents from `/specs/001-core-features/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/main/java/com/batdongsan/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Entity & Database Schema (Foundational)

**Purpose**: Core infrastructure and database schemas that must be complete before other stories.

- [X] T001 Initialize backend Spring Boot project and frontend React Vite project
- [X] T002 Configure MySQL database connection in `backend/src/main/resources/application.yml`
- [X] T002b [P] Setup `.env` and `application-dev.yml` to securely inject JWT secret keys (Constitution mandate)
- [X] T003 [P] Create `User` entity in `backend/src/main/java/com/batdongsan/entity/User.java`
- [X] T004 [P] Create `Province` and `District` entities in `backend/src/main/java/com/batdongsan/entity/Location.java`
- [X] T005 [P] Create `Category` entity in `backend/src/main/java/com/batdongsan/entity/Category.java`
- [X] T006 [P] Create `Project` entity in `backend/src/main/java/com/batdongsan/entity/Project.java`
- [X] T007 [P] Create `Listing` and `ListingImage` entities in `backend/src/main/java/com/batdongsan/entity/Listing.java`
- [X] T008 [P] Create `SavedListing` entity in `backend/src/main/java/com/batdongsan/entity/SavedListing.java`
- [X] T009 Create Spring Data JPA Repositories for all entities in `backend/src/main/java/com/batdongsan/repository/`
- [X] T010 Setup GlobalExceptionHandler in `backend/src/main/java/com/batdongsan/exception/GlobalExceptionHandler.java`

---

## Phase 2: Authentication (Register/Login/JWT)

**Goal**: Implement User Registration and Login with Spring Security & JWT (User Story 2)

- [X] T011 [US2] Implement JwtUtil and JwtAuthFilter in `backend/src/main/java/com/batdongsan/security/`
- [X] T012 [US2] Configure SecurityConfig with BCrypt in `backend/src/main/java/com/batdongsan/config/SecurityConfig.java`
- [X] T013 [P] [US2] Create Auth DTOs (RegisterReq, LoginReq, AuthRes) in `backend/src/main/java/com/batdongsan/dto/`
- [X] T014 [US2] Implement AuthService in `backend/src/main/java/com/batdongsan/service/AuthService.java`
- [X] T015 [US2] Implement AuthController (`/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/password`) in `backend/src/main/java/com/batdongsan/controller/AuthController.java`

---

## Phase 3: API Listing CRUD & Search

**Goal**: Backend logic for searching, posting, and managing real estate listings (User Story 1 & 3)

- [X] T016 [P] [US1] Create Listing DTOs (ListingReq, ListingRes, ListingFilter) in `backend/src/main/java/com/batdongsan/dto/`
- [X] T017 [US3] Implement ListingService (Create, Update, Delete) in `backend/src/main/java/com/batdongsan/service/ListingService.java`
- [X] T018 [US1] Implement ListingService (Search with Filters & Pagination) in `backend/src/main/java/com/batdongsan/service/ListingService.java`
- [X] T019 [US3] Implement image upload logic (MultipartFile to local storage) in `backend/src/main/java/com/batdongsan/service/FileStorageService.java`
- [X] T020 [US1] Implement ListingController (`/api/v1/listings`) in `backend/src/main/java/com/batdongsan/controller/ListingController.java`
- [X] T021 [US2] Implement SavedListing logic (Favorite listing) in `backend/src/main/java/com/batdongsan/controller/ListingController.java`

---

## Phase 4: Frontend Luồng Tìm Kiếm & Xem Tin

**Goal**: Frontend UI for Guest/User to search and view listings (User Story 1)

- [X] T022 [P] [US1] Setup React Router and Axios instance in `frontend/src/services/api.ts`
- [X] T023 [P] [US1] Create Home Page UI with Search Filters in `frontend/src/pages/HomePage.tsx`
- [X] T024 [US1] Create Listing List Page (Pagination & Sorting) in `frontend/src/pages/ListingPage.tsx`
- [X] T025 [P] [US1] Create Listing Card Component in `frontend/src/components/ListingCard.tsx`
- [X] T026 [US1] Create Listing Detail Page in `frontend/src/pages/ListingDetailPage.tsx`
- [X] T027 [US1] Integrate Search API and Detail API to the frontend pages

---

## Phase 5: Frontend Đăng Tin & Quản Lý Tin

**Goal**: Frontend UI for Seller to post and manage listings (User Story 3)

- [X] T028 [P] [US2] Create AuthContext for global login state in `frontend/src/context/AuthContext.tsx`
- [X] T029 [US2] Create Login/Register Pages in `frontend/src/pages/AuthPage.tsx`
- [X] T029b [US2] Create Password Change Component in User Profile (`frontend/src/components/PasswordChange.tsx`)
- [X] T030 [US3] Create Seller Dashboard (My Listings) in `frontend/src/pages/SellerDashboard.tsx`
- [X] T031 [US3] Create Post Listing Form (with Multi-Image Upload UI) in `frontend/src/pages/PostListingPage.tsx`
- [X] T032 [US3] Integrate Auth API, Post Listing API, and Image Upload API to frontend

---

## Phase 6: Module Project (Dự Án Bất Động Sản)

**Goal**: Browse and view real estate projects (User Story 5)

- [X] T033 [P] [US5] Implement ProjectService and ProjectController in backend
- [X] T034 [P] [US5] Create Project List Page in `frontend/src/pages/ProjectListPage.tsx`
- [X] T035 [US5] Create Project Detail Page (showing associated listings) in `frontend/src/pages/ProjectDetailPage.tsx`
- [X] T036 [US5] Integrate Project APIs to frontend

---

## Phase 7: Trang Admin

**Goal**: Admin moderation and management (User Story 4)

- [X] T037 [P] [US4] Implement AdminService for approving/rejecting listings in backend
- [X] T038 [P] [US4] Implement AdminService for banning/unbanning users in backend (includes side-effect: auto-rejecting/hiding user's active listings)
- [X] T038b [P] [US4] Implement CRUD logic for Categories and Locations in AdminService
- [X] T039 [US4] Implement AdminController in `backend/src/main/java/com/batdongsan/controller/AdminController.java` (including category/location endpoints)
- [X] T040 [US4] Create Admin Dashboard UI in `frontend/src/pages/AdminDashboard.tsx`
- [X] T040b [US4] Create Category and Location Management UI in Admin Dashboard
- [X] T041 [US4] Integrate Admin moderation APIs to frontend

---

## Phase 8: Test & Tối Ưu

**Goal**: Ensure quality and test core services.
- [X] T042 [P] Write Unit Tests for `AuthService` in `backend/src/test/java/com/batdongsan/service/AuthServiceTest.java`
- [X] T043 [P] Write Unit Tests for `ListingService` in `backend/src/test/java/com/batdongsan/service/ListingServiceTest.java`
- [X] T044 Run quickstart.md validation locally
- [X] T045 Optimize frontend performance (lazy loading routes, memoization)

---

## Phase 9: Deploy

**Goal**: Prepare the application for deployment.
- [X] T046 [P] Create `Dockerfile` for backend Spring Boot application
- [X] T047 [P] Create `Dockerfile` for frontend React Vite application
- [X] T048 Create `docker-compose.yml` combining backend, frontend, and MySQL
- [X] T049 Write deployment instructions in README.md

---

## Dependencies & Execution Order

- **Phase 1** must be completed first to establish the database and entity layers.
- **Phase 2 (Auth)** unblocks user identity, allowing Phase 3 (CRUD) and Phase 5 (Frontend Post/Manage) to function securely.
- **Phase 3 and Phase 4** can be developed in parallel by different developers (Backend / Frontend).
- **Phase 5** depends on Auth Context and Listing CRUD APIs.
- **Phase 6 and 7** can be built independently after Phase 1 and 2 are complete.
- **Phase 8 and 9** are performed at the end of the feature development cycle.
