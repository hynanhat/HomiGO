package com.batdongsan.exception;

import com.batdongsan.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException ex) {
        return error(ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return error(ErrorCode.RESOURCE_NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoResourceFoundException(NoResourceFoundException ex) {
        return error(ErrorCode.RESOURCE_NOT_FOUND, null);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequestException(BadRequestException ex) {
        return error(ErrorCode.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Invalid request argument", ex);
        return error(ErrorCode.INVALID_ARGUMENT, null);
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<ApiResponse<Void>> handleMalformedRequest(Exception ex) {
        log.warn("Malformed request", ex);
        return error(ErrorCode.INVALID_ARGUMENT, null);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbiddenException(ForbiddenException ex) {
        return error(ErrorCode.ACCESS_DENIED, ex.getMessage());
    }

    @ExceptionHandler({ConflictException.class, org.springframework.orm.ObjectOptimisticLockingFailureException.class})
    public ResponseEntity<ApiResponse<Void>> handleConflictException(Exception ex) {
        return error(ErrorCode.CONFLICT, ex instanceof ConflictException ? ex.getMessage() : null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("Database constraint conflict", ex);
        return error(ErrorCode.CONFLICT, "Dữ liệu đang được sử dụng hoặc đã tồn tại.");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSizeExceededException() {
        return error(ErrorCode.FILE_TOO_LARGE, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = error instanceof FieldError fieldError
                    ? fieldError.getField()
                    : error.getObjectName();
            errors.put(fieldName, error.getDefaultMessage());
        });

        ApiResponse<Map<String, String>> response =
                new ApiResponse<>(false, errors, ErrorCode.VALIDATION_ERROR.getDefaultMessage(),
                        ErrorCode.VALIDATION_ERROR.getCode());
        return new ResponseEntity<>(response, ErrorCode.VALIDATION_ERROR.getStatus());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGlobalException(Exception ex) {
        log.error("Unhandled server exception", ex);
        return error(ErrorCode.INTERNAL_SERVER_ERROR, null);
    }

    private ResponseEntity<ApiResponse<Void>> error(ErrorCode errorCode, String message) {
        String safeMessage = message == null || message.isBlank()
                ? errorCode.getDefaultMessage()
                : message;
        return new ResponseEntity<>(
                ApiResponse.error(safeMessage, errorCode.getCode()),
                errorCode.getStatus());
    }
}
