package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.AuthRes;
import com.batdongsan.dto.LoginReq;
import com.batdongsan.dto.PasswordChangeReq;
import com.batdongsan.dto.RefreshTokenReq;
import com.batdongsan.dto.RegisterReq;
import com.batdongsan.dto.TokenRefreshRes;
import com.batdongsan.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final long refreshExpiration;
    private final boolean secureCookie;
    private final String sameSite;

    public AuthController(
            AuthService authService,
            @Value("${jwt.refresh-expiration:604800000}") long refreshExpiration,
            @Value("${app.auth-cookie.secure:false}") boolean secureCookie,
            @Value("${app.auth-cookie.same-site:Strict}") String sameSite) {
        this.authService = authService;
        this.refreshExpiration = refreshExpiration;
        this.secureCookie = secureCookie;
        this.sameSite = sameSite;
    }

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản USER")
    public ResponseEntity<ApiResponse<AuthRes.UserDto>> register(@Valid @RequestBody RegisterReq req) {
        AuthRes.UserDto user = authService.register(req);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập và cấp access/refresh token")
    public ResponseEntity<ApiResponse<AuthRes>> login(@Valid @RequestBody LoginReq req) {
        AuthRes authRes = authService.login(req);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(authRes.getRefreshToken()).toString())
                .body(ApiResponse.success(authRes));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Xoay refresh token và cấp access token mới")
    public ResponseEntity<ApiResponse<TokenRefreshRes>> refresh(
            @CookieValue(name = "homigo_refresh", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Phiên đăng nhập không tồn tại hoặc đã hết hạn.", "AUTH_REFRESH_MISSING"));
        }
        TokenRefreshRes result = authService.refresh(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(result.getRefreshToken()).toString())
                .body(ApiResponse.success(result));
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất và thu hồi refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "homigo_refresh", required = false) String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken);
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredRefreshCookie().toString())
                .body(ApiResponse.success(null));
    }

    @PutMapping("/password")
    @Operation(summary = "Đổi mật khẩu và thu hồi các phiên hiện tại")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody PasswordChangeReq req) {
        authService.changePassword(authentication.getName(), req);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private ResponseCookie refreshCookie(String value) {
        return ResponseCookie.from("homigo_refresh", value)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSite)
                .path("/api/v1/auth")
                .maxAge(Duration.ofMillis(refreshExpiration))
                .build();
    }

    private ResponseCookie expiredRefreshCookie() {
        return ResponseCookie.from("homigo_refresh", "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSite)
                .path("/api/v1/auth")
                .maxAge(Duration.ZERO)
                .build();
    }
}
