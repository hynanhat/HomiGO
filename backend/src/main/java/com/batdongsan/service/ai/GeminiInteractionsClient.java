package com.batdongsan.service.ai;

import com.batdongsan.config.GeminiProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class GeminiInteractionsClient implements AiDescriptionClient {
    private final RestClient restClient;
    private final GeminiProperties properties;
    private final ObjectMapper objectMapper;

    public GeminiInteractionsClient(@Qualifier("geminiRestClient") RestClient restClient,
                                    GeminiProperties properties,
                                    ObjectMapper objectMapper) {
        this.restClient = restClient;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Override
    public String generate(AiDescriptionClientRequest request) {
        if (!properties.isAvailable()) {
            throw new AiDescriptionClientException(AiDescriptionFailureType.CONFIGURATION,
                    "Gemini is disabled or has no server API key");
        }
        int attempts = Math.max(1, properties.maxAttempts());
        for (int attempt = 1; attempt <= attempts; attempt++) {
            try {
                String responseBody = restClient.post()
                        .uri("/{apiVersion}/interactions", properties.apiVersion())
                        .body(requestBody(request))
                        .retrieve()
                        .body(String.class);
                return extractOutput(parseResponse(responseBody));
            } catch (RestClientResponseException ex) {
                AiDescriptionClientException mapped = mapHttpError(ex);
                if (attempt == attempts || !isRetryable(ex)) throw mapped;
                backoff(attempt, ex.getResponseHeaders() == null
                        ? null : ex.getResponseHeaders().getFirst("Retry-After"));
            } catch (ResourceAccessException ex) {
                if (attempt == attempts) {
                    throw new AiDescriptionClientException(
                            isTimeout(ex) ? AiDescriptionFailureType.TIMEOUT : AiDescriptionFailureType.UNAVAILABLE,
                            "Gemini request failed", ex);
                }
                backoff(attempt, null);
            }
        }
        throw new AiDescriptionClientException(AiDescriptionFailureType.UNAVAILABLE, "Gemini request failed");
    }

    private JsonNode parseResponse(String responseBody) {
        try {
            return responseBody == null ? null : objectMapper.readTree(responseBody);
        } catch (JsonProcessingException ex) {
            throw new AiDescriptionClientException(AiDescriptionFailureType.INVALID_RESPONSE,
                    "Gemini response is not valid JSON", ex);
        }
    }

    private Map<String, Object> requestBody(AiDescriptionClientRequest request) {
        Map<String, Object> descriptionSchema = new LinkedHashMap<>();
        descriptionSchema.put("type", "string");
        descriptionSchema.put("description", "Mô tả bất động sản tiếng Việt chỉ dựa trên dữ liệu được cung cấp");

        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", Map.of("description", descriptionSchema));
        schema.put("required", List.of("description"));

        Map<String, Object> responseFormat = new LinkedHashMap<>();
        responseFormat.put("type", "text");
        responseFormat.put("mime_type", "application/json");
        responseFormat.put("schema", schema);

        Map<String, Object> generationConfig = new LinkedHashMap<>();
        generationConfig.put("max_output_tokens", properties.maxOutputTokens());
        generationConfig.put("thinking_level", properties.thinkingLevel());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", properties.model());
        body.put("input", request.input());
        body.put("system_instruction", request.systemInstruction());
        body.put("response_format", responseFormat);
        body.put("generation_config", generationConfig);
        body.put("stream", false);
        body.put("store", false);
        body.put("background", false);
        return body;
    }

    private String extractOutput(JsonNode response) {
        if (response == null || !"completed".equals(response.path("status").asText())) {
            String errors = response == null ? "" : response.path("errors").toString().toLowerCase(Locale.ROOT);
            AiDescriptionFailureType type = errors.contains("blocked") || errors.contains("safety")
                    || errors.contains("recitation") || errors.contains("spii")
                    ? AiDescriptionFailureType.CONTENT_REJECTED
                    : AiDescriptionFailureType.INVALID_RESPONSE;
            throw new AiDescriptionClientException(type, "Gemini interaction did not complete");
        }

        JsonNode steps = response.path("steps");
        if (!steps.isArray()) {
            throw new AiDescriptionClientException(AiDescriptionFailureType.INVALID_RESPONSE,
                    "Gemini interaction has no output steps");
        }
        for (int i = steps.size() - 1; i >= 0; i--) {
            JsonNode step = steps.get(i);
            if (!"model_output".equals(step.path("type").asText())) continue;
            JsonNode content = step.path("content");
            if (!content.isArray()) continue;
            StringBuilder output = new StringBuilder();
            for (JsonNode item : content) {
                if ("text".equals(item.path("type").asText()) && item.path("text").isTextual()) {
                    output.append(item.path("text").asText());
                }
            }
            if (!output.isEmpty()) return output.toString();
        }
        throw new AiDescriptionClientException(AiDescriptionFailureType.INVALID_RESPONSE,
                "Gemini interaction has no text output");
    }

    private AiDescriptionClientException mapHttpError(RestClientResponseException ex) {
        int status = ex.getStatusCode().value();
        if (status == 401 || status == 403 || status == 404 || status == 400) {
            return new AiDescriptionClientException(AiDescriptionFailureType.CONFIGURATION,
                    "Gemini authentication, model, or request configuration failed");
        }
        if (status == 422) {
            return new AiDescriptionClientException(AiDescriptionFailureType.CONTENT_REJECTED,
                    "Gemini rejected the supplied content");
        }
        return new AiDescriptionClientException(AiDescriptionFailureType.UNAVAILABLE,
                "Gemini service is unavailable");
    }

    private boolean isRetryable(RestClientResponseException ex) {
        HttpStatusCode status = ex.getStatusCode();
        if (status.value() == 429
                && ex.getResponseBodyAsString().toLowerCase(Locale.ROOT).contains("quota_exceeded")) {
            return false;
        }
        return status.value() == 408 || status.value() == 429 || status.is5xxServerError();
    }

    private boolean isTimeout(ResourceAccessException ex) {
        Throwable current = ex;
        while (current != null) {
            if (current instanceof HttpTimeoutException
                    || current instanceof java.net.SocketTimeoutException) return true;
            current = current.getCause();
        }
        return false;
    }

    private void backoff(int attempt, String retryAfter) {
        long delay = parseRetryAfter(retryAfter)
                .orElse(Math.min(1_500L, 200L * (1L << Math.min(attempt - 1, 3))
                        + ThreadLocalRandom.current().nextLong(50L, 151L)));
        try {
            Thread.sleep(delay);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new AiDescriptionClientException(AiDescriptionFailureType.UNAVAILABLE,
                    "Gemini retry was interrupted", ex);
        }
    }

    private Optional<Long> parseRetryAfter(String value) {
        if (value == null || value.isBlank()) return Optional.empty();
        try {
            return Optional.of(Math.min(Duration.ofSeconds(Long.parseLong(value.trim())).toMillis(), 2_000L));
        } catch (NumberFormatException ex) {
            return Optional.empty();
        }
    }
}
