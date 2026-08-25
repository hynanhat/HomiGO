# UI Contract: AI Description Assistant

## Placement and eligibility

- Render inside shared `ListingForm` on both create and edit pages, close to the description field.
- Only seller routes can reach the feature; unavailable/disabled AI never blocks normal description entry or listing submission.
- Load quota when the form is opened. A quota-read failure shows a compact unavailable state without clearing form data.

## States

| State | Required UI behavior |
|---|---|
| Ready | Keywords input, “Tạo mô tả bằng AI”, `x/5 lượt còn lại`, reset time |
| Invalid form | Generate disabled or validation messages for keywords/category/district/price/area |
| Generating | Button disabled, progress/status announced with `aria-live`; prevent duplicate click |
| Preview | Separate readonly preview, character count, Apply/Cancel/Regenerate actions |
| Exhausted | Generate/regenerate disabled; show reset time; textarea remains editable |
| Temporary failure | Safe retry message; keep keywords, current description and all form values |
| Feature disabled | Compact unavailable hint or hide assistant; manual textarea unchanged |

## Interaction rules

1. Generate collects the latest form values and keywords; it never submits or saves the listing.
2. Returned draft is stored separately from `description`.
3. “Dùng mô tả này” copies preview into `description`, closes preview and leaves the textarea editable.
4. “Hủy” discards preview only; original/current description stays byte-for-byte unchanged.
5. “Tạo lại” explicitly warns that another successful result uses another daily attempt, then requests a new draft from current form data.
6. Changing form data does not mutate an existing preview; show a “dữ liệu đã thay đổi” hint and require regenerate for synchronization.
7. Navigation or form submit while generating may cancel the client request, but the server lease/finalization remains authoritative.

## Accessibility and responsive behavior

- All actions use real buttons with descriptive Vietnamese accessible names.
- Preview has a heading and `aria-live="polite"` status; failures use `role="alert"` without stealing focus unnecessarily.
- Keyboard focus moves to the preview heading after success and to the first validation issue for invalid input.
- Actions wrap on narrow screens; preview text is selectable and readable without horizontal scrolling.
- Loading is not communicated by color alone; quota state includes text, not only icons.

## Acceptance checks

- Existing description survives generate, cancel, provider failure and timeout.
- Apply is the only assistant action that changes `description`.
- Regenerate refreshes quota from response and never double-submits from repeated clicks.
- The create and edit pages exhibit identical behavior because both use the shared component.
- Manual editing and listing save remain possible at every AI unavailable state.
