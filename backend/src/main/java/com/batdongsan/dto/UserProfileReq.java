package com.batdongsan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UserProfileReq {

    @NotBlank(message = "Tên không được để trống.")
    @Size(max = 100, message = "Tên không được vượt quá 100 ký tự.")
    private String name;

    @Pattern(regexp = "^$|^\\+?[0-9]{9,15}$", message = "Số điện thoại không hợp lệ.")
    private String phone;

    public UserProfileReq() {
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
