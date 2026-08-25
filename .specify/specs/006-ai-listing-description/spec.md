# Feature Specification: AI Listing Description

**Feature Branch**: `[006-ai-listing-description]`

**Created**: 2026-08-24

**Status**: Approved

**Input**: User description: "Cho phép SELLER viết mô tả tin bất động sản bằng AI sử dụng Gemini, kết hợp từ khóa với dữ liệu form, giới hạn 5 lần thành công mỗi ngày, tạo bản xem trước dài 600–900 ký tự trước khi thay thế mô tả hiện tại."

## User Scenarios & Testing

### User Story 1 - Tạo bản nháp mô tả từ dữ liệu tin đăng (Priority: P1)

Một người bán đang tạo hoặc chỉnh sửa tin nhập các từ khóa nổi bật. Hệ thống kết hợp từ khóa với những thông tin bất động sản đã điền để tạo một bản mô tả tiếng Việt chính xác, chuyên nghiệp và dễ đọc.

**Why this priority**: Đây là giá trị chính của tính năng, giúp người bán hoàn thành mô tả nhanh hơn mà vẫn sử dụng đúng dữ liệu của tin.

**Independent Test**: Điền các trường bắt buộc và từ khóa, yêu cầu tạo mô tả, sau đó xác nhận bản nháp dài 600–900 ký tự phản ánh đúng dữ liệu đã nhập và không chứa thông tin không được cung cấp.

**Acceptance Scenarios**:

1. **Given** SELLER đã điền đủ danh mục, vị trí, giá, diện tích và từ khóa, **When** yêu cầu viết mô tả, **Then** hệ thống trả về một bản nháp tiếng Việt dài 600–900 ký tự dựa trên các dữ liệu đó.
2. **Given** form có các đặc điểm tùy chọn như phòng ngủ, hướng, nội thất hoặc pháp lý, **When** tạo mô tả, **Then** bản nháp sử dụng các đặc điểm có giá trị và không nhắc đến trường còn trống.
3. **Given** bản nháp được hiển thị, **When** SELLER chọn dùng bản nháp, **Then** nội dung mô tả trên form được thay thế và vẫn có thể chỉnh sửa trước khi lưu tin.

---

### User Story 2 - Kiểm soát và tạo lại nội dung (Priority: P2)

SELLER xem trước nội dung được tạo mà không làm mất mô tả đang có. Họ có thể chấp nhận, hủy hoặc yêu cầu tạo lại nếu muốn một cách diễn đạt khác.

**Why this priority**: Nội dung do AI tạo chỉ là gợi ý; người bán phải giữ quyền quyết định cuối cùng và không bị mất dữ liệu đang nhập.

**Independent Test**: Bắt đầu với một mô tả có sẵn, tạo bản nháp, hủy rồi tạo lại; xác nhận mô tả gốc không đổi cho đến khi chọn dùng một bản nháp.

**Acceptance Scenarios**:

1. **Given** form đã có mô tả, **When** AI trả về bản nháp, **Then** hệ thống hiển thị bản xem trước riêng và không tự ghi đè mô tả hiện tại.
2. **Given** một bản nháp đang được xem, **When** SELLER chọn hủy, **Then** mô tả hiện tại được giữ nguyên.
3. **Given** một bản nháp đang được xem, **When** SELLER chọn tạo lại, **Then** hệ thống tạo một bản nháp mới và tính đây là một lượt thành công mới nếu có kết quả.

---

### User Story 3 - Theo dõi giới hạn sử dụng hằng ngày (Priority: P3)

Mỗi SELLER có tối đa năm lần tạo mô tả thành công trong một ngày theo giờ Việt Nam. Giao diện cho biết số lượt còn lại và thời điểm giới hạn được làm mới.

**Why this priority**: Giới hạn bảo vệ chi phí và ngăn lạm dụng trong khi vẫn đủ cho quy trình tạo và chỉnh sửa tin thông thường.

**Independent Test**: Thực hiện năm lần tạo thành công bằng cùng một tài khoản rồi thử lần thứ sáu; xác nhận lần thứ sáu bị từ chối, tài khoản khác không bị ảnh hưởng và lượt được làm mới vào ngày kế tiếp.

**Acceptance Scenarios**:

