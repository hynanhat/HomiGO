package com.batdongsan.dto.admin;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class ApproveListingReq {
    @NotNull(message = "Phiên bản tin đăng không được để trống.")
    @PositiveOrZero(message = "Phiên bản tin đăng không hợp lệ.")
    private Long expectedVersion;

    public Long getExpectedVersion() { return expectedVersion; }
    public void setExpectedVersion(Long expectedVersion) { this.expectedVersion = expectedVersion; }
}
