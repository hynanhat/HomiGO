# Quickstart: Validate Customer Support Chatbot

## Prerequisites

- Node.js supported by the existing frontend toolchain
- Frontend dependencies installed with `npm ci`

## Automated validation

From `frontend/` run:

```powershell
npm run test -- src/features/support-chatbot
npm run lint
npm run build
```

Expected outcomes:

- Matcher tests cover accented/unaccented text, capitalization, known topics, ambiguity, and fallback behavior.
- Component tests cover opening, suggestions, typed questions, empty input, email fallback, Escape-to-close, focus return, and accessibility.
- Lint and production build finish without new warnings or type errors.

## Manual validation

Start the frontend:

```powershell
npm run dev
```

Open a customer-facing HomiGO page and validate the [UI contract](contracts/ui.md):

1. Confirm the support launcher is visible and does not obscure primary navigation.
2. Open the widget and confirm focus moves to the input.
3. Select each suggestion and confirm its approved response and destination link.
4. Type `toi muon dang tin` and confirm the listing-creation answer appears.
5. Type an unrelated question and confirm the fallback plus `hotro@homigo.vn` appears.
6. Submit whitespace only and confirm no message is appended.
7. Press Escape and confirm the panel closes and focus returns to the launcher.
8. Repeat at 320px, 768px, and 1440px with keyboard-only navigation.

## Privacy check

Reload the page and confirm previous messages are gone. Inspect browser storage and the network panel while chatting; the widget must not add stored conversation data or chatbot network requests.
