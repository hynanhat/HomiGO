package com.batdongsan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PasswordChangeReq {
    @NotBlank(message = "Mật khẩu hiện tại không được để trống.")
    @Size(max = 72, message = "Mật khẩu hiện tại không được vượt quá 72 ký tự.")
    private String currentPassword;

    @NotBlank(message = "Mật khẩu mới không được để trống.")
    @Size(min = 12, max = 72, message = "Mật khẩu mới phải có từ 12 đến 72 ký tự.")
    private String newPassword;

    public PasswordChangeReq() {}

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
