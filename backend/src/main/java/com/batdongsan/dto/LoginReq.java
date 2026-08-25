package com.batdongsan.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LoginReq {
    @NotBlank(message = "Email không được để trống.")
    @Email(message = "Email không hợp lệ.")
    @Size(max = 254, message = "Email không được vượt quá 254 ký tự.")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống.")
    @Size(max = 72, message = "Mật khẩu không được vượt quá 72 ký tự.")
    private String password;

    public LoginReq() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
