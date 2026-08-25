package com.batdongsan.controller;

import com.batdongsan.entity.Category;
import com.batdongsan.entity.TransactionType;
import com.batdongsan.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CategoryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void anonymousUserCanBrowseCategoriesWithStablePagination() throws Exception {
        saveCategory("Can ho", "public-can-ho", TransactionType.BUY);
        saveCategory("Dat nen", "public-dat-nen", TransactionType.BUY);
        saveCategory("Nha pho", "public-nha-pho", TransactionType.RENT);

        mockMvc.perform(get("/api/v1/categories").param("page", "0").param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.errorCode").isEmpty())
                .andExpect(jsonPath("$.data.number").value(0))
                .andExpect(jsonPath("$.data.size").value(2))
                .andExpect(jsonPath("$.data.totalElements").value(3))
                .andExpect(jsonPath("$.data.totalPages").value(2))
                .andExpect(jsonPath("$.data.first").value(true))
                .andExpect(jsonPath("$.data.last").value(false))
                .andExpect(jsonPath("$.data.content[0].slug").value("public-can-ho"))
                .andExpect(jsonPath("$.data.content[1].transactionType").value("BUY"));

        mockMvc.perform(get("/api/v1/categories").param("page", "1").param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].slug").value("public-nha-pho"))
                .andExpect(jsonPath("$.data.last").value(true));
    }

    @Test
    void invalidPublicCategoryPaginationReturnsValidationEnvelope() throws Exception {
        mockMvc.perform(get("/api/v1/categories").param("size", "101"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));
    }

    private void saveCategory(String name, String slug, TransactionType transactionType) {
        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        category.setTransactionType(transactionType);
        categoryRepository.save(category);
    }
}
