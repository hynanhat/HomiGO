package com.batdongsan.dto.location;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProvinceReq {
    @NotBlank(message = "Tên tỉnh/thành phố không được để trống.")
    @Size(max = 255, message = "Tên tỉnh/thành phố không được vượt quá 255 ký tự.")
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
