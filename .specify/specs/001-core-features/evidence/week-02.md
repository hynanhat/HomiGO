# Week 2 Validation Evidence

**Validated**: 2026-08-14  
**Scope**: T010–T018, foundational quality and security

## Dependency injection

- Replaced field injection with explicit constructor injection in security configuration, JWT components, services and controllers.
- Source scan result: no remaining `@Autowired` field injection under `backend/src/main/java/com/batdongsan`.
- Dependencies are immutable (`final`) and classes can be instantiated directly in tests.

## Error handling and validation

- Added centralized `ErrorCode` values for bad requests, validation, authentication, authorization, missing resources, upload limits and server failures.
- Authentication failures return HTTP 401 with `UNAUTHORIZED`; authorization failures return HTTP 403 with `ACCESS_DENIED`.
- Unexpected exceptions are logged server-side with their stack trace, while clients receive only a fixed Vietnamese message and `INTERNAL_SERVER_ERROR`.
- Added `PageReq` Bean Validation for `page >= 0` and `1 <= size <= 100`.
- Added DTO validation for listing transaction type, IDs, prices and areas.
- Source scan found no mojibake markers in backend Java sources and no remaining English user-facing validation/service messages.

## Security integration coverage

`SecurityIntegrationTest` contains seven passing scenarios:

1. Anonymous access to the public listing route.
2. Anonymous denial on an authenticated route with the standard 401 response.
3. Invalid bearer-token denial.
4. Authenticated USER access to a protected route.
5. USER denial on an ADMIN route with the standard 403 response.
6. ADMIN authorization on an ADMIN route.
7. Invalid pagination response using the standard validation format and Vietnamese UTF-8 message.

## Verification result

Command:

```powershell
cd backend
.\mvnw.cmd verify
```

Result:

```text
BUILD SUCCESS
Tests run: 8, Failures: 0, Errors: 0, Skipped: 0
```

The verification used the isolated H2 test profile with Flyway disabled. It did not require or modify the local MySQL database.

Non-blocking warnings remain for Spring Data `PageImpl` response serialization and Mockito's future JDK agent-loading behavior. Neither warning failed the build; stable pagination response design remains scheduled for later API tasks.

## Week 2 checkpoint

- [x] Error responses are consistent.
- [x] Internal exception details are not exposed to clients.
- [x] Secrets remain externalized.
- [x] Public, authenticated and admin access rules are tested.
- [x] No mojibake remains in backend Java source.
- [x] Maven Wrapper verification passes.

**Verdict: PASS. Phase 2 is complete.**
