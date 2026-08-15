package com.batdongsan.service;

import com.batdongsan.dto.project.ProjectFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Sql("/db/project-browsing-fixture.sql")
class ProjectServiceTest {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void filtersProjectsByDistrictAndStatusWithoutReturningEntities() {
        ProjectFilter filter = new ProjectFilter();
        filter.setDistrictId(1311L);
        filter.setStatus("IN_PROGRESS");

        var page = projectService.getProjects(filter, PageRequest.of(0, 10));

        assertEquals(1, page.getTotalElements());
        assertEquals("riverside-residence", page.getContent().get(0).getSlug());
        assertEquals("Quận 1", page.getContent().get(0).getDistrictName());
    }

    @Test
    void publicApiIsPaginatedAndFilterable() throws Exception {
        mockMvc.perform(get("/api/v1/projects")
                        .param("districtId", "1311")
                        .param("status", "COMPLETED")
                        .param("page", "0")
                        .param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].slug").value("heritage-tower"));
    }

    @Test
    void detailUsesSlugAndContainsOnlyPublicListings() throws Exception {
        mockMvc.perform(get("/api/v1/projects/riverside-residence")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.slug").value("riverside-residence"))
                .andExpect(jsonPath("$.data.listings.totalElements").value(1))
                .andExpect(jsonPath("$.data.listings.content[0].publicCode").value("PROJECT-ACTIVE"));
    }

    @Test
    void invalidStatusAndUnknownSlugReturnStandardErrors() throws Exception {
        mockMvc.perform(get("/api/v1/projects").param("status", "BROKEN"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));

        mockMvc.perform(get("/api/v1/projects/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
    }
}
