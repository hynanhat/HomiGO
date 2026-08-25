package com.batdongsan.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class VisitorCookieServiceTest {
    private final VisitorCookieService service = new VisitorCookieService(
            "test-only-analytics-secret-with-at-least-32-bytes", false);

    @Test
    void acceptsOnlyServerSignedVisitorCookies() {
        var issued = service.resolve(null);
        assertThat(issued.cookie()).isNotNull();
        assertThat(issued.cookie().isHttpOnly()).isTrue();

        var restored = service.resolve(issued.cookie().getValue());
        assertThat(restored.id()).isEqualTo(issued.id());
        assertThat(restored.cookie()).isNull();

        var replaced = service.resolve(issued.id() + ".forged");
        assertThat(replaced.id()).isNotEqualTo(issued.id());
        assertThat(replaced.cookie()).isNotNull();
    }
}
