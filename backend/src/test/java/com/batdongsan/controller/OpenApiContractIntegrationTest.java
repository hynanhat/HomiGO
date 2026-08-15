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
    @Autowired
    private MockMvc mockMvc;

    @Test
    void generatedOpenApiContainsEveryPhaseEightContractPath() throws Exception {
        var result = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk());

        String[] paths = {
                "/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/refresh",
                "/api/v1/auth/logout", "/api/v1/auth/password", "/api/v1/users/me",
                "/api/v1/users/me/upgrade-seller",
                "/api/v1/listings", "/api/v1/listings/{publicCode}",
                "/api/v1/projects", "/api/v1/projects/{slug}",
                "/api/v1/locations/provinces",
                "/api/v1/locations/provinces/{provinceId}/districts",
                "/api/v1/locations/districts/{districtId}/wards",
                "/api/v1/seller/listings", "/api/v1/seller/listings/{id}",
                "/api/v1/seller/listings/{id}/submit", "/api/v1/seller/listings/{id}/deactivate",
                "/api/v1/seller/listings/{id}/images", "/api/v1/seller/listings/{id}/images/{imageId}",
                "/api/v1/saved-listings", "/api/v1/saved-listings/{listingId}",
                "/api/v1/admin/listings", "/api/v1/admin/listings/{id}/approve",
                "/api/v1/admin/listings/{id}/reject", "/api/v1/admin/users",
                "/api/v1/admin/users/{id}/ban", "/api/v1/admin/users/{id}/unban",
                "/api/v1/admin/categories", "/api/v1/admin/categories/{id}",
                "/api/v1/admin/projects", "/api/v1/admin/projects/{id}",
                "/api/v1/admin/locations/provinces", "/api/v1/admin/locations/provinces/{id}",
                "/api/v1/admin/locations/districts", "/api/v1/admin/locations/districts/{id}",
                "/api/v1/admin/locations/wards", "/api/v1/admin/locations/wards/{id}"
        };
        for (String path : paths) {
            result.andExpect(jsonPath("$.paths['" + path + "']").exists());
        }

        assertOperations(result, "get", new String[] {
                "/api/v1/users/me", "/api/v1/listings", "/api/v1/listings/{publicCode}",
                "/api/v1/projects", "/api/v1/projects/{slug}",
                "/api/v1/locations/provinces", "/api/v1/locations/provinces/{provinceId}/districts",
                "/api/v1/locations/districts/{districtId}/wards", "/api/v1/seller/listings",
                "/api/v1/seller/listings/{id}", "/api/v1/saved-listings",
                "/api/v1/admin/listings", "/api/v1/admin/users", "/api/v1/admin/categories",
                "/api/v1/admin/projects", "/api/v1/admin/locations/provinces",
                "/api/v1/admin/locations/districts", "/api/v1/admin/locations/wards"
        });
        assertOperations(result, "post", new String[] {
                "/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/refresh",
                "/api/v1/auth/logout", "/api/v1/users/me/upgrade-seller", "/api/v1/seller/listings",
                "/api/v1/seller/listings/{id}/submit", "/api/v1/seller/listings/{id}/deactivate",
                "/api/v1/seller/listings/{id}/images", "/api/v1/saved-listings/{listingId}",
                "/api/v1/admin/listings/{id}/approve", "/api/v1/admin/listings/{id}/reject",
                "/api/v1/admin/users/{id}/ban", "/api/v1/admin/users/{id}/unban",
                "/api/v1/admin/categories", "/api/v1/admin/projects",
                "/api/v1/admin/locations/provinces", "/api/v1/admin/locations/districts",
                "/api/v1/admin/locations/wards"
        });
        assertOperations(result, "put", new String[] {
                "/api/v1/auth/password", "/api/v1/users/me", "/api/v1/seller/listings/{id}",
                "/api/v1/admin/categories/{id}", "/api/v1/admin/projects/{id}",
                "/api/v1/admin/locations/provinces/{id}", "/api/v1/admin/locations/districts/{id}",
                "/api/v1/admin/locations/wards/{id}"
        });
        assertOperations(result, "delete", new String[] {
                "/api/v1/seller/listings/{id}", "/api/v1/seller/listings/{id}/images/{imageId}",
                "/api/v1/saved-listings/{listingId}", "/api/v1/admin/categories/{id}",
                "/api/v1/admin/projects/{id}", "/api/v1/admin/locations/provinces/{id}",
                "/api/v1/admin/locations/districts/{id}", "/api/v1/admin/locations/wards/{id}"
        });
    }

    private void assertOperations(org.springframework.test.web.servlet.ResultActions result,
                                  String method, String[] paths) throws Exception {
        for (String path : paths) {
            result.andExpect(jsonPath("$.paths['" + path + "']." + method).exists());
        }
    }
}
