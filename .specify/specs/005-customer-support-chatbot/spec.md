# Feature Specification: Chatbot hỗ trợ khách hàng

**Feature Branch**: `[005-customer-support-chatbot]`  
**Created**: 2026-08-24  
**Status**: Draft  
**Input**: User description: "Tôi muốn làm phần chatbot hỗ trợ khách hàng đơn giản"

## User Scenarios & Testing

### User Story 1 - Nhận hỗ trợ nhanh từ mọi trang công khai (Priority: P1)

Khách truy cập có thể mở cửa sổ chat từ mọi trang công khai, xem lời chào và chọn một câu hỏi phổ biến để nhận câu trả lời ngắn gọn bằng tiếng Việt mà không cần đăng nhập.

**Why this priority**: Đây là giá trị cốt lõi của phiên bản đầu tiên: giúp khách tự tìm câu trả lời ngay tại nơi họ đang sử dụng website.

**Independent Test**: Mở một trang công khai, mở chatbot, chọn từng câu hỏi gợi ý và xác nhận câu trả lời tương ứng xuất hiện trong cuộc hội thoại.

**Acceptance Scenarios**:

1. **Given** khách đang ở bất kỳ trang công khai nào, **When** khách chọn nút hỗ trợ, **Then** cửa sổ chat mở và hiển thị lời chào cùng các câu hỏi gợi ý.
2. **Given** cửa sổ chat đang mở, **When** khách chọn một câu hỏi gợi ý, **Then** câu hỏi và câu trả lời phù hợp xuất hiện theo đúng thứ tự trong cuộc hội thoại.
3. **Given** khách đóng cửa sổ chat, **When** khách tiếp tục sử dụng trang, **Then** nội dung chính vẫn hoạt động bình thường và nút hỗ trợ vẫn có thể được mở lại.

---

### User Story 2 - Đặt câu hỏi bằng nội dung tự nhập (Priority: P2)

Khách có thể nhập câu hỏi bằng tiếng Việt. Chatbot nhận diện các chủ đề hỗ trợ phổ biến như tìm kiếm bất động sản, đăng tin, tài khoản, tin yêu thích và nâng cấp người bán để trả lời phù hợp.

**Why this priority**: Nhập câu hỏi tự do tạo cảm giác hội thoại tự nhiên hơn và giúp khách không bị giới hạn ở các nút gợi ý.

**Independent Test**: Nhập các cách diễn đạt khác nhau cho từng chủ đề đã hỗ trợ và xác nhận chatbot trả lời đúng nhóm nội dung.

**Acceptance Scenarios**:

1. **Given** cửa sổ chat đang mở, **When** khách gửi câu hỏi có nội dung thuộc một chủ đề được hỗ trợ, **Then** chatbot trả lời bằng hướng dẫn liên quan và đường dẫn phù hợp nếu có.
2. **Given** ô nhập đang trống hoặc chỉ có khoảng trắng, **When** khách cố gửi, **Then** hệ thống không thêm tin nhắn rỗng vào cuộc hội thoại.
3. **Given** khách vừa gửi câu hỏi hợp lệ, **When** câu trả lời được hiển thị, **Then** ô nhập được làm trống và vẫn sẵn sàng cho câu hỏi tiếp theo.

---

### User Story 3 - Chuyển sang kênh hỗ trợ khi chatbot không hiểu (Priority: P3)

Khi câu hỏi nằm ngoài các chủ đề đã hỗ trợ, chatbot thông báo rõ giới hạn và cung cấp cách liên hệ với bộ phận hỗ trợ thay vì đưa ra câu trả lời không chắc chắn.

**Why this priority**: Cơ chế dự phòng giúp tránh thông tin sai và bảo đảm khách luôn có bước tiếp theo.

**Independent Test**: Gửi một câu hỏi ngoài phạm vi và xác nhận chatbot hiển thị thông báo không hiểu cùng địa chỉ liên hệ hỗ trợ.

**Acceptance Scenarios**:

1. **Given** khách gửi câu hỏi không khớp chủ đề được hỗ trợ, **When** chatbot xử lý câu hỏi, **Then** chatbot nói rõ chưa thể trả lời và hiển thị email hỗ trợ.
2. **Given** chatbot hiển thị thông tin liên hệ, **When** khách chọn địa chỉ email, **Then** thiết bị mở luồng soạn email đến đúng địa chỉ hỗ trợ.

### Edge Cases

- Câu hỏi có chữ hoa, chữ thường, dấu câu hoặc khoảng trắng thừa vẫn được đối chiếu theo nội dung chính.
- Câu hỏi không dấu có từ khóa quen thuộc vẫn nhận được câu trả lời phù hợp khi có thể nhận diện chắc chắn.
- Nội dung quá dài không làm vỡ bố cục; hệ thống giới hạn độ dài câu hỏi và thông báo rõ cho khách.
- Khách gửi nhiều câu liên tiếp không làm sai thứ tự hội thoại hoặc khóa giao diện.
- Cửa sổ chat phải sử dụng được bằng bàn phím và không che khuất hoàn toàn nội dung trên màn hình nhỏ.
- Việc tải lại trang bắt đầu một phiên chat mới; phiên bản đầu không lưu lịch sử hoặc dữ liệu cá nhân.

