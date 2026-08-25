# UI Contract: Customer Support Chatbot

## Mounting and visibility

- The widget is mounted once inside the customer-facing public layout.
- The closed state exposes a fixed launcher named `Mở hỗ trợ khách hàng` with `aria-expanded="false"`.
- Activating the launcher opens a panel named `Hỗ trợ khách hàng`, changes `aria-expanded` to `true`, and moves focus to the question input.
- Activating the close control or pressing Escape closes the panel and returns focus to the launcher.
- The administrator layout does not render the widget.

## Initial content

On first open, the conversation contains a Vietnamese greeting and these suggestions:

- `Tìm bất động sản`
- `Đăng tin như thế nào?`
- `Quản lý tài khoản`
- `Lưu tin yêu thích`
- `Nâng cấp người bán`

## Message submission

- Whitespace around typed content is removed.
- Empty content appends nothing and produces `Vui lòng nhập câu hỏi.`
- The input accepts at most 500 characters.
- A valid submission appends the customer message followed by exactly one chatbot response.
- The draft and validation error clear after valid submission.
- New responses are exposed through a polite live region; the entire transcript is not repeatedly announced.

## Known-topic response

| Topic | Internal destination |
|-------|----------------------|
| Search listings | `/listings` |
| Create listing | `/seller/listings/new` |
| Account management | `/account/profile` |
| Saved listings | `/saved-listings` |
| Seller upgrade | `/seller/upgrade` |

## Unknown-topic response

For an unrecognized question, the chatbot states that it cannot answer yet and exposes `Gửi email hỗ trợ` pointing to `mailto:hotro@homigo.vn`.

## Responsive and accessibility behavior

- The panel remains fully operable at viewport widths of 320px, 768px, and 1440px.
- Messages wrap long words, and the transcript scrolls without moving the header or composer out of reach.
- Controls have visible keyboard focus, text labels or accessible names, and primary touch targets of at least 44px.
- Decorative icons are hidden from assistive technology.
- The widget does not use a modal backdrop or prevent customers from continuing to use the page.
- Reduced-motion and forced-colors preferences retain usable state and focus indicators.
