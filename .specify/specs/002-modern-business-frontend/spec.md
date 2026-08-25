# Feature Specification: HomiGO Modern Business Frontend

**Feature Branch**: `appmod/java-upgrade-20260812162719`

**Created**: 2026-08-15

**Status**: Draft

**Input**: User description: "Lên plan thực hiện phần frontend, phong cách chuẩn business, hiện đại."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tìm và xem bất động sản (Priority: P1)

Khách truy cập có thể hiểu ngay giá trị của HomiGO, tìm kiếm bất động sản theo nhu cầu, điều chỉnh bộ lọc, xem kết quả rõ ràng và mở trang chi tiết bằng mã tin công khai.

**Why this priority**: Đây là hành trình tạo giá trị chính của website bất động sản và là phần đầu tiên người dùng nhìn thấy.

**Independent Test**: Từ trang chủ, nhập từ khóa và loại giao dịch, mở trang kết quả, thay đổi ít nhất ba bộ lọc rồi mở một tin ACTIVE để xem đầy đủ thông tin và hình ảnh.

**Acceptance Scenarios**:

1. **Given** khách đang ở trang chủ, **When** gửi biểu mẫu tìm kiếm, **Then** hệ thống mở trang kết quả và giữ điều kiện tìm kiếm trên URL.
2. **Given** danh sách kết quả có nhiều trang, **When** đổi bộ lọc, sắp xếp hoặc trang, **Then** kết quả, số lượng và trạng thái URL được cập nhật đồng bộ.
3. **Given** một tin hợp lệ, **When** khách mở tin, **Then** trang chi tiết hiển thị ảnh, giá, diện tích, vị trí, thuộc tính, mô tả và thông tin liên hệ.
4. **Given** API chậm, lỗi hoặc không có dữ liệu, **When** trang tải, **Then** người dùng thấy skeleton, thông báo lỗi có cách thử lại hoặc empty state phù hợp.

---

### User Story 2 - Khám phá dự án (Priority: P1)

Khách có thể duyệt dự án theo từ khóa, quận/huyện và trạng thái, sau đó xem thông tin dự án cùng các tin đang hoạt động thuộc dự án đó.

**Why this priority**: Dự án là nhóm nội dung quan trọng của nền tảng bất động sản và backend đã hỗ trợ đầy đủ API công khai.

**Independent Test**: Mở danh sách dự án, lọc theo quận/huyện và trạng thái, mở một dự án bằng slug và phân trang các tin thuộc dự án.

**Acceptance Scenarios**:

1. **Given** có nhiều dự án, **When** khách áp dụng bộ lọc, **Then** danh sách chỉ hiển thị các dự án phù hợp và giữ bộ lọc trên URL.
2. **Given** khách mở một dự án, **When** trang tải thành công, **Then** thông tin tổng quan và danh sách tin ACTIVE của dự án được trình bày riêng biệt.

---

### User Story 3 - Tài khoản và tin đã lưu (Priority: P1)

Người dùng có thể đăng ký, đăng nhập, duy trì phiên an toàn, xem/cập nhật hồ sơ, đổi mật khẩu, đăng xuất và quản lý danh sách tin đã lưu.

**Why this priority**: Đây là nền tảng cho toàn bộ chức năng cá nhân hóa, seller và admin.

**Independent Test**: Đăng ký, đăng nhập, tải lại trang vẫn giữ phiên, lưu/bỏ lưu một tin, sửa hồ sơ, đổi mật khẩu và đăng xuất; refresh token bị thu hồi không thể dùng lại.

**Acceptance Scenarios**:

1. **Given** thông tin đăng nhập hợp lệ, **When** người dùng đăng nhập, **Then** giao diện điều hướng theo role và phiên được khôi phục sau khi tải lại trang.
2. **Given** access token hết hạn nhưng refresh token còn hợp lệ, **When** gọi API cần xác thực, **Then** phiên được làm mới một lần và yêu cầu được thực hiện lại.
3. **Given** người dùng nhấn lưu trên một tin, **When** thao tác thành công, **Then** trạng thái yêu thích cập nhật nhất quán ở thẻ tin, chi tiết và trang tin đã lưu.
4. **Given** phiên không còn hợp lệ, **When** API trả lỗi xác thực, **Then** dữ liệu phiên được xóa và người dùng được hướng tới đăng nhập mà không lặp vô hạn.

