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

import static org.junit.jupiter.api.Assertions.assertTrue;
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
    @Autowired private ProvinceRepository provinces;
    @Autowired private DistrictRepository districts;
    @Autowired private WardRepository wards;

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
        String request = projectJson("admin-project", 1311, 13111);
        mockMvc.perform(post("/api/v1/admin/projects").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.slug").value("admin-project"));
        Long id = projects.findBySlug("admin-project").orElseThrow().getId();

        mockMvc.perform(put("/api/v1/admin/projects/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectJson("admin-project-updated", 1311, 13111)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.slug").value("admin-project-updated"));
        mockMvc.perform(post("/api/v1/admin/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectJson("wrong-location", 1311, 13121)))
                .andExpect(status().isBadRequest());
        mockMvc.perform(delete("/api/v1/admin/projects/{id}", id)).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanCrudLocationHierarchy() throws Exception {
        mockMvc.perform(post("/api/v1/admin/locations/provinces")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Đà Nẵng\"}"))
                .andExpect(status().isOk());
        Long provinceId = provinces.findAll().stream().filter(p -> p.getName().equals("Đà Nẵng"))
                .findFirst().orElseThrow().getId();

        mockMvc.perform(post("/api/v1/admin/locations/districts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"provinceId\":" + provinceId + ",\"name\":\"Hải Châu\"}"))
                .andExpect(status().isOk());
        Long districtId = districts.findAll().stream().filter(d -> d.getName().equals("Hải Châu"))
                .findFirst().orElseThrow().getId();

        mockMvc.perform(post("/api/v1/admin/locations/wards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"districtId\":" + districtId + ",\"name\":\"Thạch Thang\",\"code\":\"ADMIN-THACH-THANG\"}"))
                .andExpect(status().isOk());
        Long wardId = wards.findAll().stream().filter(w -> w.getCode().equals("ADMIN-THACH-THANG"))
                .findFirst().orElseThrow().getId();

        mockMvc.perform(get("/api/v1/admin/locations/wards"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(3));
        mockMvc.perform(delete("/api/v1/admin/locations/wards/{id}", wardId)).andExpect(status().isOk());
        mockMvc.perform(delete("/api/v1/admin/locations/districts/{id}", districtId)).andExpect(status().isOk());
        mockMvc.perform(delete("/api/v1/admin/locations/provinces/{id}", provinceId)).andExpect(status().isOk());
        assertTrue(provinces.findById(provinceId).isEmpty());
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
        mockMvc.perform(post("/api/v1/admin/locations/provinces")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Không hợp lệ\"}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.errorCode").value("ACCESS_DENIED"));
    }

    private String projectJson(String slug, long districtId, long wardId) {
        return """
                {"name":"Admin Project","slug":"%s","investor":"Admin Investor",
                 "districtId":%d,"wardId":%d,"address":"10 Test Street",
                 "latitude":10.77,"longitude":106.70,"status":"IN_PROGRESS",
                 "description":"Dự án dùng để kiểm thử CRUD.",
                 "priceFrom":2000000000,"priceTo":5000000000}
                """.formatted(slug, districtId, wardId);
    }
}
