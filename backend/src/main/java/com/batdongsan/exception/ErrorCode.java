package com.batdongsan.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    BAD_REQUEST("BAD_REQUEST", "Yêu cầu không hợp lệ.", HttpStatus.BAD_REQUEST),
    INVALID_ARGUMENT("INVALID_ARGUMENT", "Tham số không hợp lệ.", HttpStatus.BAD_REQUEST),
    VALIDATION_ERROR("VALIDATION_ERROR", "Dữ liệu đầu vào không hợp lệ.", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("UNAUTHORIZED", "Bạn cần đăng nhập để thực hiện thao tác này.", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED("ACCESS_DENIED", "Bạn không có quyền thực hiện thao tác này.", HttpStatus.FORBIDDEN),
    RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND", "Không tìm thấy tài nguyên.", HttpStatus.NOT_FOUND),
    CONFLICT("CONFLICT", "Dữ liệu đã được thay đổi. Vui lòng tải lại.", HttpStatus.CONFLICT),
    FILE_TOO_LARGE("FILE_TOO_LARGE", "Ảnh không được vượt quá 5 MB.", HttpStatus.PAYLOAD_TOO_LARGE),
    LOCATION_RELATION_MISMATCH("LOCATION_RELATION_MISMATCH", "Phường/xã/đặc khu không thuộc tỉnh/thành phố đã chọn.", HttpStatus.BAD_REQUEST),
    LOCATION_PARENT_REQUIRED("LOCATION_PARENT_REQUIRED", "Vui lòng chọn tỉnh/thành phố trước khi chọn phường/xã/đặc khu.", HttpStatus.BAD_REQUEST),
    LOCATION_NOT_FOUND("LOCATION_NOT_FOUND", "Không tìm thấy đơn vị hành chính.", HttpStatus.NOT_FOUND),
    LOCATION_INACTIVE("LOCATION_INACTIVE", "Đơn vị hành chính này không còn được sử dụng cho địa chỉ mới.", HttpStatus.UNPROCESSABLE_ENTITY),
    ADMINISTRATIVE_DATASET_CHECKSUM_CONFLICT("ADMINISTRATIVE_DATASET_CHECKSUM_CONFLICT", "Phiên bản dữ liệu đã tồn tại với checksum khác.", HttpStatus.CONFLICT),
    ADMINISTRATIVE_DATASET_INVALID("ADMINISTRATIVE_DATASET_INVALID", "Bộ dữ liệu hành chính không vượt qua kiểm tra.", HttpStatus.UNPROCESSABLE_ENTITY),
    ADMINISTRATIVE_DATASET_NOT_VALIDATED("ADMINISTRATIVE_DATASET_NOT_VALIDATED", "Bộ dữ liệu phải được kiểm tra trước khi kích hoạt.", HttpStatus.CONFLICT),
    PRODUCTION_CATEGORY_CONFLICT("PRODUCTION_CATEGORY_CONFLICT", "Danh mục production xung đột với dữ liệu hiện có.", HttpStatus.CONFLICT),
    AI_CONTENT_REJECTED("AI_CONTENT_REJECTED", "Nội dung từ khóa không thể được xử lý. Vui lòng điều chỉnh và thử lại.", HttpStatus.UNPROCESSABLE_ENTITY),
    AI_DAILY_LIMIT_REACHED("AI_DAILY_LIMIT_REACHED", "Bạn đã dùng hết 5 lượt tạo mô tả hôm nay.", HttpStatus.TOO_MANY_REQUESTS),
    AI_QUOTA_TEMPORARILY_RESERVED("AI_QUOTA_TEMPORARILY_RESERVED", "Các lượt tạo mô tả đang được xử lý. Vui lòng thử lại sau ít phút.", HttpStatus.TOO_MANY_REQUESTS),
    AI_INVALID_RESPONSE("AI_INVALID_RESPONSE", "AI chưa tạo được mô tả hợp lệ. Vui lòng thử lại.", HttpStatus.BAD_GATEWAY),
    AI_FEATURE_UNAVAILABLE("AI_FEATURE_UNAVAILABLE", "Tính năng viết mô tả bằng AI hiện chưa khả dụng.", HttpStatus.SERVICE_UNAVAILABLE),
    AI_CONFIGURATION_ERROR("AI_CONFIGURATION_ERROR", "Tính năng viết mô tả bằng AI đang được bảo trì.", HttpStatus.SERVICE_UNAVAILABLE),
    AI_SERVICE_UNAVAILABLE("AI_SERVICE_UNAVAILABLE", "Dịch vụ AI đang bận. Vui lòng thử lại sau.", HttpStatus.SERVICE_UNAVAILABLE),
    AI_GENERATION_TIMEOUT("AI_GENERATION_TIMEOUT", "Dịch vụ AI phản hồi quá lâu. Vui lòng thử lại.", HttpStatus.GATEWAY_TIMEOUT),
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String defaultMessage;
    private final HttpStatus status;

    ErrorCode(String code, String defaultMessage, HttpStatus status) {
        this.code = code; this.defaultMessage = defaultMessage; this.status = status;
    }
    public String getCode() { return code; }
    public String getDefaultMessage() { return defaultMessage; }
    public HttpStatus getStatus() { return status; }
}
