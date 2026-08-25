# Feature Specification: Advanced Property Insights

**Feature Branch**: `[003-advanced-property-insights]`

**Created**: 2026-08-17

**Status**: Implemented and validated

**Input**: User description: "Bổ sung chức năng nâng cao như notification, thống kê lượt xem và gợi ý bất động sản."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Theo dõi thông báo trong ứng dụng (Priority: P1)

Người dùng đã đăng nhập xem được các thay đổi quan trọng liên quan đến tin đăng của mình ngay trong HomiGO, nhận biết thông báo chưa đọc và đánh dấu chúng đã đọc. Quản trị viên cũng được báo khi có tin mới cần kiểm duyệt.

**Why this priority**: Thông báo khép kín quy trình đăng và kiểm duyệt tin, giúp người bán và quản trị viên không phải tự kiểm tra trạng thái liên tục.

**Independent Test**: Có thể kiểm thử bằng cách gửi một tin chờ duyệt, duyệt hoặc từ chối tin đó, rồi xác nhận đúng người nhận nhìn thấy nội dung, số lượng chưa đọc và trạng thái đã đọc.

**Acceptance Scenarios**:

1. **Given** người bán gửi một tin để kiểm duyệt, **When** yêu cầu được ghi nhận, **Then** quản trị viên nhận được thông báo về tin mới cần xử lý.
2. **Given** một tin đang chờ duyệt, **When** quản trị viên duyệt hoặc từ chối tin, **Then** chủ tin nhận được thông báo nêu rõ kết quả và có thể mở tin liên quan.
3. **Given** người dùng có thông báo chưa đọc, **When** họ mở danh sách và đánh dấu một hoặc tất cả thông báo đã đọc, **Then** trạng thái và tổng số chưa đọc được cập nhật chính xác.
4. **Given** hai tài khoản khác nhau, **When** một tài khoản yêu cầu xem hoặc cập nhật thông báo của tài khoản kia, **Then** hệ thống từ chối truy cập.

---

### User Story 2 - Xem thống kê lượt xem tin đăng (Priority: P2)

Người bán theo dõi được mức độ quan tâm dành cho từng tin thông qua tổng lượt xem, lượt xem hôm nay, lượt xem trong bảy ngày gần nhất và biểu đồ theo ngày.

**Why this priority**: Số liệu giúp người bán đánh giá hiệu quả tin đăng và điều chỉnh nội dung hoặc giá bán dựa trên hành vi thực tế.

**Independent Test**: Có thể kiểm thử bằng cách truy cập một tin từ nhiều khách khác nhau, truy cập lặp lại trong cùng ngày, rồi xác nhận số liệu chỉ tăng theo quy tắc lượt xem duy nhất và chỉ chủ tin được xem thống kê chi tiết.

**Acceptance Scenarios**:

1. **Given** một khách truy cập tin công khai lần đầu trong ngày, **When** trang chi tiết được mở, **Then** lượt xem duy nhất trong ngày của tin tăng một.
2. **Given** cùng một khách đã được ghi nhận trong ngày, **When** họ tải lại hoặc mở lại cùng tin, **Then** lượt xem duy nhất trong ngày không tăng thêm.
3. **Given** chủ sở hữu của tin, **When** họ mở phần thống kê với khoảng thời gian hợp lệ, **Then** hệ thống hiển thị tổng lượt xem, lượt xem hôm nay, bảy ngày gần nhất và chuỗi số liệu đầy đủ theo ngày.
4. **Given** người dùng không sở hữu tin, **When** họ yêu cầu thống kê chi tiết, **Then** hệ thống từ chối truy cập.

---

### User Story 3 - Khám phá bất động sản phù hợp (Priority: P3)

Khách xem một tin đang hoạt động được giới thiệu thêm các bất động sản tương tự dựa trên loại bất động sản, khu vực, dự án, giá, diện tích và độ mới.

**Why this priority**: Gợi ý giữ người dùng tiếp tục khám phá nguồn cung phù hợp và tăng cơ hội kết nối với tin đăng khác.

