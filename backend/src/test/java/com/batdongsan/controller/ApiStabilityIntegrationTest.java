package com.batdongsan.controller;

import com.batdongsan.repository.AdministrativeCatalogStateRepository;
import com.batdongsan.repository.AdministrativeDatasetReleaseRepository;
import com.batdongsan.repository.AdministrativeProvinceRepository;
import com.batdongsan.repository.CommuneUnitRepository;
import com.batdongsan.support.CurrentLocationTestData;
import org.junit.jupiter.api.BeforeEach;
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
class ApiStabilityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AdministrativeDatasetReleaseRepository releases;
    @Autowired
    private AdministrativeCatalogStateRepository catalogStates;
    @Autowired
    private AdministrativeProvinceRepository provinces;
    @Autowired
    private CommuneUnitRepository communes;

    @BeforeEach
    void seedCurrentCatalog() {
        CurrentLocationTestData.seed("api-stability", releases, catalogStates, provinces, communes);
    }

    @Test
    void unknownPublicApiRouteReturnsStandardNotFoundResponse() throws Exception {
        mockMvc.perform(get("/api/v1/listings/unknown/nested/route"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Không tìm thấy tài nguyên."));
    }

    @Test
    void paginatedEndpointReturnsStableMetadataWithoutSpringInternals() throws Exception {
        mockMvc.perform(get("/api/v1/locations/provinces?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.number").value(0))
                .andExpect(jsonPath("$.data.size").value(10))
                .andExpect(jsonPath("$.data.totalElements").isNumber())
                .andExpect(jsonPath("$.data.totalPages").isNumber())
                .andExpect(jsonPath("$.data.numberOfElements").isNumber())
                .andExpect(jsonPath("$.data.first").isBoolean())
                .andExpect(jsonPath("$.data.last").isBoolean())
                .andExpect(jsonPath("$.data.empty").isBoolean())
                .andExpect(jsonPath("$.data.pageable").doesNotExist())
                .andExpect(jsonPath("$.data.sort").doesNotExist());
    }
}
