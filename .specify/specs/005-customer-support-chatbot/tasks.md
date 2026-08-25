# Tasks: Customer Support Chatbot

**Input**: Design documents from `.specify/specs/005-customer-support-chatbot/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, quickstart.md

**Tests**: Required because the specification defines measurable matching, interaction, responsive, and accessibility outcomes.

**Organization**: Tasks are grouped by user story so each increment can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the feature module without adding dependencies or backend work.

- [x] T001 Create the support chatbot feature module entry files in `frontend/src/features/support-chatbot/chatbotKnowledge.ts` and `frontend/src/features/support-chatbot/SupportChatbot.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the shared typed topic/message contract and approved Vietnamese FAQ content used by all stories.

- [x] T002 Define `SupportTopic`, `ChatMessage`, five approved topics, greeting, and fallback content in `frontend/src/features/support-chatbot/chatbotKnowledge.ts`

**Checkpoint**: The curated content and types are available; story work can begin.

---

## Phase 3: User Story 1 - Nhận hỗ trợ nhanh từ mọi trang công khai (Priority: P1) 🎯 MVP

**Goal**: Customers can open a consistent widget, see the greeting and choose an approved suggestion for an immediate answer.

**Independent Test**: Render the widget in a router, open it, select every suggestion, verify the matching approved response/link, close it, and open it again.

### Tests for User Story 1

- [x] T003 [US1] Add failing launcher, open/close, greeting, suggestion, message-order, and known-link interaction tests in `frontend/src/features/support-chatbot/SupportChatbot.test.tsx`

### Implementation for User Story 1

- [x] T004 [US1] Implement launcher, non-modal panel, transcript, direct suggestion answers, and internal action links in `frontend/src/features/support-chatbot/SupportChatbot.tsx`
- [x] T005 [US1] Mount the chatbot once for customer-facing routes in `frontend/src/components/layout/PublicLayout.tsx`

**Checkpoint**: The suggestion-driven MVP is usable from the customer layout without login.

---

## Phase 4: User Story 2 - Đặt câu hỏi bằng nội dung tự nhập (Priority: P2)

**Goal**: Customers can type Vietnamese questions and receive a deterministic answer for supported topics.

**Independent Test**: Submit accented, unaccented, differently cased, and whitespace-heavy variants for all five topics and verify correct matching; verify empty input appends nothing.

### Tests for User Story 2

- [x] T006 [P] [US2] Add failing table-driven normalization, scoring, ambiguity, and five-topic matching tests in `frontend/src/features/support-chatbot/chatbotKnowledge.test.ts`
- [x] T007 [US2] Extend failing component tests for typed submission, Enter, empty input, 500-character limit, draft clearing, and multiple ordered turns in `frontend/src/features/support-chatbot/SupportChatbot.test.tsx`

### Implementation for User Story 2

- [x] T008 [US2] Implement Vietnamese normalization, conservative phrase scoring, and topic lookup in `frontend/src/features/support-chatbot/chatbotKnowledge.ts`
- [x] T009 [US2] Implement the labeled question form, validation, typed-message flow, and automatic transcript scrolling in `frontend/src/features/support-chatbot/SupportChatbot.tsx`

**Checkpoint**: Free-text questions for all supported topics work independently of suggestions.

---

## Phase 5: User Story 3 - Chuyển sang kênh hỗ trợ khi chatbot không hiểu (Priority: P3)

**Goal**: Unknown or ambiguous questions never receive guessed guidance and always expose the support email.

**Independent Test**: Submit unrelated and ambiguous content, verify the approved fallback appears, and confirm the email action points to `mailto:hotro@homigo.vn`.

### Tests for User Story 3

- [x] T010 [P] [US3] Add failing unknown/ambiguous matcher cases in `frontend/src/features/support-chatbot/chatbotKnowledge.test.ts`
- [x] T011 [US3] Add failing fallback text and email-link interaction tests in `frontend/src/features/support-chatbot/SupportChatbot.test.tsx`

### Implementation for User Story 3

- [x] T012 [US3] Wire deterministic fallback messages and the support email action in `frontend/src/features/support-chatbot/SupportChatbot.tsx`

**Checkpoint**: All recognized and unrecognized paths are independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete responsive, keyboard, assistive-technology, and release validation across all stories.

- [x] T013 [P] Add dialog/log semantics, focus transfer/return, Escape handling, and automated axe assertions in `frontend/src/features/support-chatbot/SupportChatbot.test.tsx`
- [x] T014 Style the floating widget, message log, suggestions, and 320px responsive behavior in `frontend/src/styles/components.css` and `frontend/src/styles/responsive.css`
- [x] T015 Change the document minimum width from 360px to 320px in `frontend/src/styles/globals.css`
- [x] T016 Run the targeted tests, full frontend tests, lint, production build, and manual checks documented in `.specify/specs/005-customer-support-chatbot/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Depends on T001 and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on T002 and delivers the suggestion-based MVP.
- **User Story 2 (Phase 4)**: Depends on the US1 panel shell and extends it with typed questions.
- **User Story 3 (Phase 5)**: Depends on the US2 matcher and adds its safe no-match outcome.
- **Polish (Phase 6)**: Depends on all desired user stories.

### User Story Dependencies

```text
Setup → Foundation → US1 (MVP) → US2 → US3 → Polish
```

- **US1** is independently demonstrable with direct topic selection.
- **US2** reuses the US1 transcript but its matching logic is independently unit-testable.
- **US3** reuses the US2 no-match result but its fallback contract is independently testable.

### Parallel Opportunities

- T006 can be written in parallel with T007 because it targets a separate test file.
- T010 can be written in parallel with T011 after the matcher contract exists.
- T013 can be prepared in parallel with responsive styling once the widget shell is stable.

## Parallel Example: User Story 2

```text
Task T006: Add pure matcher tests in chatbotKnowledge.test.ts
Task T007: Add typed interaction tests in SupportChatbot.test.tsx
```

## Implementation Strategy

### MVP First

1. Complete T001–T002 for the shared typed content.
2. Complete T003–T005 for User Story 1.
3. Stop and validate the suggestion-driven widget independently.

### Incremental Delivery

1. Add typed matching through T006–T009 and rerun US1 tests.
2. Add safe fallback through T010–T012 and rerun US1/US2 tests.
3. Complete accessibility, responsive, and release validation through T013–T016.

## Notes

- All source identifiers are English; all customer-visible content is Vietnamese.
- Tests are written before their corresponding implementation task.
- No backend, database, API, environment variable, or new package is required.
