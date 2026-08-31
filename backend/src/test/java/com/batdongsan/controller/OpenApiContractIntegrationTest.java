package com.batdongsan.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OpenApiContractIntegrationTest {
    @Autowired MockMvc mockMvc;

    @Test
    void generatedOpenApiExposesOnlyTheCurrentTwoLevelLocationContract() throws Exception {
        var result = mockMvc.perform(get("/v3/api-docs")).andExpect(status().isOk());

        String[] requiredPaths = {
                "/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/users/me",
                "/api/v1/listings", "/api/v1/listings/{publicCode}",
                "/api/v1/projects", "/api/v1/projects/{slug}",
                "/api/v1/locations/provinces",
                "/api/v1/locations/provinces/{provinceCode}/commune-units",
                "/api/v1/seller/listings", "/api/v1/seller/listings/{id}",
                "/api/v1/admin/listings", "/api/v1/admin/categories",
                "/api/v1/admin/projects", "/api/v1/admin/projects/{id}"
        };
        for (String path : requiredPaths) {
            result.andExpect(jsonPath("$.paths['" + path + "']").exists());
        }

        result.andExpect(jsonPath("$.paths['/api/v1/locations/provinces/{provinceId}/districts']").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/v1/locations/districts/{districtId}/wards']").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/v1/admin/locations/districts']").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/v1/admin/locations/wards']").doesNotExist());
    }
}
