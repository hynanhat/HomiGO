<!--
Sync Impact Report:
- Version change: [CONSTITUTION_VERSION] -> 1.0.0
- Modified principles: Replaced template principles with 10 mandatory HomiGO project principles.
- Added sections: None.
- Removed sections: Placeholder sections 2 and 3 removed as all principles fit under Core Principles.
- Follow-up TODOs: None.
-->
# HomiGO Constitution

## Core Principles

### I. Backend Architecture
Java Spring Boot must be used with a strict layer organization: controller → service → repository → entity → dto. Business logic MUST NOT be written in the controller layer.

### II. Security
Spring Security with JWT is mandatory for authentication. Passwords MUST be encrypted using BCrypt; plain-text passwords are strictly forbidden. The JWT secret and any other sensitive information MUST be read from environment variables and never hard-coded in the source code.

### III. Authorization
The system uses 3 fixed roles: `USER`, `SELLER`, and `ADMIN`. Every endpoint that creates, updates, or deletes data MUST verify data ownership (user is the owner) or appropriate role permissions before execution.

### IV. Data Validation
Input data MUST be validated using Bean Validation annotations (e.g., `@Valid`, `@NotNull`, `@Size`) at the DTO layer. Manual validation scattered across the service layer is prohibited.

### V. Error Handling
Errors MUST be handled centrally using `@ControllerAdvice`. The API must consistently return a JSON error format of `{success: false, message: string, errorCode: string}`. Stack traces MUST NOT be exposed to the client.

### VI. Database Standards
MySQL is the mandatory database. All table and column names MUST use `snake_case`. All dependent tables MUST have explicit and clear foreign key constraints.

### VII. API Standards
APIs MUST follow RESTful standards and use the `/api/v1` prefix. All successful responses MUST be wrapped in a consistent format: `{success: true, data: any, message: string}`. Any API returning lists MUST support pagination.

### VIII. Frontend Architecture
The frontend MUST use React (via Vite) and React Router. API calls MUST be made through a shared, centralized `axios` instance. Login state management MUST be handled via the React Context API.

### IX. Testing
Core business services (e.g., AuthService, ListingService) MUST have at least one suite of Unit Tests implemented using JUnit and Mockito.

### X. Language Policy
All source code, including variable, function, and class names, MUST be written in English. However, all UI labels and error messages displayed to the end-user MUST be in Vietnamese.

## Governance

Amendments to this constitution require team consensus. All pull requests and code reviews must verify compliance with these mandatory principles. Any deviation requires a documented exception.

**Version**: 1.0.0 | **Ratified**: 2026-07-30 | **Last Amended**: 2026-07-30
