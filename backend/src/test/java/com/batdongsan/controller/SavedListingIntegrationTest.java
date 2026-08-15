package com.batdongsan.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Sql("/db/listing-search-fixture.sql")
class SavedListingIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void savedListingEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/saved-listings"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
        mockMvc.perform(post("/api/v1/saved-listings/3001"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/v1/saved-listings/3001"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "search-seller@homigo.test", roles = "SELLER")
    void duplicateSaveIsIdempotentAndListIsPaginated() throws Exception {
        mockMvc.perform(post("/api/v1/saved-listings/3001")).andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/saved-listings/3001")).andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/saved-listings").param("page", "0").param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].publicCode").value("SEARCH-001"));

        mockMvc.perform(delete("/api/v1/saved-listings/3001")).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/saved-listings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    @WithMockUser(username = "search-seller@homigo.test", roles = "SELLER")
    void cannotSaveExpiredOrPendingListing() throws Exception {
        mockMvc.perform(post("/api/v1/saved-listings/3025"))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/api/v1/saved-listings/3027"))
                .andExpect(status().isNotFound());
    }
}
