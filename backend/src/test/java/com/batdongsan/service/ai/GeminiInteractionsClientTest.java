package com.batdongsan.service.ai;

import com.batdongsan.config.GeminiProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class GeminiInteractionsClientTest {
    private HttpServer server;

    @AfterEach
    void stopServer() {
        if (server != null) server.stop(0);
    }

    @Test
    void sendsStatelessInteractionAndParsesModelOutput() throws Exception {
        AtomicInteger requests = new AtomicInteger();
        start(exchange -> {
            requests.incrementAndGet();
            String requestBody = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            assertEquals("test-key", exchange.getRequestHeaders().getFirst("x-goog-api-key"));
            assertTrue(requestBody.contains("\"store\":false"));
            assertTrue(requestBody.contains("\"background\":false"));
            respond(exchange, 200, "{\"status\":\"completed\",\"steps\":[{\"type\":\"model_output\",\"content\":[{\"type\":\"text\",\"text\":\"{\\\"description\\\":\\\"ok\\\"}\"}]}]}");
        });

        GeminiInteractionsClient client = client(1);
        assertEquals("{\"description\":\"ok\"}", client.generate(new AiDescriptionClientRequest("system", "input")));
        assertEquals(1, requests.get());
    }

    @Test
    void retriesServerFailureButDoesNotExposeRawError() throws Exception {
        AtomicInteger requests = new AtomicInteger();
        start(exchange -> {
            if (requests.incrementAndGet() == 1) respond(exchange, 500, "provider-secret-error");
            else respond(exchange, 200, "{\"status\":\"completed\",\"steps\":[{\"type\":\"model_output\",\"content\":[{\"type\":\"text\",\"text\":\"done\"}]}]}");
        });

        assertEquals("done", client(2).generate(new AiDescriptionClientRequest("system", "input")));
        assertEquals(2, requests.get());
    }

    @Test
    void mapsBlockedAndMalformedResponses() throws Exception {
        start(exchange -> respond(exchange, 200, "{\"status\":\"failed\",\"errors\":[{\"message\":\"safety blocked\"}]}"));
        AiDescriptionClientException error = assertThrows(AiDescriptionClientException.class,
                () -> client(1).generate(new AiDescriptionClientRequest("system", "input")));
        assertEquals(AiDescriptionFailureType.CONTENT_REJECTED, error.getFailureType());
    }

    private GeminiInteractionsClient client(int attempts) {
        String baseUrl = "http://localhost:" + server.getAddress().getPort();
        GeminiProperties properties = new GeminiProperties(true, "test-key", "gemini-test", "v1",
                baseUrl, 500, 2_000, attempts, 1200, "low", 90, "0 * * * * *");
        RestClient restClient = RestClient.builder().baseUrl(baseUrl)
                .defaultHeader("x-goog-api-key", "test-key").build();
        return new GeminiInteractionsClient(restClient, properties, new ObjectMapper());
    }

    private void start(Handler handler) throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/v1/interactions", exchange -> {
            try { handler.handle(exchange); } catch (Throwable error) {
                respond(exchange, 500, "test-handler-error");
            }
        });
        server.start();
    }

    private static void respond(com.sun.net.httpserver.HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }

    @FunctionalInterface
    private interface Handler { void handle(com.sun.net.httpserver.HttpExchange exchange) throws Exception; }
}
