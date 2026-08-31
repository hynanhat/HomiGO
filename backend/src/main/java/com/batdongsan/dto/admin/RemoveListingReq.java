package com.batdongsan.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class RemoveListingReq {
    @NotNull(message = "Phiên bản tin đăng không được để trống.")
    @PositiveOrZero(message = "Phiên bản tin đăng không hợp lệ.")
    private Long expectedVersion;

    @NotBlank(message = "Lý do gỡ tin không được để trống.")
    @Size(min = 5, max = 500, message = "Lý do gỡ tin phải có từ 5 đến 500 ký tự.")
    private String reason;

    public Long getExpectedVersion() { return expectedVersion; }
    public void setExpectedVersion(Long expectedVersion) { this.expectedVersion = expectedVersion; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason == null ? null : reason.trim(); }
}