**Independent Test**: Có thể tạo các tin với mức độ tương đồng khác nhau, mở một tin tham chiếu và xác nhận danh sách ưu tiên tin phù hợp, không chứa chính tin đang xem hoặc tin không còn hoạt động.

**Acceptance Scenarios**:

1. **Given** có nhiều tin đang hoạt động, **When** khách mở một tin, **Then** họ thấy tối đa số lượng gợi ý được yêu cầu và tin giống hơn được xếp trước.
2. **Given** có tin hết hạn, bị ẩn hoặc chính tin đang xem, **When** danh sách gợi ý được tạo, **Then** các tin đó không xuất hiện.
3. **Given** không có tin đủ tương đồng, **When** khách mở tin, **Then** giao diện hiển thị trạng thái không có gợi ý mà không làm gián đoạn nội dung chính.

### Edge Cases

- Thông báo tham chiếu đến một tin đã bị xóa vẫn hiển thị nội dung lịch sử nhưng không tạo liên kết hỏng.
- Nhiều quản trị viên cùng duyệt một tin không được tạo thông báo kết quả trùng lặp.
- Khách chặn hoặc xóa dữ liệu nhận diện trình duyệt được xem như một khách mới; hệ thống không thu thập thông tin nhận dạng cá nhân cho mục đích đếm lượt xem.
- Yêu cầu ghi nhận lượt xem thiếu hoặc sai mã khách phải bị từ chối mà không làm thay đổi số liệu.
- Khoảng thống kê không có lượt xem vẫn trả đủ các ngày với giá trị bằng không.
- Kích thước danh sách gợi ý vượt giới hạn được đưa về giới hạn an toàn; giá trị không hợp lệ bị từ chối.
- Một tin thiếu giá, diện tích, dự án hoặc địa chỉ chi tiết vẫn có thể được gợi ý dựa trên các thuộc tính còn lại.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST tạo thông báo cho tất cả quản trị viên đang hoạt động khi một tin được gửi sang trạng thái chờ kiểm duyệt.
- **FR-002**: Hệ thống MUST tạo đúng một thông báo cho chủ tin khi tin được duyệt hoặc bị từ chối, kèm loại kết quả, nội dung dễ hiểu và tham chiếu đến tin khi tin còn tồn tại.
- **FR-003**: Người dùng đã đăng nhập MUST có thể xem danh sách thông báo của chính mình theo trang, ưu tiên thông báo mới nhất.
- **FR-004**: Người dùng đã đăng nhập MUST có thể lọc chỉ thông báo chưa đọc, xem tổng số chưa đọc, đánh dấu một thông báo hoặc tất cả thông báo của mình đã đọc.
- **FR-005**: Hệ thống MUST ngăn mọi tài khoản đọc hoặc thay đổi thông báo thuộc tài khoản khác.
- **FR-006**: Hệ thống MUST ghi nhận tối đa một lượt xem cho mỗi tổ hợp khách, tin đăng và ngày theo múi giờ kinh doanh của hệ thống.
- **FR-007**: Hệ thống MUST ưu tiên định danh tài khoản khi khách đã đăng nhập và sử dụng một mã khách ẩn danh không chứa thông tin cá nhân khi khách chưa đăng nhập.
- **FR-008**: Chỉ tin đang hoạt động và chưa hết hạn mới được ghi nhận lượt xem công khai.
- **FR-009**: Chủ tin và quản trị viên MUST có thể xem thống kê chi tiết của tin trong khoảng từ 7 đến 90 ngày, bao gồm tổng lượt xem, hôm nay, bảy ngày gần nhất và từng ngày trong khoảng chọn.
- **FR-010**: Chuỗi thống kê MUST bao gồm cả ngày không có lượt xem với giá trị bằng không.
- **FR-011**: Hệ thống MUST ngăn người dùng không phải chủ tin và không phải quản trị viên xem thống kê chi tiết.
- **FR-012**: Hệ thống MUST cung cấp tối đa 12 gợi ý cho một tin công khai, mặc định là 6, theo thứ tự giảm dần về độ tương đồng.
- **FR-013**: Điểm tương đồng MUST xét các tín hiệu loại bất động sản, khu vực, dự án, độ gần của giá và diện tích; độ mới được dùng để phân xử khi điểm bằng nhau.
- **FR-014**: Gợi ý MUST loại bỏ chính tin đang xem, tin không hoạt động và tin đã hết hạn.
- **FR-015**: Giao diện MUST hiển thị số thông báo chưa đọc tại khu vực điều hướng, danh sách thông báo, thống kê dễ đọc cho người bán và khu vực gợi ý trên trang chi tiết tin.
- **FR-016**: Các luồng tạo thông báo, ghi nhận lượt xem, phân quyền thống kê và xếp hạng gợi ý MUST có kiểm thử tự động cho hành vi chính và trường hợp từ chối truy cập.

