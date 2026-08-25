# Implementation Plan: Customer Support Chatbot

**Branch**: `[005-customer-support-chatbot]` | **Date**: 2026-08-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `.specify/specs/005-customer-support-chatbot/spec.md`

## Summary

Add a lightweight Vietnamese FAQ chatbot to customer-facing routes. The widget runs entirely in the browser, matches normalized customer questions against a curated knowledge base, provides route-aware links for known topics, and falls back to the support email for unknown questions. No backend endpoint, persistence, authentication, external AI service, or new runtime dependency is introduced.

## Technical Context

**Language/Version**: TypeScript 6.0; React 19

**Primary Dependencies**: React Router 7, Lucide React, existing Tailwind CSS 4 design tokens

**Storage**: In-memory component state only; the conversation resets on reload

**Testing**: Vitest 4, React Testing Library, user-event, vitest-axe; existing production build and lint commands

**Target Platform**: Modern evergreen desktop and mobile browsers, minimum supported viewport width 320px

**Project Type**: Frontend slice within the existing full-stack web application

**Performance Goals**: Open/close and local answer selection feel immediate; matching completes synchronously for the small curated topic set

**Constraints**: Vietnamese UI; keyboard accessible; no personal-data collection; no persistence; no external network call; no generative responses; maximum user message length 500 characters

**Scale/Scope**: Five initial support topics, one fallback response, one floating widget mounted in the customer layout, unit/component/accessibility tests

## Constitution Check

*GATE: Passed before Phase 0 and re-checked after Phase 1 design.*

- **I. Backend Architecture — PASS / not affected**: This feature has no backend behavior.
- **II. Security — PASS**: No credentials, authentication changes, external calls, or untrusted HTML rendering are added.
- **III. Authorization — PASS / not affected**: The widget exposes only public help content and does not mutate protected data.
- **IV. Data Validation — PASS**: Client input is trimmed, rejected when empty, and limited to 500 characters; no server DTO is introduced.
- **V. Error Handling — PASS**: Unknown questions receive a deterministic Vietnamese fallback and support contact.
- **VI. Database Standards — PASS / not affected**: No persistence or migration is added.
- **VII. API Standards — PASS / not affected**: No API endpoint is added.
- **VIII. Frontend Architecture — PASS**: The widget is a React feature component, uses React Router links, and integrates through the existing public layout.
- **IX. Testing — PASS**: Matching logic and primary component flows receive unit, interaction, and accessibility coverage.
- **X. Language Policy — PASS**: Source identifiers are English; all customer-facing text is Vietnamese.

No constitutional exception is required.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/005-customer-support-chatbot/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/layout/
│   │   └── PublicLayout.tsx
│   ├── features/support-chatbot/
│   │   ├── chatbotKnowledge.ts
│   │   ├── chatbotKnowledge.test.ts
│   │   ├── SupportChatbot.tsx
│   │   └── SupportChatbot.test.tsx
│   └── styles/
│       ├── components.css
│       ├── responsive.css
│       └── globals.css
└── tests/
```

**Structure Decision**: Keep the existing feature-folder frontend organization. Place reusable matching logic and the widget together under `features/support-chatbot`, mount the widget once in `PublicLayout`, and adjust the existing global minimum viewport from 360px to the specified 320px.

## Complexity Tracking

No constitution violations or additional project layers are introduced.

## Post-Design Constitution Re-check

The completed research, in-memory data model, UI contract, and validation guide preserve all ten gates. The design adds no backend coupling, stored conversation data, authentication changes, unsafe HTML, secrets, or external AI behavior. Input is bounded, output is curated, identifiers remain English, and customer-facing content remains Vietnamese.
