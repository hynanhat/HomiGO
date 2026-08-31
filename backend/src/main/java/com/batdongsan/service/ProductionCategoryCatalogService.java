package com.batdongsan.service;

import com.batdongsan.dto.admin.location.ProductionCategoryInitializationRes;
import com.batdongsan.entity.Category;
import com.batdongsan.entity.TransactionType;
import com.batdongsan.exception.ApiException;
import com.batdongsan.exception.ErrorCode;
import com.batdongsan.repository.CategoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductionCategoryCatalogService {
    public static final String VERSION = "categories-v1";
    private final CategoryRepository categories;
    private final ObjectMapper objectMapper;

    public ProductionCategoryCatalogService(CategoryRepository categories, ObjectMapper objectMapper) {
        this.categories = categories;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ProductionCategoryInitializationRes initialize(String version) {
        CategoryArtifact artifact = read(version);
        validate(artifact);
        List<Category> pending = new ArrayList<>();
        int unchanged = 0;
        for (CategoryItem item : artifact.categories()) {
            Category existing = categories.findBySlug(item.slug()).orElse(null);
            if (existing == null) {
                Category category = new Category();
                category.setSlug(item.slug());
                category.setName(item.name());
                category.setTransactionType(item.transactionType());
                pending.add(category);
            } else if (!existing.getName().equals(item.name())
                    || existing.getTransactionType() != item.transactionType()) {
                throw new ApiException(
                        ErrorCode.PRODUCTION_CATEGORY_CONFLICT,
                        "Danh mục có slug '" + item.slug() + "' đang mang ý nghĩa khác.");
            } else {
                unchanged++;
            }
        }
        categories.saveAll(pending);
        return new ProductionCategoryInitializationRes(version, 16, pending.size(), unchanged);
    }

    private CategoryArtifact read(String version) {
        if (!VERSION.equals(version)) {
            throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Không có catalog danh mục " + version + ".");
        }
        try {
            return objectMapper.readValue(
                    new ClassPathResource("production-data/categories-v1.json").getInputStream(),
                    CategoryArtifact.class);
        } catch (IOException exception) {
            throw new ApiException(ErrorCode.PRODUCTION_CATEGORY_CONFLICT, "Không thể đọc catalog danh mục production.");
        }
    }

    private void validate(CategoryArtifact artifact) {
        if (!VERSION.equals(artifact.version()) || artifact.categories() == null || artifact.categories().size() != 16) {
            throw new ApiException(ErrorCode.PRODUCTION_CATEGORY_CONFLICT, "Catalog production phải có đúng 16 danh mục.");
        }
        Set<String> slugs = new HashSet<>();
        int buyCount = 0;
        int rentCount = 0;
        for (CategoryItem item : artifact.categories()) {
            if (item.slug() == null || !item.slug().matches("[a-z0-9]+(?:-[a-z0-9]+)*")
                    || item.name() == null || item.name().isBlank() || item.transactionType() == null
                    || !slugs.add(item.slug())) {
                throw new ApiException(ErrorCode.PRODUCTION_CATEGORY_CONFLICT, "Catalog danh mục production không hợp lệ.");
            }
            if (item.transactionType() == TransactionType.BUY) buyCount++;
            if (item.transactionType() == TransactionType.RENT) rentCount++;
        }
        if (buyCount != 8 || rentCount != 8) {
            throw new ApiException(
                    ErrorCode.PRODUCTION_CATEGORY_CONFLICT,
                    "Catalog production phải có đúng 8 danh mục mua và 8 danh mục thuê.");
        }
    }

    private record CategoryArtifact(String version, List<CategoryItem> categories) {}
    private record CategoryItem(String slug, String name, TransactionType transactionType) {}
}