---

### User Story 4 - Seller quản lý vòng đời tin đăng (Priority: P1)

Seller có dashboard để tạo bản nháp, nhập đủ dữ liệu, tải tối đa 10 ảnh, gửi duyệt, xem trạng thái/lý do từ chối, sửa và ngừng tin thuộc sở hữu của mình.

**Why this priority**: Không có nguồn cung tin đăng thì website không thể vận hành như một sản phẩm bất động sản.

**Independent Test**: USER nâng cấp thành SELLER, tạo DRAFT, upload hai ảnh, gửi PENDING, xem trạng thái; sửa một tin bị từ chối rồi gửi lại.

**Acceptance Scenarios**:

1. **Given** USER chưa phải seller, **When** truy cập chức năng đăng tin, **Then** được giải thích và có hành động nâng cấp tài khoản.
2. **Given** seller đang tạo tin, **When** dữ liệu chưa hợp lệ, **Then** lỗi hiển thị cạnh trường tương ứng và dữ liệu đã nhập không bị mất.
3. **Given** tin DRAFT hợp lệ, **When** seller tải ảnh và gửi duyệt, **Then** dashboard hiển thị trạng thái PENDING và khóa hành động không hợp lệ.
4. **Given** tin REJECTED, **When** seller mở tin, **Then** lý do từ chối được nhấn mạnh và có hành động sửa/gửi lại rõ ràng.

---

### User Story 5 - Admin vận hành nội dung (Priority: P2)

Admin có không gian quản trị riêng để duyệt/từ chối tin, khóa/mở người dùng và quản lý danh mục, dự án, tỉnh/thành, quận/huyện, phường/xã.

**Why this priority**: Cần cho vận hành và demo đầy đủ nhưng phụ thuộc các luồng công khai và tài khoản đã ổn định.

**Independent Test**: Admin đăng nhập, duyệt một tin PENDING, từ chối một tin khác có lý do, khóa/mở người dùng và thực hiện CRUD một bản ghi master data.

**Acceptance Scenarios**:

1. **Given** admin có hàng đợi PENDING, **When** duyệt hoặc từ chối, **Then** hàng đợi và trạng thái cập nhật mà không cần tải lại toàn trang.
2. **Given** thao tác có ảnh hưởng lớn như khóa người dùng hoặc xóa master data, **When** admin thực hiện, **Then** hệ thống yêu cầu xác nhận và hiển thị kết quả rõ ràng.
3. **Given** người dùng không có role ADMIN, **When** truy cập URL quản trị, **Then** bị chặn và nhận hướng dẫn phù hợp.

---

### User Story 6 - Trải nghiệm business nhất quán (Priority: P1)

Mọi người dùng nhận được giao diện chuyên nghiệp, hiện đại, đáng tin cậy, responsive và dễ tiếp cận trên desktop, tablet và mobile.

**Why this priority**: Chất lượng trình bày là tiêu chí trực tiếp khi demo đồ án và ảnh hưởng mọi hành trình.

**Independent Test**: Kiểm tra các trang chính ở 360 px, 768 px và 1440 px; điều hướng hoàn toàn bằng bàn phím; xác minh typography, màu sắc, spacing, trạng thái focus/error/loading nhất quán.

**Acceptance Scenarios**:

1. **Given** người dùng mở website ở ba nhóm kích thước màn hình, **When** thực hiện các hành trình chính, **Then** không có nội dung tràn, che khuất hoặc mất thao tác quan trọng.
2. **Given** người dùng chỉ dùng bàn phím, **When** điều hướng form, menu, modal và danh sách, **Then** thứ tự focus hợp lý và focus luôn nhìn thấy.
3. **Given** một hành động đang xử lý, thành công hoặc thất bại, **When** trạng thái thay đổi, **Then** phản hồi được thể hiện bằng nội dung và biểu tượng, không chỉ bằng màu sắc.

