package com.batdongsan.e2e;

import com.batdongsan.dto.ListingFilter;
import com.batdongsan.service.ListingService;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties="spring.jpa.properties.hibernate.generate_statistics=true")
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Sql("/db/listing-search-fixture.sql")
class PublicListingSearchIntegrationTest {
    @Autowired MockMvc mvc; @Autowired ListingService listingService; @Autowired EntityManagerFactory entityManagerFactory;

    @Test
    void combinedFiltersAndSortReturnOnlyExactMatches() throws Exception {
        mvc.perform(get("/api/v1/listings")
                        .param("keyword","căn hộ").param("transactionType","BUY").param("provinceCode","79")
                        .param("communeCode","26734").param("categoryId","2001").param("minPrice","2000000000")
                        .param("maxPrice","6000000000").param("minArea","70").param("maxArea","120")
                        .param("bedrooms","3").param("minLat","10.77").param("maxLat","10.79")
                        .param("minLng","106.69").param("maxLng","106.71").param("sort","priceAsc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.content[0].publicCode").value("SEARCH-001"))
                .andExpect(jsonPath("$.data.content[1].publicCode").value("SEARCH-009"));
    }

    @Test
    void detailUsesPublicCodeAndNeverExposesExpiredOrPendingListings() throws Exception {
        mvc.perform(get("/api/v1/listings/SEARCH-001")).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.publicCode").value("SEARCH-001"))
                .andExpect(jsonPath("$.data.provinceCode").value("79"))
                .andExpect(jsonPath("$.data.communeCode").value("26734"))
                .andExpect(jsonPath("$.data.districtName").doesNotExist());
        mvc.perform(get("/api/v1/listings/SEARCH-025")).andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/listings/SEARCH-027")).andExpect(status().isNotFound());
    }

    @Test
    void invalidRangesPartialBoundsAndUnknownSortReturnValidationErrors() throws Exception {
        mvc.perform(get("/api/v1/listings").param("minPrice","500").param("maxPrice","100"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));
        mvc.perform(get("/api/v1/listings").param("minLat","10").param("maxLat","11"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));
        mvc.perform(get("/api/v1/listings").param("sort","titleAsc"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));
    }

    @Test
    void firstPageMappingUsesAtMostThreeSelectsInsteadOfPerListingQueries() {
        SessionFactory sessionFactory=entityManagerFactory.unwrap(SessionFactory.class);
        sessionFactory.getStatistics().clear();
        var result=listingService.searchListings(new ListingFilter(),PageRequest.of(0,10));
        assertTrue(result.hasContent());
        long statements=sessionFactory.getStatistics().getPrepareStatementCount();
        assertTrue(statements<=3,"Expected page, count and one batched image query; actual statements: "+statements);
    }
}
