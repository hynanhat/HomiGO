# Frontend validation evidence

Validated on 2026-08-17 (Asia/Ho_Chi_Minh).

## Unit and component tests

Command: `npm test`

- Test files: **32 passed**
- Tests: **84 passed**
- Result: no failures.

The jsdom environment printed two expected `HTMLCanvasElement.getContext` capability notices from existing browser-only rendering code; they did not fail or skip any test.

## Static and production checks

- `npm run lint`: passed with no findings.
- `npm run build`: TypeScript and Vite production build passed; 2,059 modules transformed.

## Browser validation

Command: `playwright test --reporter=line`

- Deterministic browser scenarios: **36 passed**.
- Real-backend opt-in scenarios: **9 skipped** because their external demo credentials were not configured, as designed.
- Projects: Chromium at **360×800**, **768×1024** and **1440×1000**.
- The new advanced-insights suite contributed 9 passing checks covering private notification/read navigation, public view recording and explainable recommendations, seller statistics, accessible chart data and horizontal-overflow safety.
