package com.batdongsan.dto.admin.location;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CatalogStatusReq {
    @NotBlank(message = "Trạng thái không được để trống.")
    private String status;

    @NotBlank(message = "Lý do thay đổi không được để trống.")
    @Size(max = 1000, message = "Lý do thay đổi không được vượt quá 1000 ký tự.")
    private String note;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
