# User Story 2 Validation Evidence

**Validated**: 2026-08-14  
**Scope**: T019–T029, identity, profile, seller upgrade and revocable sessions

## Delivered behavior

- Registration normalizes email to lowercase, hashes passwords with BCrypt and assigns the `USER` role.
- Login rejects unknown credentials and banned users before issuing an access/refresh token pair.
- Access tokens default to 15 minutes; refresh tokens default to 7 days and can be overridden by environment variables.
- Only a SHA-256 hash of each refresh token is stored; raw tokens are returned once to the client.
- Refresh rotates the token and revokes the previous value in the same transaction.
- Logout revokes the current refresh token; password changes revoke every active refresh token for the user.
- Authenticated users can view/update their own profile and upgrade from `USER` to `SELLER` without admin approval.
- A `USER` receives HTTP 403 when attempting to create a listing before upgrading.
- Banned or deleted token subjects are not authenticated by the JWT filter.
- OpenAPI documents refresh, logout, profile and seller-upgrade endpoints.

## Automated verification

Command:

```powershell
cd backend
.\mvnw.cmd verify
```

Result:

```text
BUILD SUCCESS
Tests run: 23, Failures: 0, Errors: 0, Skipped: 0
```

Coverage by suite:

| Suite | Tests | Result |
|---|---:|---|
| `AuthServiceTest` | 9 | PASS |
| `UserControllerIntegrationTest` | 5 | PASS |
| `UserSessionFlowIntegrationTest` | 1 | PASS |
| `SecurityIntegrationTest` | 7 | PASS |
| `BackendApplicationTests` | 1 | PASS |

The automated US2 flow performs registration, login, profile read/update, USER-to-SELLER upgrade, refresh rotation, logout and failed reuse of revoked tokens.

## MySQL migration and API validation

The packaged application was started against a dedicated empty database on local MySQL. Flyway and Hibernate validation completed before the real HTTP flow was executed.

Flyway history:

| Rank | Version | Description | Success |
|---:|---:|---|---:|
| 1 | 1 | baseline schema | 1 |
| 2 | 2 | core constraints indexes | 1 |
| 3 | 3 | refresh tokens | 1 |

Refresh-token storage after login, rotation and logout:

```text
token_count       = 2
min_hash_length   = 64
max_hash_length   = 64
revoked_count     = 2
```

Real HTTP flow result:

```text
registered role              = USER
profile email                = phase3.flow@homigo.test
updated phone                = 0912345678
upgraded role                = SELLER
reuse rotated old token      = HTTP 400
logout                       = HTTP 200
reuse logged-out token       = HTTP 400
```

The dedicated validation database was dropped and validation ports/processes were stopped afterward. The existing `homigo` database was not modified.

## Phase 3 checkpoint

- [x] AuthService unit suite passes.
- [x] Profile read/update works for the authenticated user.
- [x] USER upgrades to SELLER without admin approval.
- [x] USER cannot create a listing before upgrading.
- [x] Refresh rotation and logout revocation are demonstrable.
- [x] Revoked refresh tokens cannot be reused.
- [x] V3 migrates successfully on empty MySQL and Hibernate validates it.

**Verdict: PASS. Phase 3 is complete.**
