package com.batdongsan.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Base64;
import java.util.UUID;

@Service
public class VisitorCookieService {
    public static final String COOKIE_NAME = "homigo_visitor";

    private final byte[] secret;
    private final boolean secure;

    public VisitorCookieService(
            @Value("${analytics.viewer-hash-secret}") String secret,
            @Value("${app.auth-cookie.secure:false}") boolean secure) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.secure = secure;
    }

    public VisitorIdentity resolve(String cookieValue) {
        if (cookieValue != null) {
            String[] parts = cookieValue.split("\\.", 2);
            if (parts.length == 2 && validUuid(parts[0]) && validSignature(parts[0], parts[1])) {
                return new VisitorIdentity(parts[0], null);
            }
        }

        String visitorId = UUID.randomUUID().toString();
        String signedValue = visitorId + "." + signature(visitorId);
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, signedValue)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(365))
                .build();
        return new VisitorIdentity(visitorId, cookie);
    }

    private boolean validUuid(String value) {
        try {
            return UUID.fromString(value).toString().equals(value);
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private boolean validSignature(String visitorId, String suppliedSignature) {
        byte[] expected = signature(visitorId).getBytes(StandardCharsets.US_ASCII);
        byte[] supplied = suppliedSignature.getBytes(StandardCharsets.US_ASCII);
        return MessageDigest.isEqual(expected, supplied);
    }

    private String signature(String visitorId) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(visitorId.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Không thể ký mã khách xem.", exception);
        }
    }

    public record VisitorIdentity(String id, ResponseCookie cookie) {
    }
}
