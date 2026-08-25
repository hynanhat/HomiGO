package com.batdongsan.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private static final long WINDOW_MILLIS = 60_000L;

    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final AtomicLong requestCounter = new AtomicLong();
    private final Clock clock;
    private final int loginLimit;
    private final int registerLimit;
    private final int refreshLimit;
    private final int viewLimit;
    private final int ipnLimit;

    @Autowired
    public RateLimitFilter(
            @Value("${app.rate-limit.login-per-minute:10}") int loginLimit,
            @Value("${app.rate-limit.register-per-minute:5}") int registerLimit,
            @Value("${app.rate-limit.refresh-per-minute:30}") int refreshLimit,
            @Value("${app.rate-limit.views-per-minute:60}") int viewLimit,
            @Value("${app.rate-limit.ipn-per-minute:120}") int ipnLimit) {
        this(Clock.systemUTC(), loginLimit, registerLimit, refreshLimit, viewLimit, ipnLimit);
    }

    RateLimitFilter(Clock clock, int loginLimit, int registerLimit,
                    int refreshLimit, int viewLimit, int ipnLimit) {
        this.clock = clock;
        this.loginLimit = loginLimit;
        this.registerLimit = registerLimit;
        this.refreshLimit = refreshLimit;
        this.viewLimit = viewLimit;
        this.ipnLimit = ipnLimit;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Limit limit = limitFor(request);
        if (limit == null) {
            chain.doFilter(request, response);
            return;
        }

        long now = clock.millis();
        String key = limit.key() + ':' + request.getRemoteAddr();
        Window window = windows.computeIfAbsent(key, ignored -> new Window(now));
        boolean allowed;
        synchronized (window) {
            if (now - window.startedAt >= WINDOW_MILLIS) {
                window.startedAt = now;
                window.count = 0;
            }
            allowed = ++window.count <= limit.requests();
        }

        if ((requestCounter.incrementAndGet() & 1023) == 0) {
            windows.entrySet().removeIf(entry -> now - entry.getValue().startedAt >= WINDOW_MILLIS * 2);
        }

        if (!allowed) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setHeader("Retry-After", "60");
            response.getWriter().write("{\"success\":false,\"data\":null,"
                    + "\"message\":\"Bạn thao tác quá nhanh. Vui lòng thử lại sau một phút.\","
                    + "\"errorCode\":\"RATE_LIMITED\"}");
            return;
        }
        chain.doFilter(request, response);
    }

    private Limit limitFor(HttpServletRequest request) {
        if (!"POST".equals(request.getMethod())) return null;
        String path = request.getRequestURI();
        if (path.equals("/api/v1/auth/login")) return new Limit("login", loginLimit);
        if (path.equals("/api/v1/auth/register")) return new Limit("register", registerLimit);
        if (path.equals("/api/v1/auth/refresh")) return new Limit("refresh", refreshLimit);
        if (path.equals("/api/v1/payments/sepay/ipn")) return new Limit("ipn", ipnLimit);
        if (path.matches("/api/v1/listings/[^/]+/views")) return new Limit("views", viewLimit);
        return null;
    }

    private record Limit(String key, int requests) {
    }

    private static final class Window {
        private long startedAt;
        private int count;

        private Window(long startedAt) {
            this.startedAt = startedAt;
        }
    }
}