1. **Given** SELLER còn lượt, **When** tạo mô tả thành công, **Then** số lượt còn lại giảm đúng một.
2. **Given** SELLER đã có năm lần thành công trong ngày, **When** yêu cầu lần thứ sáu, **Then** hệ thống từ chối trước khi tạo nội dung và cho biết thời điểm có thể sử dụng lại.
3. **Given** yêu cầu thất bại vì dữ liệu không hợp lệ, hết thời gian chờ hoặc dịch vụ tạo nội dung lỗi, **When** hệ thống trả lỗi, **Then** lượt sử dụng của SELLER không bị giảm.
4. **Given** nhiều yêu cầu đồng thời của cùng một SELLER, **When** tổng số lượt khả dụng không đủ, **Then** không quá năm yêu cầu trong ngày có thể hoàn thành thành công.

### Edge Cases

- Từ khóa rỗng, chỉ có khoảng trắng, quá dài hoặc chứa nội dung không phù hợp bị từ chối với hướng dẫn rõ ràng.
- Các trường bắt buộc của bất động sản chưa đầy đủ thì không cho tạo mô tả và không trừ lượt.
- Nội dung AI rỗng, quá ngắn, quá dài hoặc không đúng định dạng không được đưa vào form và không trừ lượt.
- Từ khóa cố gắng yêu cầu AI bỏ qua quy tắc hoặc bịa thêm thông tin vẫn chỉ được xử lý như dữ liệu mô tả.
- Thay đổi dữ liệu form sau khi tạo bản nháp không tự động sửa bản nháp cũ; SELLER phải tạo lại để đồng bộ nội dung.
- Hai tab gửi yêu cầu cùng lúc vẫn tuân thủ giới hạn tổng cộng năm lần thành công mỗi ngày.
- SELLER bị khóa, tài khoản USER hoặc ADMIN không được sử dụng chức năng dành cho người bán này.
- Dịch vụ tạo nội dung chậm, tạm thời quá tải hoặc không được cấu hình phải trả thông báo an toàn, không làm mất dữ liệu form.
- Ngày sử dụng được xác định theo múi giờ kinh doanh `Asia/Ho_Chi_Minh`, kể cả khi máy khách dùng múi giờ khác.

## Requirements

### Functional Requirements

- **FR-001**: Chỉ tài khoản có vai trò SELLER và đang hoạt động MUST được yêu cầu tạo mô tả bằng AI.
- **FR-002**: Tính năng MUST có mặt trên cả form tạo mới và form chỉnh sửa tin đăng.
- **FR-003**: SELLER MUST nhập từ khóa trước khi tạo mô tả; từ khóa sau khi loại bỏ khoảng trắng MUST dài từ 3 đến 500 ký tự.
- **FR-004**: Hệ thống MUST yêu cầu tối thiểu danh mục, quận/huyện, giá và diện tích hợp lệ trước khi tạo nội dung.
- **FR-005**: Hệ thống MUST kết hợp từ khóa với các trường đã điền gồm tiêu đề, danh mục, dự án, vị trí, địa chỉ, giá, diện tích, phòng ngủ, phòng tắm, số tầng, hướng, nội thất và pháp lý.
- **FR-006**: Hệ thống MUST NOT gửi tên liên hệ, số điện thoại liên hệ, tọa độ hoặc thông tin xác thực vào yêu cầu tạo nội dung.
- **FR-007**: Bản nháp MUST được viết bằng tiếng Việt, dài từ 600 đến 900 ký tự và trình bày thành 2–3 đoạn dễ đọc.
- **FR-008**: Bản nháp MUST chỉ sử dụng thông tin do SELLER cung cấp hoặc dữ liệu danh mục, dự án và vị trí đã được hệ thống xác nhận.
- **FR-009**: Bản nháp MUST NOT tự tạo tiện ích, khoảng cách, pháp lý, tiềm năng tăng giá, cam kết lợi nhuận hoặc thông tin liên hệ không có trong dữ liệu đầu vào.
- **FR-010**: Hệ thống MUST coi từ khóa của SELLER là dữ liệu đầu vào và MUST NOT cho phép nội dung đó thay đổi các quy tắc tạo mô tả.
- **FR-011**: Bản nháp MUST được hiển thị riêng để xem trước và MUST NOT tự ghi đè mô tả đang có.
- **FR-012**: SELLER MUST có thể dùng bản nháp, hủy hoặc yêu cầu tạo lại.
- **FR-013**: Sau khi dùng bản nháp, SELLER MUST có thể chỉnh sửa nội dung trước khi lưu hoặc gửi duyệt tin.
- **FR-014**: Mỗi SELLER MUST có tối đa năm lần tạo mô tả thành công trong một ngày kinh doanh.
- **FR-015**: Một lần tạo lại có kết quả thành công MUST được tính là một lượt mới.
- **FR-016**: Yêu cầu không hợp lệ, lỗi hệ thống, hết thời gian chờ hoặc lỗi từ dịch vụ tạo nội dung MUST NOT làm giảm lượt sử dụng.
- **FR-017**: Giới hạn hằng ngày MUST được thực thi an toàn khi có nhiều yêu cầu đồng thời và MUST tồn tại sau khi hệ thống khởi động lại.
- **FR-018**: Giao diện MUST hiển thị số lượt còn lại trên tổng số năm và thời điểm lượt được làm mới.
- **FR-019**: Khi hết lượt, hệ thống MUST từ chối yêu cầu trước khi tạo nội dung và hiển thị thông báo tiếng Việt có thời điểm sử dụng lại.
- **FR-020**: Hệ thống MUST giới hạn thời gian chờ, xử lý lỗi tạm thời có kiểm soát và không gửi nhiều lần ngoài dự kiến cho một thao tác của SELLER.
- **FR-021**: Khóa truy cập dịch vụ tạo nội dung MUST chỉ tồn tại ở môi trường máy chủ, không xuất hiện trong mã nguồn, log, phản hồi hoặc ứng dụng trình duyệt.
- **FR-022**: Tên mô hình tạo nội dung và trạng thái bật/tắt tính năng MUST có thể cấu hình mà không thay đổi mã nguồn.
- **FR-023**: Nếu dịch vụ chưa được cấu hình hoặc đang không khả dụng, SELLER MUST vẫn có thể nhập và lưu mô tả thủ công bình thường.
- **FR-024**: Mọi lỗi MUST sử dụng định dạng phản hồi nhất quán của HomiGO và không làm lộ dữ liệu kỹ thuật hoặc nội dung bí mật.

