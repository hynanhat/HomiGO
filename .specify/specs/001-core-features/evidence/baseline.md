# Baseline Evidence — T001

**Recorded**: 2026-08-12  
**Scope**: Backend repository before Week 1 migration work

## Environment

- OS/shell: Windows PowerShell
- Runtime available: Java 22.0.2
- Project target: Java 17
- Spring Boot: 4.1.0
- Maven Wrapper declared version: 3.3.4, Maven distribution 3.9.16
- System Maven available: 3.9.6
- Test database: H2 2.4.240, in-memory, profile `test`

## Test command and result

The repository command `mvnw.cmd test` was attempted first but the Windows Maven Wrapper failed before Maven startup:

```text
icm : Cannot index into a null array.
Cannot start maven from wrapper
```

The failure originates from wrapper script logic that indexes `(Get-Item $MAVEN_M2_PATH).Target[0]` when `Target` is null. To establish the code baseline without modifying Tuesday's scope, tests were run using installed Maven with an explicit writable local repository:

```powershell
mvn "-Dmaven.repo.local=C:\Users\huynh\.m2\repository" test
```

Result:

```text
BUILD SUCCESS
Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
Test: com.batdongsan.BackendApplicationTests.contextLoads
```

Surefire report: `backend/target/surefire-reports/com.batdongsan.BackendApplicationTests.txt`.

## What this proves

- All current main and test Java sources compile.
- The Spring context starts with the isolated H2 test profile.
- JPA discovers 8 repositories and creates the current schema.

## Known warnings and gaps

1. Only one smoke test exists; no AuthService, ListingService, controller, authorization or repository behavior is tested.
2. The test output warns that Mockito self-attaches a Java agent; future JDK releases may disallow this behavior.
3. Java 22 is used locally while the project targets Java 17; CI must test Java 17 explicitly.
4. Test startup is noisy because debug/SQL logging remains enabled through inherited configuration.
5. MySQL compatibility is not proven because the successful test uses H2.
6. `mvnw.cmd` is not reliable in this environment and should be regenerated or repaired before CI/onboarding.
7. Docker verification was not part of Monday's task and Docker is not currently available in this environment.

## Baseline verdict

**GREEN for compilation/context startup; RED for meaningful automated coverage and wrapper reproducibility.**
