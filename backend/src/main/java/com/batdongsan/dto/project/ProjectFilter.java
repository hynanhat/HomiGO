package com.batdongsan.dto.project;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ProjectFilter {
    @Size(max = 100, message = "Từ khóa không được vượt quá 100 ký tự.")
    private String keyword;
    @Min(value = 1, message = "Mã quận/huyện phải lớn hơn 0.")
    private Long districtId;
    @Pattern(regexp = "PLANNING|IN_PROGRESS|COMPLETED|ON_HOLD",
            message = "Trạng thái dự án không hợp lệ.")
    private String status;

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
    public Long getDistrictId() { return districtId; }
    public void setDistrictId(Long districtId) { this.districtId = districtId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
