package com.batdongsan.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BanUserReq {
    @NotBlank(message = "Lý do khóa tài khoản không được để trống.")
    @Size(max = 1000, message = "Lý do khóa tài khoản không được vượt quá 1000 ký tự.")
    private String reason;
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
