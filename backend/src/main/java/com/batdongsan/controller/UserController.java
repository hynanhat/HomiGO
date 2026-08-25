package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.UserProfileReq;
import com.batdongsan.dto.UserProfileRes;
import com.batdongsan.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User profile", description = "Quản lý hồ sơ và vai trò người dùng")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Xem hồ sơ của người dùng hiện tại")
    public ResponseEntity<ApiResponse<UserProfileRes>> getProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getProfile(authentication.getName())));
    }

    @PutMapping("/me")
    @Operation(summary = "Cập nhật hồ sơ của người dùng hiện tại")
    public ResponseEntity<ApiResponse<UserProfileRes>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserProfileReq req) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateProfile(authentication.getName(), req)));
    }

}