### Edge Cases

- Ảnh tin đăng thiếu, hỏng hoặc tải chậm phải có placeholder nội bộ và không làm thay đổi bố cục.
- Giá, diện tích hoặc nội dung dài phải được định dạng/rút gọn đúng chỗ nhưng không mất dữ liệu trên trang chi tiết.
- Người dùng mở URL có page/filter không hợp lệ phải nhận giá trị an toàn và URL được chuẩn hóa.
- Hai yêu cầu cùng lúc gặp token hết hạn chỉ được thực hiện một lần refresh; các yêu cầu còn lại chờ kết quả.
- Tin bị xóa, hết hạn hoặc chuyển khỏi ACTIVE khi người dùng đang xem phải hiển thị trạng thái không còn khả dụng.
- Upload ảnh thứ 11, ảnh quá 5 MB hoặc sai định dạng phải bị chặn trước khi gửi và vẫn hiển thị lỗi từ server nếu có.
- API trả lỗi validation nhiều trường phải ánh xạ đúng về từng input; lỗi chung hiển thị ở vùng thông báo.
- Admin thao tác trên dữ liệu vừa bị người khác thay đổi phải nhận thông báo xung đột và tải lại dữ liệu.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Giao diện MUST có app shell dùng chung gồm header, điều hướng responsive, vùng nội dung, footer và trạng thái tài khoản theo role.
- **FR-002**: Trang chủ MUST có thông điệp giá trị, tìm kiếm chính, lối tắt mua/thuê/dự án và khu vực nội dung nổi bật lấy từ dữ liệu thật.
- **FR-003**: Trang danh sách tin MUST hỗ trợ toàn bộ bộ lọc, sắp xếp và phân trang đã được phê duyệt, đồng thời cho phép chia sẻ hoặc tải lại đúng trạng thái tìm kiếm.
- **FR-004**: Thẻ tin và trang chi tiết MUST sử dụng định danh công khai ổn định cho điều hướng và định dạng tiền/diện tích/ngày theo tiếng Việt.
- **FR-005**: Trang chi tiết MUST có gallery ảnh, thông tin chính, thuộc tính, vị trí, mô tả, dự án liên quan và thông tin liên hệ.
- **FR-006**: Giao diện MUST hỗ trợ đăng ký, đăng nhập, duy trì phiên, đăng xuất, hồ sơ, nâng cấp seller và đổi mật khẩu theo các khả năng tài khoản đã được phê duyệt.
- **FR-007**: Người dùng đã đăng nhập MUST có thể lưu/bỏ lưu tin và xem danh sách tin đã lưu có phân trang.
- **FR-008**: Seller MUST có dashboard theo trạng thái, danh sách tin sở hữu, form tạo/sửa đầy đủ, quản lý ảnh và các hành động lifecycle hợp lệ.
- **FR-009**: Admin MUST có layout quản trị riêng, hàng đợi kiểm duyệt, quản lý người dùng và CRUD master data theo quyền hiện có.
- **FR-010**: Trang dự án MUST hỗ trợ danh sách, bộ lọc, route theo slug, chi tiết và các tin ACTIVE thuộc dự án.
- **FR-011**: Mọi tương tác dữ liệu từ xa MUST có cách xử lý thành công, lỗi và phiên đăng nhập nhất quán trên toàn sản phẩm.
- **FR-012**: Các route cần xác thực hoặc role MUST được bảo vệ trước khi render nội dung nhạy cảm và vẫn được backend xác minh quyền.
- **FR-013**: Giao diện MUST có component dùng chung cho button, input, select, textarea, badge, card, modal, table, pagination, skeleton, empty state, error state và toast.
- **FR-014**: Hệ thống thiết kế MUST định nghĩa token cho màu, typography, spacing, radius, shadow, breakpoint và trạng thái tương tác.
- **FR-015**: Nội dung người dùng MUST dùng tiếng Việt UTF-8; tên code và kiểu dữ liệu MUST dùng tiếng Anh.
- **FR-016**: Các trang chính MUST responsive và đáp ứng điều hướng bàn phím, label form, focus visible, semantic heading và tương phản màu phù hợp.
- **FR-017**: Giao diện MUST có error boundary, trang 404, trạng thái loading/empty/error và cơ chế retry ở các điểm đọc dữ liệu chính.
- **FR-018**: Các hành trình P1 MUST được bảo vệ bằng kiểm thử tự động ở cấp tương tác và hành trình đầu cuối.
- **FR-019**: Sản phẩm MUST không phụ thuộc đường tích hợp cũ/giả, mã dữ liệu danh mục cố định hoặc địa chỉ máy phát triển cụ thể trong logic nghiệp vụ.
- **FR-020**: Phạm vi phiên bản này MUST không thêm chat, payment, recommendation, bản đồ tương tác hoặc analytics giá nếu backend chưa có contract tương ứng.

