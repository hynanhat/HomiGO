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
    void anonymousUserCanBrowsePaginatedCurrentLocationHierarchy() throws Exception {
        mockMvc.perform(get("/api/v1/locations/provinces").param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.totalPages").value(2))
                .andExpect(jsonPath("$.data.content.length()").value(1));

        mockMvc.perform(get("/api/v1/locations/provinces/79/commune-units"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.content[0].provinceCode").value("79"));
    }

    @Test
    void inactiveUnitsAreHiddenAndRejectedForNewAddresses() throws Exception {
        mockMvc.perform(get("/api/v1/locations/provinces/99/commune-units"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errorCode").value("LOCATION_INACTIVE"));

        mockMvc.perform(get("/api/v1/locations/provinces/79/commune-units"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.content[?(@.code == '99998')]").isEmpty());
    }

    @Test
    void unknownParentReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/locations/provinces/98/commune-units"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("LOCATION_NOT_FOUND"));
    }

}
