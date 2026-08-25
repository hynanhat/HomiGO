package com.batdongsan.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.ai.gemini")
public record GeminiProperties(
        boolean enabled,
        String apiKey,
        String model,
        String apiVersion,
        String baseUrl,
        int connectTimeoutMs,
        int readTimeoutMs,
        int maxAttempts,
        int maxOutputTokens,
        String thinkingLevel,
        long reservationLeaseSeconds,
        String cleanupCron) {

    public boolean isAvailable() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }
}
