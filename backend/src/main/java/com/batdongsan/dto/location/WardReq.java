package com.batdongsan.dto.location;

import jakarta.validation.constraints.*;

public class WardReq {
    @NotNull(message = "Quận/huyện không được để trống.")
    @Min(value = 1, message = "Mã quận/huyện phải lớn hơn 0.")
    private Long districtId;
    @NotBlank(message = "Tên phường/xã không được để trống.")
    @Size(max = 255, message = "Tên phường/xã không được vượt quá 255 ký tự.")
    private String name;
    @NotBlank(message = "Mã phường/xã không được để trống.")
    @Pattern(regexp = "[A-Za-z0-9-]+", message = "Mã phường/xã không hợp lệ.")
    @Size(max = 100, message = "Mã phường/xã không được vượt quá 100 ký tự.")
    private String code;

    public Long getDistrictId() { return districtId; }
    public void setDistrictId(Long districtId) { this.districtId = districtId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
