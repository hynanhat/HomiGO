package com.batdongsan.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class TokenRefreshRes {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private AuthRes.UserDto user;

    public TokenRefreshRes() {
    }

    public TokenRefreshRes(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public TokenRefreshRes(String accessToken, String refreshToken, AuthRes.UserDto user) {
        this(accessToken, refreshToken);
        this.user = user;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    @JsonIgnore
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public AuthRes.UserDto getUser() { return user; }
    public void setUser(AuthRes.UserDto user) { this.user = user; }
}
