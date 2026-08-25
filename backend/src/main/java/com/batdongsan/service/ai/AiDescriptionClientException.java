package com.batdongsan.service.ai;

public class AiDescriptionClientException extends RuntimeException {
    private final AiDescriptionFailureType failureType;

    public AiDescriptionClientException(AiDescriptionFailureType failureType, String message) {
        super(message);
        this.failureType = failureType;
    }

    public AiDescriptionClientException(AiDescriptionFailureType failureType, String message, Throwable cause) {
        super(message, cause);
        this.failureType = failureType;
    }

    public AiDescriptionFailureType getFailureType() {
        return failureType;
    }
}
