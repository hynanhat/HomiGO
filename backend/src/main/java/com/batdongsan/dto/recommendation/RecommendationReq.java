package com.batdongsan.dto.recommendation;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class RecommendationReq {
    @Min(value = 1, message = "Số lượng gợi ý phải từ 1 đến 12.")
    @Max(value = 12, message = "Số lượng gợi ý phải từ 1 đến 12.")
    private int size = 6;

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}