### Key Entities

- **AI Description Request**: Yêu cầu tạm thời gồm từ khóa, các thuộc tính bất động sản được phép sử dụng và danh tính SELLER; không bao gồm thông tin liên hệ hoặc thông tin xác thực.
- **AI Description Draft**: Nội dung tiếng Việt được tạo, số lượt còn lại và thời điểm làm mới; chỉ trở thành mô tả của tin khi SELLER xác nhận.
- **Daily AI Usage**: Bộ đếm theo SELLER và ngày kinh doanh, theo dõi lượt đã dùng và lượt đang được giữ chỗ để bảo đảm giới hạn khi có yêu cầu đồng thời.

## Success Criteria

### Measurable Outcomes

- **SC-001**: SELLER có thể nhận và áp dụng một bản nháp mô tả trong không quá 45 giây và không quá bốn thao tác sau khi đã điền đủ dữ liệu.
- **SC-002**: 100% bản nháp trong bộ kiểm thử dài 600–900 ký tự, sử dụng tiếng Việt và không chứa trường dữ liệu bị cấm.
- **SC-003**: 100% trường hợp thử nghiệm với dữ liệu thiếu hoặc từ khóa không hợp lệ bị từ chối mà không giảm lượt.
- **SC-004**: Không tài khoản nào có thể hoàn thành thành công quá năm lần tạo trong cùng một ngày, kể cả khi gửi đồng thời ít nhất mười yêu cầu.
- **SC-005**: 100% lỗi mô phỏng từ dịch vụ tạo nội dung không làm mất mô tả hiện tại và không giảm lượt sử dụng.
- **SC-006**: Ít nhất 90% bản nháp trong bộ dữ liệu chấp nhận phản ánh đúng toàn bộ thuộc tính quan trọng đã cung cấp và không thêm thông tin không có nguồn.
- **SC-007**: 100% kiểm tra bảo mật xác nhận khóa truy cập không xuất hiện trong mã nguồn, log, phản hồi mạng hoặc gói ứng dụng trình duyệt.
- **SC-008**: Tính năng tạo nội dung bị vô hiệu hóa hoặc không khả dụng không cản SELLER hoàn thành quy trình nhập mô tả thủ công và lưu tin.

## Assumptions

- Ngày kinh doanh được tính theo `Asia/Ho_Chi_Minh` và làm mới lúc 00:00.
- Hệ thống sử dụng một dịch vụ tạo nội dung bên ngoài đã được cấu hình bởi người vận hành; việc chọn phiên bản cụ thể là quyết định triển khai.
- Chỉ kết quả vượt qua kiểm tra nội dung và được trả thành công cho SELLER mới làm giảm lượt.
- Bản nháp không được lưu lâu dài ngoài dữ liệu cần thiết để thực thi giới hạn sử dụng và kiểm tra vận hành an toàn.
- Phiên bản đầu chỉ tạo mô tả văn bản; tạo tiêu đề, xử lý hình ảnh, dịch đa ngôn ngữ và tự động đăng tin nằm ngoài phạm vi.
