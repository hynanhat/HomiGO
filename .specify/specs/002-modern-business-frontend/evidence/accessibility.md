# Accessibility and Responsive Report

Ngày chạy: 2026-08-17

## Automated checks

| Suite | Viewport | Kết quả |
|---|---|---|
| Vitest + axe component checks | jsdom | 2/2 passed |
| Keyboard/focus/heading/label/error Playwright | 360, 768, 1440 | 3/3 passed |
| Horizontal overflow + responsive controls | 360, 768, 1440 | 3/3 passed |

Tổng lượt kiểm tra cuối: **8/8 passed**, không có violation nghiêm trọng được báo cáo.

## Nội dung đã xác minh

- Skip link đưa focus đến `#main-content`.
- Menu mobile và filter dialog mở bằng control có accessible name, đóng bằng Escape và trả focus đúng vị trí.
- Form control có label; lỗi validation được công bố với semantics phù hợp.
- Trang giữ hierarchy heading và landmark chính.
- `:focus-visible` rõ trên link, button và form control.
- Không tràn ngang tại 360 px, 768 px và 1440 px.
- CTA, navigation, card và footer không bị cắt trong ba screenshot đã duyệt.

## Hạn chế đã biết

Jsdom không cung cấp Canvas API mặc định nên axe unit suite in warning khi thử đo contrast qua canvas. Kiểm tra tương tác cuối đã được chạy thêm trong Chromium thật; toàn bộ browser accessibility suite pass.
