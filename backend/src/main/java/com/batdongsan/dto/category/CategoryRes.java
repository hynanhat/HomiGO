package com.batdongsan.dto.category;

import com.batdongsan.entity.Category;
import com.batdongsan.entity.TransactionType;

public class CategoryRes {
    private final Long id;
    private final String name;
    private final String slug;
    private final TransactionType transactionType;

    public CategoryRes(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.slug = category.getSlug();
        this.transactionType = category.getTransactionType();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public TransactionType getTransactionType() { return transactionType; }
}
