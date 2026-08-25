package com.batdongsan.service.ai;

import com.batdongsan.config.GeminiProperties;
import com.batdongsan.dto.ai.AiDescriptionDraftRes;
import com.batdongsan.dto.ai.AiDescriptionGenerateReq;
import com.batdongsan.dto.ai.AiDescriptionQuotaRes;
import com.batdongsan.exception.ApiException;
import com.batdongsan.exception.ErrorCode;
import org.springframework.stereotype.Service;

@Service
public class AiDescriptionService {
    private final GeminiProperties properties;
    private final AiDescriptionPromptFactory promptFactory;
    private final AiDescriptionClient client;
    private final AiDescriptionOutputValidator outputValidator;
    private final AiQuotaService quotaService;

    public AiDescriptionService(GeminiProperties properties,
                                AiDescriptionPromptFactory promptFactory,
                                AiDescriptionClient client,
                                AiDescriptionOutputValidator outputValidator,
                                AiQuotaService quotaService) {
        this.properties = properties;
        this.promptFactory = promptFactory;
        this.client = client;
        this.outputValidator = outputValidator;
        this.quotaService = quotaService;
    }

    public AiDescriptionQuotaRes getQuota(String email) {
        return quotaService.getQuota(email);
    }

    public AiDescriptionDraftRes generate(String email, AiDescriptionGenerateReq request) {
        ensureConfigured();
        AiDescriptionClientRequest clientRequest = promptFactory.create(request);
        AiQuotaService.ReservationLease lease = quotaService.reserve(email);
        try {
            String rawOutput = client.generate(clientRequest);
            String description = outputValidator.validate(rawOutput);
            AiDescriptionQuotaRes quota = quotaService.finalizeSuccess(lease.token());
            return new AiDescriptionDraftRes(description, quota);
        } catch (AiDescriptionClientException ex) {
            quotaService.release(lease.token(), ex.getFailureType().name());
            throw map(ex);
        } catch (ApiException ex) {
            quotaService.release(lease.token(), ex.getErrorCode().getCode());
            throw ex;
        } catch (RuntimeException ex) {
            quotaService.release(lease.token(), "UNEXPECTED_FAILURE");
            throw ex;
        }
    }

    private void ensureConfigured() {
        if (!properties.enabled()) throw new ApiException(ErrorCode.AI_FEATURE_UNAVAILABLE);
        if (properties.apiKey() == null || properties.apiKey().isBlank()
                || properties.model() == null || properties.model().isBlank()) {
            throw new ApiException(ErrorCode.AI_CONFIGURATION_ERROR);
        }
    }

    private ApiException map(AiDescriptionClientException ex) {
        return switch (ex.getFailureType()) {
            case CONTENT_REJECTED -> new ApiException(ErrorCode.AI_CONTENT_REJECTED);
            case TIMEOUT -> new ApiException(ErrorCode.AI_GENERATION_TIMEOUT);
            case INVALID_RESPONSE -> new ApiException(ErrorCode.AI_INVALID_RESPONSE);
            case CONFIGURATION -> new ApiException(ErrorCode.AI_CONFIGURATION_ERROR);
            case UNAVAILABLE -> new ApiException(ErrorCode.AI_SERVICE_UNAVAILABLE);
        };
    }
}