## Requirements

### Functional Requirements

- **FR-001**: Hệ thống MUST hiển thị một nút mở hỗ trợ dễ nhận biết trên mọi trang công khai.
- **FR-002**: Hệ thống MUST cho phép mở và đóng cửa sổ chat mà không làm gián đoạn thao tác trên trang hiện tại.
- **FR-003**: Khi mở lần đầu trong một lượt truy cập, chatbot MUST hiển thị lời chào và tối thiểu bốn câu hỏi gợi ý thuộc các chủ đề chính của HomiGO.
- **FR-004**: Khách MUST có thể gửi câu hỏi bằng cách chọn gợi ý hoặc nhập nội dung bằng bàn phím.
- **FR-005**: Hệ thống MUST từ chối tin nhắn rỗng và giới hạn mỗi câu hỏi tối đa 500 ký tự.
- **FR-006**: Chatbot MUST hỗ trợ tối thiểu các chủ đề: tìm kiếm bất động sản, đăng tin, quản lý tài khoản, lưu tin yêu thích và nâng cấp thành người bán.
- **FR-007**: Mỗi câu trả lời thuộc phạm vi MUST cung cấp hướng dẫn ngắn gọn, chính xác và có đường dẫn đến chức năng liên quan khi chức năng đó tồn tại.
- **FR-008**: Câu hỏi MUST được đối chiếu không phân biệt chữ hoa, chữ thường và khoảng trắng thừa.
- **FR-009**: Với câu hỏi ngoài phạm vi, chatbot MUST thông báo rằng chưa hiểu và cung cấp địa chỉ `hotro@homigo.vn` để khách liên hệ.
- **FR-010**: Chatbot MUST NOT tự nhận là nhân viên hỗ trợ trực tiếp hoặc tạo ra thông tin không nằm trong bộ nội dung đã được duyệt.
- **FR-011**: Phiên bản đầu MUST NOT yêu cầu đăng nhập, thu thập dữ liệu cá nhân hoặc lưu lịch sử trò chuyện sau khi tải lại trang.
- **FR-012**: Toàn bộ nhãn, lời chào, thông báo lỗi và câu trả lời hiển thị cho khách MUST bằng tiếng Việt.
- **FR-013**: Khách MUST có thể sử dụng toàn bộ thao tác chat bằng bàn phím; trạng thái mở/đóng và tin nhắn mới phải được thông báo cho công nghệ hỗ trợ.
- **FR-014**: Cửa sổ chat MUST hiển thị và thao tác được ở chiều rộng màn hình từ 320 pixel trở lên mà không che mất nút đóng hoặc ô nhập.
- **FR-015**: Chatbot MUST cho phép khách tiếp tục đặt nhiều câu hỏi trong cùng một lượt truy cập và giữ đúng thứ tự các tin nhắn.

### Key Entities

- **Support Topic**: Một chủ đề hỗ trợ đã được duyệt, gồm tên chủ đề, các cách diễn đạt có thể nhận diện, câu trả lời và đường dẫn liên quan tùy chọn.
- **Chat Message**: Một lượt nội dung trong phiên hiện tại, gồm người gửi, nội dung và thứ tự xuất hiện; không được lưu sau khi tải lại trang.
- **Chat Session**: Cuộc hội thoại tạm thời trong một lượt truy cập, gồm trạng thái mở/đóng và danh sách tin nhắn hiện tại.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% câu hỏi gợi ý trả về đúng câu trả lời và đường dẫn đã được duyệt trong kiểm thử chấp nhận.
- **SC-002**: Ít nhất 90% cách diễn đạt mẫu cho năm chủ đề hỗ trợ được phân loại đúng ngay lần đầu.
- **SC-003**: Khách có thể mở chatbot và nhận câu trả lời cho một câu hỏi gợi ý trong không quá 3 thao tác và dưới 30 giây.
- **SC-004**: 100% câu hỏi ngoài phạm vi trong bộ kiểm thử nhận được thông báo dự phòng và thông tin liên hệ, không nhận câu trả lời bịa đặt.
- **SC-005**: Chatbot hoàn thành kiểm thử sử dụng bằng bàn phím và hiển thị đúng ở các chiều rộng 320, 768 và 1440 pixel.
- **SC-006**: Chatbot không làm cản trở việc điều hướng hoặc hoàn thành các tác vụ hiện có trên trang khi đang đóng.

## Assumptions

- Phiên bản đầu là chatbot dựa trên bộ câu hỏi và từ khóa được duyệt sẵn, chưa sử dụng mô hình AI sinh nội dung hoặc dịch vụ bên ngoài.
- Chatbot phục vụ khách truy cập trên các trang công khai; các quy trình hỗ trợ nội bộ cho người bán và quản trị viên nằm ngoài phạm vi.
- Nội dung hỗ trợ được cung cấp bằng tiếng Việt và trỏ đến các trang HomiGO hiện có.
- Email `hotro@homigo.vn` là kênh chuyển tiếp mặc định khi chatbot không xử lý được câu hỏi.
- Lịch sử trò chuyện, hồ sơ khách hàng, bàn giao cho nhân viên trực tuyến, tệp đính kèm và phân tích hội thoại nằm ngoài phạm vi phiên bản đầu.
