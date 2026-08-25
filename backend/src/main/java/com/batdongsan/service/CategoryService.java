package com.batdongsan.service;

import com.batdongsan.dto.category.CategoryRes;
import com.batdongsan.repository.CategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public Page<CategoryRes> getCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable).map(CategoryRes::new);
    }
}
