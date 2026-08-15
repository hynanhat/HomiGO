package com.batdongsan.dto;

import jakarta.validation.constraints.NotBlank;

public class RefreshTokenReq {

    @NotBlank(message = "Refresh token không được để trống.")
    private String refreshToken;

    public RefreshTokenReq() {
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
