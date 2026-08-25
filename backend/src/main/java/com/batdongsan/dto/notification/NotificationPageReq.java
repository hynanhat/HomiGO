package com.batdongsan.dto.notification;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class NotificationPageReq {
    @Min(value = 0, message = "Số trang phải lớn hơn hoặc bằng 0.")
    private int page;
    @Min(value = 1, message = "Kích thước trang phải từ 1 đến 100.")
    @Max(value = 100, message = "Kích thước trang phải từ 1 đến 100.")
    private int size = 20;
    private boolean unreadOnly;

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public boolean isUnreadOnly() { return unreadOnly; }
    public void setUnreadOnly(boolean unreadOnly) { this.unreadOnly = unreadOnly; }
}
