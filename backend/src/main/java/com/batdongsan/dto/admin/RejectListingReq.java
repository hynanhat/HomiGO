package com.batdongsan.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class RejectListingReq {
    @NotNull(message = "Phiên bản tin đăng không được để trống.")
    @PositiveOrZero(message = "Phiên bản tin đăng không hợp lệ.")
    private Long expectedVersion;

    @NotBlank(message = "Lý do từ chối không được để trống.")
    @Size(max = 1000, message = "Lý do từ chối không được vượt quá 1000 ký tự.")
    private String reason;
    public Long getExpectedVersion() { return expectedVersion; }
    public void setExpectedVersion(Long expectedVersion) { this.expectedVersion = expectedVersion; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason == null ? null : reason.trim(); }
}
