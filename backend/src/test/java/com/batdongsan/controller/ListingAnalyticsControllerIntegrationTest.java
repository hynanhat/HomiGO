package com.batdongsan.controller;

import com.batdongsan.entity.*;
import com.batdongsan.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import jakarta.servlet.http.Cookie;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ListingAnalyticsControllerIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired UserRepository users;
    @Autowired CategoryRepository categories;
    @Autowired ProvinceRepository provinces;
    @Autowired DistrictRepository districts;
    @Autowired ListingRepository listings;

    private Listing listing;

    @BeforeEach
    void setUp() {
        User owner = saveUser("analytics-owner@homigo.test", UserRole.SELLER);
        saveUser("analytics-other@homigo.test", UserRole.SELLER);
        Category category = new Category(); category.setName("Căn hộ"); category.setSlug("analytics-can-ho");
        category.setTransactionType(TransactionType.BUY); category = categories.save(category);
        Province province = new Province(); province.setName("TP. Hồ Chí Minh"); province = provinces.save(province);
        District district = new District(); district.setName("Quận 1"); district.setProvince(province); district = districts.save(district);

        listing = new Listing(); listing.setPublicCode("HMG-ANALYTICS01"); listing.setUser(owner);
        listing.setCategory(category); listing.setDistrict(district); listing.setTitle("Căn hộ thống kê");
        listing.setDescription("Mô tả đầy đủ"); listing.setPrice(BigDecimal.valueOf(3_000_000_000L));
        listing.setArea(70.0); listing.setAddress("1 Nguyễn Huệ"); listing.setContactName("Chủ tin");
        listing.setContactPhone("0901234567"); listing.setStatus(ListingStatus.ACTIVE);
        listing.setPublishedAt(LocalDateTime.now()); listing.setExpiresAt(LocalDateTime.now().plusDays(30));
        listing = listings.save(listing);
    }

    @Test
    void publicRecordingIsIdempotentAndRejectsForgedVisitorIdentity() throws Exception {
        MvcResult firstView = mockMvc.perform(post("/api/v1/listings/{code}/views", listing.getPublicCode()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.recorded").value(true))
                .andReturn();
        Cookie visitorCookie = firstView.getResponse().getCookie("homigo_visitor");

        mockMvc.perform(post("/api/v1/listings/{code}/views", listing.getPublicCode())
                        .cookie(visitorCookie))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.recorded").value(false));

        mockMvc.perform(post("/api/v1/listings/{code}/views", listing.getPublicCode())
                        .cookie(new Cookie("homigo_visitor", "forged.identity")))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("homigo_visitor"));
    }

    @Test
    @WithMockUser(username = "analytics-owner@homigo.test", roles = "SELLER")
    void ownerCanReadZeroFilledStatistics() throws Exception {
        mockMvc.perform(get("/api/v1/seller/listings/{id}/statistics", listing.getId()).param("days", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.periodDays").value(7))
                .andExpect(jsonPath("$.data.dailyViews.length()").value(7));
    }

    @Test
    @WithMockUser(username = "analytics-other@homigo.test", roles = "SELLER")
    void anotherSellerCannotReadStatistics() throws Exception {
        mockMvc.perform(get("/api/v1/seller/listings/{id}/statistics", listing.getId()))
                .andExpect(status().isForbidden());
    }

    private User saveUser(String email, UserRole role) {
        User user = new User(); user.setName("Analytics User"); user.setEmail(email); user.setPasswordHash("hash");
        user.setRole(role); user.setStatus(UserStatus.ACTIVE); return users.save(user);
    }
}
