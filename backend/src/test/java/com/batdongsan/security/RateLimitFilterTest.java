package com.batdongsan.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitFilterTest {
    private final RateLimitFilter filter = new RateLimitFilter(
            Clock.fixed(Instant.parse("2026-08-21T12:00:00Z"), ZoneOffset.UTC),
            1, 1, 1, 1, 1);

    @Test
    void rejectsRequestsBeyondTheEndpointAndIpLimit() throws Exception {
        MockHttpServletRequest first = loginRequest();
        filter.doFilter(first, new MockHttpServletResponse(), new MockFilterChain());

        MockHttpServletResponse rejected = new MockHttpServletResponse();
        filter.doFilter(loginRequest(), rejected, new MockFilterChain());

        assertThat(rejected.getStatus()).isEqualTo(429);
        assertThat(rejected.getHeader("Retry-After")).isEqualTo("60");
        assertThat(rejected.getContentAsString()).contains("RATE_LIMITED");
    }

    @Test
    void doesNotLimitUnrelatedEndpoints() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/listings");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getStatus()).isEqualTo(200);
    }

    private MockHttpServletRequest loginRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr("203.0.113.10");
        return request;
    }
}
