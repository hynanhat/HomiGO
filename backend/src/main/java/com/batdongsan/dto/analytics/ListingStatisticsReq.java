package com.batdongsan.dto.analytics;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class ListingStatisticsReq {
    @Min(value = 7, message = "Khoảng thống kê phải từ 7 đến 90 ngày.")
    @Max(value = 90, message = "Khoảng thống kê phải từ 7 đến 90 ngày.")
    private int days = 30;

    public int getDays() { return days; }
    public void setDays(int days) { this.days = days; }
}
