package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.PageReq;
import com.batdongsan.dto.PageResponse;
import com.batdongsan.dto.category.CategoryRes;
import com.batdongsan.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CategoryRes>>> getCategories(
            @Valid @ModelAttribute PageReq pageReq) {
        PageRequest pageable = PageRequest.of(
                pageReq.getPage(),
                pageReq.getSize(),
                Sort.by(Sort.Order.asc("name"), Sort.Order.asc("id")));
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(categoryService.getCategories(pageable))));
    }
}
