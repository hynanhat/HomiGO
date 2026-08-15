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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
        return ResponseEntity.ok(ApiResponse.success(authRes));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Xoay refresh token và cấp access token mới")
    public ResponseEntity<ApiResponse<TokenRefreshRes>> refresh(
            @Valid @RequestBody RefreshTokenReq req) {
        return ResponseEntity.ok(ApiResponse.success(authService.refresh(req)));
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất và thu hồi refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(
            Authentication authentication,
            @Valid @RequestBody RefreshTokenReq req) {
        authService.logout(authentication.getName(), req);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/password")
    @Operation(summary = "Đổi mật khẩu và thu hồi các phiên hiện tại")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody PasswordChangeReq req) {
        authService.changePassword(authentication.getName(), req);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
