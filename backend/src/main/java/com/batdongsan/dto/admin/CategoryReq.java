package com.batdongsan.dto.admin;

import com.batdongsan.entity.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CategoryReq {
    @NotBlank(message = "Tên danh mục không được để trống.")
    @Size(max = 255, message = "Tên danh mục không được vượt quá 255 ký tự.")
    private String name;
    @NotBlank(message = "Slug danh mục không được để trống.")
    @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*", message = "Slug danh mục không hợp lệ.")
    private String slug;
    @NotNull(message = "Loại giao dịch không được để trống.")
    private TransactionType transactionType;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType transactionType) { this.transactionType = transactionType; }
}
