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
