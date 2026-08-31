# Feature 007 Baseline

**Captured**: 2026-08-30

## Current schema and runtime

- Flyway migrations: V1 through V9; V9 is `V9__ai_description_quota.sql`.
- Backend: Java 17, Spring Boot 4.1, MySQL/Flyway, JUnit/Mockito/Testcontainers.
- Frontend: React 19, TypeScript 6, Vite 8, React Query, React Hook Form/Zod, Vitest/RTL/MSW/Playwright.
- Deployment: `docker-compose.yml` with backend, frontend, and MySQL services.
- Legacy address model: `provinces → districts → wards`; `listings` and `projects` currently require `district_id` and may reference `ward_id`.

## Validation commands

```powershell
cd backend
.\mvnw.cmd test
```

```powershell
cd frontend
npm run format:check
npm run lint
npm run test
npm run build
```

```powershell
docker compose config
docker compose up -d --build
docker compose ps
```

## Working-tree ownership boundary

The following changes existed before feature implementation and must not be overwritten unless the feature directly requires the same file:

- screenshots and `home-mobile-320.png` under `.specify/specs/002-modern-business-frontend/evidence/screenshots/`;
- `frontend/index.html`;
- `README.md`;
- `frontend/Dockerfile`, whose intentional healthcheck fix uses `127.0.0.1` instead of `localhost`;
- `.specify/feature.json`, which selects feature 007.

Feature 007 documentation under `.specify/specs/007-two-level-addresses/` is intentional work from the planning workflow.
