package com.batdongsan.controller;

import com.batdongsan.entity.*;
import com.batdongsan.repository.*;
import com.batdongsan.support.CurrentLocationTestData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RecommendationControllerIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired UserRepository users;
    @Autowired CategoryRepository categories;
    @Autowired AdministrativeDatasetReleaseRepository releases;
    @Autowired AdministrativeCatalogStateRepository catalogStates;
    @Autowired AdministrativeProvinceRepository provinces;
    @Autowired CommuneUnitRepository communes;
    @Autowired ListingRepository listings;

    private Listing target;

    @BeforeEach
    void setUp() {
        User seller = new User(); seller.setName("Seller"); seller.setEmail("recommend-seller@homigo.test");
        seller.setPasswordHash("hash"); seller.setRole(UserRole.SELLER); seller.setStatus(UserStatus.ACTIVE); seller = users.save(seller);
        Category category = new Category(); category.setName("Nhà phố"); category.setSlug("recommend-nha-pho");
        category.setTransactionType(TransactionType.BUY); category = categories.save(category);
        var location = CurrentLocationTestData.seed(
                "recommend-current", releases, catalogStates, provinces, communes);
        target = listing("HMG-RECOMMEND01", seller, category, location, 5_000_000_000L); target = listings.save(target);
        listings.save(listing("HMG-RECOMMEND02", seller, category, location, 5_200_000_000L));
    }

    @Test
    void anonymousUserGetsRankedRecommendations() throws Exception {
        mockMvc.perform(get("/api/v1/listings/{code}/recommendations", target.getPublicCode()).param("size", "6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].listing.publicCode").value("HMG-RECOMMEND02"))
                .andExpect(jsonPath("$.data[0].score").isNumber())
                .andExpect(jsonPath("$.data[0].reasons").isArray());
    }

    @Test
    void invalidRecommendationSizeReturnsValidationEnvelope() throws Exception {
        mockMvc.perform(get("/api/v1/listings/{code}/recommendations", target.getPublicCode()).param("size", "13"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));
    }

    private Listing listing(String code, User seller, Category category,
                            CurrentLocationTestData.Address location, long price) {
        Listing listing = new Listing(); listing.setPublicCode(code); listing.setUser(seller); listing.setCategory(category);
        listing.setAdministrativeProvince(location.province()); listing.setCommuneUnit(location.commune());
        listing.setTitle("Tin " + code); listing.setDescription("Mô tả đầy đủ");
        listing.setPrice(BigDecimal.valueOf(price)); listing.setArea(90.0); listing.setAddress("Địa chỉ");
        listing.setContactName("Seller"); listing.setContactPhone("0901234567"); listing.setStatus(ListingStatus.ACTIVE);
        listing.setPublishedAt(LocalDateTime.now()); listing.setExpiresAt(LocalDateTime.now().plusDays(30)); return listing;
    }
}
