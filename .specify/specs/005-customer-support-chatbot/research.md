# Research: Customer Support Chatbot

## Decision 1: Use a curated client-side FAQ knowledge base

**Decision**: Represent the first version as a small typed list of approved support topics and deterministic responses that runs entirely in the browser. Suggestion buttons resolve directly by topic identifier; only free-text questions use matching.

**Rationale**: The supported HomiGO workflows are known. Curated answers prevent hallucinations while avoiding cost, latency, secret management, and privacy concerns. Direct suggestion lookup guarantees approved suggestions always return their intended answers.

**Alternatives considered**:

- External generative AI: rejected for the MVP because it adds credentials, unpredictable answers, cost, moderation, and network failure modes.
- Backend rule engine: rejected because the initial knowledge base is small and no conversation data needs to be shared or stored.
- Live-agent handoff: deferred because it requires staffing, presence state, queueing, and durable conversation storage.

## Decision 2: Normalize Vietnamese input before conservative scoring

**Decision**: Lowercase using the Vietnamese locale, trim, normalize Unicode, remove combining marks, convert `đ` to `d`, replace punctuation with spaces, and collapse whitespace before matching. Score curated whole phrases/tokens, favor multi-word phrases, and fall back when no unique topic reaches the confidence threshold.

**Rationale**: Customers commonly mix accented and unaccented Vietnamese. Normalization handles those variants without a natural-language dependency, while a conservative deterministic threshold avoids guesses on broad or ambiguous words.

**Alternatives considered**:

- Exact string matching: too brittle for conversational phrasing.
- Raw substring matching: prone to false positives inside unrelated words.
- Fuzzy-search dependency: unnecessary runtime weight for five topics and may confidently guess wrong.

## Decision 3: Use a non-modal floating dialog

**Decision**: The launcher toggles a fixed-position panel with dialog semantics, accessible labels, Escape-to-close, focus transfer on open and focus return on close. The transcript uses `role="log"` with polite announcement behavior. The page remains operable while the panel is open and focus is not trapped.

**Rationale**: Customer support should be available without forcing users out of their current task. Explicit focus behavior and semantic announcements make the custom widget usable by keyboard and assistive technology.

**Alternatives considered**:

- Full modal: rejected because it blocks page context and is too disruptive for optional help.
- Separate support page: rejected because it removes the contextual quick-access benefit.
- Generic popover markup: rejected because it lacks the semantic contract expected by assistive technology.

## Decision 4: Keep session state ephemeral

**Decision**: Store open state, draft text, validation state, and messages only in React component state. Reset everything on page reload.

**Rationale**: This satisfies the privacy and scope boundaries and avoids treating support text as durable customer data.

**Alternatives considered**:

- Local or session storage: rejected because persistence is explicitly out of scope.
- Database persistence: rejected because there is no support-agent inbox or analytics requirement.

## Decision 5: Mount once in the public layout

**Decision**: Add the widget to `PublicLayout`. This layout contains all non-admin customer routes, so the widget is consistently available to visitors and signed-in customers but not the separate administrator workspace.

**Rationale**: One mount point avoids duplicated state and page-by-page wiring and follows the existing routing composition.

**Alternatives considered**:

- Add to each page: rejected due to duplication and inconsistent availability.
- Add above the entire router: rejected because the widget would appear in the administrator workspace.

## Decision 6: Align the global minimum viewport with the feature requirement

**Decision**: Change the existing document minimum width from 360px to 320px and add explicit narrow-screen widget rules and tests.

**Rationale**: The specification requires operation at 320px, while the current global styles force 360px and would create horizontal overflow before widget styles are evaluated.

**Alternatives considered**:

- Keep the 360px global minimum: rejected because it cannot satisfy or verify the stated acceptance boundary.
- Override minimum width only inside the widget: insufficient because the document itself would still overflow.