### Key Entities

- **Notification**: Một thông điệp dành cho đúng một người nhận; có loại, tiêu đề, nội dung, tham chiếu nghiệp vụ tùy chọn, thời điểm tạo và thời điểm đọc.
- **Listing View**: Một lượt xem duy nhất của một khách đối với một tin trong một ngày; liên kết với tin và lưu dấu khách ở dạng không thể dùng trực tiếp để nhận diện cá nhân.
- **Listing Statistics**: Thông tin tổng hợp theo quyền truy cập, gồm tổng lượt xem và chuỗi lượt xem theo ngày của một tin.
- **Property Recommendation**: Một tin đang hoạt động được xếp hạng so với tin tham chiếu bằng điểm tương đồng và các lý do phù hợp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng nhìn thấy số thông báo chưa đọc mới nhất trong vòng 60 giây sau khi sự kiện nghiệp vụ hoàn tất mà không cần đăng nhập lại.
- **SC-002**: 100% thông báo kiểm duyệt được gửi đúng nhóm người nhận và không tài khoản nào truy cập được thông báo của người khác trong bộ kiểm thử phân quyền.
- **SC-003**: Tải lại cùng tin nhiều lần bởi cùng một khách trong cùng ngày chỉ tạo một lượt xem, trong khi hai khách khác nhau tạo hai lượt xem.
- **SC-004**: Người bán có thể đọc đủ bốn chỉ số chính và xu hướng theo ngày của một tin trong không quá ba thao tác từ trang quản lý tin.
- **SC-005**: 95% yêu cầu xem thông báo, thống kê hoặc gợi ý trong môi trường kiểm thử thông thường hoàn tất trong dưới hai giây.
- **SC-006**: Trong bộ dữ liệu kiểm thử có mức độ tương đồng rõ ràng, 100% tin phù hợp nhất xuất hiện trước tin ít phù hợp hơn và không có tin bị loại trừ xuất hiện.
- **SC-007**: Ba chức năng hoạt động trên màn hình di động 360 px, máy tính bảng 768 px và máy tính để bàn 1440 px mà không che khuất nội dung hoặc thao tác chính.

## Assumptions

- Phiên bản đầu chỉ cung cấp thông báo bên trong ứng dụng; email, SMS, thông báo đẩy và kết nối thời gian thực nằm ngoài phạm vi.
- Giao diện kiểm tra thông báo mới theo chu kỳ tối đa 60 giây và làm mới ngay sau thao tác của người dùng.
- Lượt xem được hiểu là lượt khách duy nhất trên mỗi tin mỗi ngày, không phải mọi lần tải trang.
- Mã khách ẩn danh do trình duyệt sinh được lưu cục bộ; phía hệ thống chỉ lưu dấu băm của mã này và không dùng địa chỉ IP để nhận diện.
- Thống kê sử dụng múi giờ kinh doanh Asia/Ho_Chi_Minh và giữ dữ liệu lượt xem trong suốt vòng đời dữ liệu của tin ở phiên bản này.
- Gợi ý dùng quy tắc tương đồng xác định từ dữ liệu tin hiện có; học máy, hồ sơ hành vi cá nhân và dịch vụ trí tuệ nhân tạo bên ngoài nằm ngoài phạm vi.
- Cơ chế đăng nhập, ba vai trò hiện có, quy trình kiểm duyệt và dữ liệu danh mục/địa điểm/dự án hiện tại tiếp tục được tái sử dụng.