### Key Entities

- **Session**: Access token, refresh token, người dùng hiện tại, role và trạng thái khôi phục phiên.
- **Listing**: Tin bất động sản công khai hoặc thuộc seller, bao gồm `publicCode`, trạng thái, giá, diện tích, vị trí, thuộc tính và ảnh.
- **ListingSearchState**: Bộ lọc, sort, page và size được biểu diễn trên URL.
- **Project**: Dự án bất động sản có slug, vị trí, trạng thái, khoảng giá và danh sách tin đang hoạt động.
- **LocationOption**: Cấu trúc phụ thuộc tỉnh/thành → quận/huyện → phường/xã dùng trong bộ lọc và form.
- **SavedListingState**: Trạng thái lưu theo tin và danh sách đã lưu của người dùng.
- **ModerationItem**: Tin PENDING cùng hành động approve/reject và lý do từ chối.
- **PageResult**: Cấu trúc phân trang cố định gồm content và metadata HomiGO.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng mới hoàn thành tìm kiếm và mở một tin phù hợp trong tối đa 90 giây ở lần thử đầu tiên.
- **SC-002**: 100% hành trình P1 có trạng thái loading, empty, error và success có thể kiểm chứng.
- **SC-003**: Các trang chính không có lỗi tràn ngang ở 360 px, 768 px và 1440 px.
- **SC-004**: Ít nhất 90% kiểm tra accessibility tự động trên các trang chính đạt yêu cầu và không có lỗi nghiêm trọng về label, focus hoặc contrast.
- **SC-005**: Nội dung chính của trang danh sách và chi tiết xuất hiện trong tối đa 2 giây với kết nối phát triển bình thường và backend đáp ứng đúng mục tiêu hiện có.
- **SC-006**: 100% thao tác dữ liệu của frontend khớp contract backend được phê duyệt; không còn đường tích hợp giả, mã demo hoặc định danh nội bộ trong liên kết công khai.
- **SC-007**: Seller hoàn thành tạo DRAFT và submit PENDING, còn admin hoàn thành approve/reject, mà không cần thao tác trực tiếp qua Swagger.
- **SC-008**: Toàn bộ kiểm thử frontend và production build chạy thành công trước khi feature được xem là hoàn thành.

## Assumptions

- Backend Phase 1–8 và cấu trúc `ApiResponse`/`PageResponse` hiện tại là nguồn contract chính.
- Giai đoạn frontend ưu tiên web responsive; chưa xây ứng dụng mobile native.
- Phong cách business hiện đại dùng nền sáng, màu chữ xanh than/xám đậm, màu thương hiệu đỏ gạch có kiểm soát, nhiều khoảng trắng và hình ảnh bất động sản chất lượng cao; không sao chép giao diện của website tham khảo.
- Bản đồ tương tác được hoãn; vị trí trước mắt trình bày bằng địa chỉ và tọa độ nếu có.
- Không sử dụng Docker trong giai đoạn phát triển frontend; frontend và backend chạy riêng bằng lệnh local.
- Dữ liệu danh mục cho form đăng tin cần một API public phù hợp; nếu backend chưa cung cấp, đây là dependency cần xử lý trước khi hoàn thiện form seller.
