package com.batdongsan.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class PageReq {

    @Min(value = 0, message = "Số trang phải lớn hơn hoặc bằng 0.")
    private int page = 0;

    @Min(value = 1, message = "Kích thước trang phải từ 1 đến 100.")
    @Max(value = 100, message = "Kích thước trang phải từ 1 đến 100.")
    private int size = 10;

    public PageReq() {
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }
}
