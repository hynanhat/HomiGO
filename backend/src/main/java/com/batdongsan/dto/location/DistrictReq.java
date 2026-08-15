package com.batdongsan.dto.location;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class DistrictReq {
    @NotNull(message = "Tỉnh/thành phố không được để trống.")
    @Min(value = 1, message = "Mã tỉnh/thành phố phải lớn hơn 0.")
    private Long provinceId;
    @NotBlank(message = "Tên quận/huyện không được để trống.")
    @Size(max = 255, message = "Tên quận/huyện không được vượt quá 255 ký tự.")
    private String name;

    public Long getProvinceId() { return provinceId; }
    public void setProvinceId(Long provinceId) { this.provinceId = provinceId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
