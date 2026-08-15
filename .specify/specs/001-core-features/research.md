# Research: HomiGO Backend Core

## Decision 1: Backend-first delivery

**Decision**: Hoàn thiện API và kiểm thử trước, frontend React triển khai sau khi contract ổn định.  
**Rationale**: Repository hiện chỉ có backend; contract ổn định giúp tránh sửa đồng thời hai phía.  
**Alternatives considered**: Làm full-stack theo từng màn hình; bị loại vì làm phân tán nỗ lực khi domain model còn thiếu.

## Decision 2: Modular monolith

**Decision**: Giữ một Spring Boot application và tổ chức theo domain/layer hiện có.  
**Rationale**: Quy mô đồ án, nhóm nhỏ và một database chưa cần microservices.  
**Alternatives considered**: Microservices auth/listing/search; chi phí deployment, transaction và observability quá lớn.

## Decision 3: Database migrations

**Decision**: Dùng Flyway, `ddl-auto=validate` ở dev/prod và `create-drop` chỉ ở test nhanh.  
**Rationale**: Schema có lịch sử, tái lập được và phù hợp CI/CD.  
**Alternatives considered**: Hibernate `update`; không an toàn và không review được thay đổi schema.

## Decision 4: Testing strategy

**Decision**: Unit test service bằng Mockito, slice/integration test API, Testcontainers MySQL cho luồng quan trọng; H2 giữ cho context smoke test.  
**Rationale**: Cân bằng tốc độ và độ tương thích production.  
**Alternatives considered**: Chỉ mock hoặc chỉ E2E; lần lượt thiếu độ tin cậy hoặc quá chậm/khó chẩn đoán.

## Decision 5: Search implementation

**Decision**: Tiếp tục JPA Specification + database indexes trong core; thiết kế filter DTO có keyword, sort và bounding box.  
**Rationale**: Dữ liệu đồ án ở mức vừa, MySQL đáp ứng được và giảm hạ tầng.  
**Alternatives considered**: Elasticsearch/OpenSearch; chỉ xem xét khi có benchmark chứng minh MySQL không đạt mục tiêu.

## Decision 6: Image storage

**Decision**: Dùng abstraction `StorageService`; local filesystem cho dev, có thể thêm S3-compatible adapter sau.  
**Rationale**: Giữ demo đơn giản nhưng không khóa kiến trúc.  
**Alternatives considered**: Lưu blob trong MySQL hoặc tích hợp cloud ngay; tăng tải DB hoặc cấu hình sớm.

## Decision 7: Authentication

**Decision**: Access token ngắn hạn và refresh token có thể thu hồi, BCrypt cho mật khẩu.  
**Rationale**: Cho phép khóa phiên và giảm rủi ro token dài hạn.  
**Alternatives considered**: JWT access token 24 giờ không refresh; khó thu hồi khi tài khoản bị xâm nhập.

## Decision 8: Graduation-project differentiator

**Decision**: Sau core, ưu tiên phân tích giá theo khu vực và giá/m².  
**Rationale**: Có giá trị học thuật, đo lường được và dùng chính dữ liệu của hệ thống.  
**Alternatives considered**: Chat, payment, tin VIP hoặc AI sinh mô tả; ít giá trị phân tích hơn hoặc mở rộng phạm vi quá mạnh.
