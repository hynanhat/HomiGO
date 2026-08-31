package com.batdongsan.controller;

import com.batdongsan.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Sql("/db/project-browsing-fixture.sql")
class AdminMasterDataIntegrationTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private CategoryRepository categories;
    @Autowired private ProjectRepository projects;

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanCreateUpdateListAndDeleteCategories() throws Exception {
        String request = """
                {"name":"Đất nền","slug":"admin-dat-nen","transactionType":"BUY"}
                """;
        mockMvc.perform(post("/api/v1/admin/categories").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.slug").value("admin-dat-nen"));
        mockMvc.perform(post("/api/v1/admin/categories").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.errorCode").value("CONFLICT"));

        Long id = categories.findBySlug("admin-dat-nen").orElseThrow().getId();
        mockMvc.perform(put("/api/v1/admin/categories/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Đất nền mới","slug":"admin-dat-nen-moi","transactionType":"BUY"}
                                """))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.name").value("Đất nền mới"));
        mockMvc.perform(get("/api/v1/admin/categories"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(2));
        mockMvc.perform(delete("/api/v1/admin/categories/{id}", id)).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanCreateUpdateAndDeleteProjectWithValidatedRelationships() throws Exception {
        String request = projectJson("admin-project", "79", "26734");
        mockMvc.perform(post("/api/v1/admin/projects").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.slug").value("admin-project"));
        Long id = projects.findBySlug("admin-project").orElseThrow().getId();

        mockMvc.perform(put("/api/v1/admin/projects/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectJson("admin-project-updated", "79", "26734")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.slug").value("admin-project-updated"));
        mockMvc.perform(post("/api/v1/admin/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectJson("wrong-location", "01", "26734")))
                .andExpect(status().isBadRequest());
        mockMvc.perform(delete("/api/v1/admin/projects/{id}", id)).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void invalidMasterDataIsRejectedByBeanValidation() throws Exception {
        mockMvc.perform(post("/api/v1/admin/categories")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void nonAdminCannotMutateMasterData() throws Exception {
        mockMvc.perform(post("/api/v1/admin/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectJson("forbidden-project", "79", "26734")))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.errorCode").value("ACCESS_DENIED"));
    }

    private String projectJson(String slug, String provinceCode, String communeCode) {
        return """
                {"name":"Admin Project","slug":"%s","investor":"Admin Investor",
                 "provinceCode":"%s","communeCode":"%s","address":"10 Test Street",
                 "latitude":10.77,"longitude":106.70,"status":"IN_PROGRESS",
                 "description":"Dự án dùng để kiểm thử CRUD.",
                 "priceFrom":2000000000,"priceTo":5000000000}
                """.formatted(slug, provinceCode, communeCode);
    }
}
