# Implementation Plan: Core Features

**Branch**: `[001-core-features]` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `spec.md` and explicit user architectural constraints.

## Summary

Build a full-stack real estate platform (HomiGO) featuring user authentication, property listing management, project browsing, and admin moderation. The backend will be powered by Java Spring Boot 3.x with a layered architecture, and the frontend will use React (Vite). MySQL 8 will serve as the relational database.

## Technical Context

**Language/Version**: Java 17+ (Backend), TypeScript/JavaScript (Frontend)

**Primary Dependencies**: 
- Backend: Spring Boot 3.x (Web, Data JPA, Security), jjwt (JWT auth), MySQL Driver, Maven.
- Frontend: React, Vite, React Router, Axios.

**Storage**: MySQL 8 (relational data), Local File System (for multipart image uploads).

**Testing**: JUnit + Mockito (Backend core services).

**Target Platform**: Web browsers (Frontend), Linux/Windows server (Backend).

**Project Type**: Web application (Backend REST API + Frontend SPA).

**Constraints**: Passwords encrypted via BCrypt, JWT secrets in environment variables, Strict role-based access control (USER, SELLER, ADMIN).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Backend Architecture**: Layered (`controller` -> `service` -> `repository` -> `entity` -> `dto`). No business logic in controller. (PASS)
- **Security**: Spring Security + JWT, BCrypt, environment variables for secrets. (PASS)
- **Authorization**: USER, SELLER, ADMIN roles checked appropriately. (PASS)
- **Data Validation**: Bean Validation (`@Valid`) at DTO layer. (PASS)
- **Error Handling**: `@ControllerAdvice`, consistent JSON `{success, message, errorCode}`. (PASS)
- **Database**: MySQL, snake_case, strict foreign keys. (PASS)
- **API**: RESTful, `/api/v1` prefix, `{success, data, message}` wrapper, pagination. (PASS)
- **Frontend**: React (Vite) + React Router, axios instance, Context API. (PASS)
- **Testing**: JUnit + Mockito for core services. (PASS)
- **Language**: English for code, Vietnamese for UI/errors. (PASS)

## Project Structure

### Documentation (this feature)

```text
specs/001-core-features/
├── plan.md              # This file
├── data-model.md        # Entities and relationships
├── quickstart.md        # E2E validation guide
└── contracts/
    └── api.md           # REST API endpoints
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/batdongsan/
│   ├── controller/      (AuthController, ListingController, ProjectController, AdminController)
│   ├── service/         (interface + impl for domains)
│   ├── repository/      (Spring Data JPA repositories)
│   ├── entity/          (JPA Entities)
│   ├── dto/             (Request/Response records/classes)
│   ├── config/          (SecurityConfig, CorsConfig)
│   ├── security/        (JwtUtil, JwtAuthFilter)
│   └── exception/       (GlobalExceptionHandler)
└── src/test/java/com/batdongsan/
    └── service/         (Unit tests using JUnit + Mockito)

frontend/
├── src/
│   ├── components/      (Reusable UI components)
│   ├── pages/           (Home, Listings, Detail, Login, Admin, Dashboard, etc.)
│   ├── services/        (Axios instance, API call functions)
│   └── context/         (AuthContext for global state)
└── public/
```

**Structure Decision**: A standard monorepo containing `backend` (Maven/Spring Boot) and `frontend` (Vite/React) directories clearly separated.

## Complexity Tracking

No violations found. The architecture aligns perfectly with the constitution.
