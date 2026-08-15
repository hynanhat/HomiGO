package com.batdongsan.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Sql("/db/project-browsing-fixture.sql")
class LocationControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void anonymousUserCanBrowsePaginatedLocationHierarchy() throws Exception {
        mockMvc.perform(get("/api/v1/locations/provinces"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].name").value("TP.HCM"));

        mockMvc.perform(get("/api/v1/locations/provinces/1301/districts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.content[0].provinceId").value(1301));

        mockMvc.perform(get("/api/v1/locations/districts/1312/wards"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].code").value("PROJECT-THAO-DIEN"));
    }

    @Test
    void unknownParentReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/locations/provinces/999999/districts"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
    }
}
