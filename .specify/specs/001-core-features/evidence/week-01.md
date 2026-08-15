# Week 1 Validation Evidence

**Validated**: 2026-08-14  
**Scope**: T003–T009, foundation migrations and API documentation

## Configuration delivered

- Spring Boot Flyway starter and Flyway MySQL module are declared in `backend/pom.xml`.
- Springdoc OpenAPI 3.0.3 is declared for Spring Boot 4 compatibility.
- Common JPA mode is `ddl-auto: validate`; Hibernate no longer mutates dev/prod schemas.
- Test profile explicitly uses `create-drop` and disables Flyway for the fast H2 smoke test.
- Production profile requires database/JWT secrets from environment variables and disables OpenAPI by default.
- Swagger/OpenAPI endpoints are public in security configuration for development usage.

## Automated test result

Command:

```powershell
mvn "-Dmaven.repo.local=C:\Users\huynh\.m2\repository" test
```

Result:

```text
BUILD SUCCESS
Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
```

The Maven Wrapper issue recorded in `baseline.md` remains separate from application correctness.

## MySQL migration validation

A dedicated empty validation database was created on local MySQL 8.0.46. The application was started with the dev profile, allowing Flyway to migrate before Hibernate validation.

Flyway history:

| Rank | Version | Description | Success |
|---:|---:|---|---:|
| 1 | 1 | baseline schema | 1 |
| 2 | 2 | core constraints indexes | 1 |

Created application tables:

- `users`
- `provinces`
- `districts`
- `categories`
- `projects`
- `listings`
- `listing_images`
- `saved_listings`
- `flyway_schema_history`

V2 produced 12 named `idx_*` indexes. After migration, Hibernate schema validation passed and the application reached `Started BackendApplication`.

The dedicated validation database was removed after verification. No existing project database was modified.

## OpenAPI validation

While connected to the migrated MySQL schema:

```text
GET /v3/api-docs       -> HTTP 200
title                  -> HomiGO Backend API
version                -> v1
documented paths       -> 16
GET /swagger-ui.html   -> HTTP 200
```

The Springdoc version was chosen using its Spring Boot 4 compatibility guidance. Production disables both endpoints unless `OPENAPI_ENABLED=true`.

## Issues discovered and resolved

1. `flyway-core` plus `flyway-mysql` alone did not activate Flyway auto-configuration in modular Spring Boot 4.
2. It was replaced with `spring-boot-starter-flyway` plus `flyway-mysql`; migrations then ran before JPA validation.
3. The first isolated MySQL validation attempt had Windows process argument/log redirection problems. Final verification used the existing local MySQL service and a dedicated temporary database.

## Week 1 checkpoint

- [x] Tests pass.
- [x] Empty MySQL schema is created entirely by Flyway.
- [x] Hibernate validates the migrated schema.
- [x] OpenAPI JSON and Swagger UI load.
- [x] Production configuration does not contain database/JWT secret values.

**Verdict: PASS. Phase 1 is complete.**
