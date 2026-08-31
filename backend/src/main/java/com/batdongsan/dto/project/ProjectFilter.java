package com.batdongsan.dto.project;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.AssertTrue;

public class ProjectFilter {
    @Size(max = 100, message = "Từ khóa không được vượt quá 100 ký tự.")
    private String keyword;
    @Pattern(regexp = "\\d{2}", message = "Mã tỉnh/thành phố phải có 2 chữ số.")
    private String provinceCode;
    @Pattern(regexp = "\\d{5}", message = "Mã phường/xã/đặc khu phải có 5 chữ số.")
    private String communeCode;
    @Pattern(regexp = "PLANNING|IN_PROGRESS|COMPLETED|ON_HOLD",
            message = "Trạng thái dự án không hợp lệ.")
    private String status;

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
    public String getProvinceCode() { return provinceCode; }
    public void setProvinceCode(String provinceCode) { this.provinceCode = provinceCode; }
    public String getCommuneCode() { return communeCode; }
    public void setCommuneCode(String communeCode) { this.communeCode = communeCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @AssertTrue(message = "Vui lòng chọn tỉnh/thành phố trước khi lọc phường/xã/đặc khu.")
    public boolean isLocationHierarchyValid() { return communeCode == null || provinceCode != null; }
}
