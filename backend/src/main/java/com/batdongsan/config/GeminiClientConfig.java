package com.batdongsan.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
@EnableConfigurationProperties(GeminiProperties.class)
public class GeminiClientConfig {

    @Bean
    public ObjectMapper aiObjectMapper() {
        return new ObjectMapper();
    }

    @Bean
    @Qualifier("geminiRestClient")
    public RestClient geminiRestClient(GeminiProperties properties) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(properties.connectTimeoutMs()))
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofMillis(properties.readTimeoutMs()));

        RestClient.Builder builder = RestClient.builder()
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory);
        if (properties.apiKey() != null && !properties.apiKey().isBlank()) {
            builder.defaultHeader("x-goog-api-key", properties.apiKey());
        }
        return builder.build();
    }
}
