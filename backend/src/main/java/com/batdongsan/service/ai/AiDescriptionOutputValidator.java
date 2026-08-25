package com.batdongsan.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.regex.Pattern;

@Component
public class AiDescriptionOutputValidator {
    private static final Pattern HTML = Pattern.compile("<[^>]+>");
    private static final Pattern URL = Pattern.compile("(?i)(https?://|www\\.)\\S+");
    private static final Pattern EMAIL = Pattern.compile("[\\w.+-]+@[\\w.-]+\\.[A-Za-z]{2,}");
    private static final Pattern PHONE = Pattern.compile(
            "(?<!\\d)(?:\\+84|0[2-9])(?:[ ()\\-.]*\\d){8,10}(?!\\d)");

    private final ObjectMapper objectMapper;

    public AiDescriptionOutputValidator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String validate(String rawJson) {
        JsonNode root;
        try {
            root = objectMapper.readTree(rawJson);
        } catch (JsonProcessingException ex) {
            throw invalid("Gemini output is not valid JSON", ex);
        }
        if (!root.isObject() || root.size() != 1 || !root.has("description")
                || !root.get("description").isTextual()) {
            throw invalid("Gemini output does not match the description schema", null);
        }

        String description = normalize(root.get("description").asText());
        int length = description.codePointCount(0, description.length());
        if (length < 600 || length > 900) {
            throw invalid("Gemini description length is outside the accepted range", null);
        }
        long paragraphs = Arrays.stream(description.split("\\n\\s*\\n"))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .count();
        if (paragraphs < 2 || paragraphs > 3) {
            throw invalid("Gemini description must contain two or three paragraphs", null);
        }
        if (description.contains("```") || HTML.matcher(description).find()
                || URL.matcher(description).find() || EMAIL.matcher(description).find()
                || PHONE.matcher(description).find()) {
            throw invalid("Gemini description contains prohibited formatted or contact content", null);
        }
        return description;
    }

    private String normalize(String value) {
        return value.replace("\r\n", "\n")
                .replace('\r', '\n')
                .replaceAll("[ \\t]+\\n", "\n")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }

    private AiDescriptionClientException invalid(String message, Throwable cause) {
        return cause == null
                ? new AiDescriptionClientException(AiDescriptionFailureType.INVALID_RESPONSE, message)
                : new AiDescriptionClientException(AiDescriptionFailureType.INVALID_RESPONSE, message, cause);
    }
}
