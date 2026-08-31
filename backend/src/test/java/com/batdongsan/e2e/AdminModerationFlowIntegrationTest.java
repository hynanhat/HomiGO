package com.batdongsan.e2e;

import com.batdongsan.entity.*;
import com.batdongsan.repository.*;
import com.batdongsan.support.CurrentLocationTestData;
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

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AdminModerationFlowIntegrationTest {
    @Autowired MockMvc mvc; @Autowired UserRepository users;
    @Autowired AdministrativeDatasetReleaseRepository releases; @Autowired AdministrativeCatalogStateRepository catalogStates;
    @Autowired AdministrativeProvinceRepository provinces; @Autowired CommuneUnitRepository communes;
    @Autowired CategoryRepository categories; @Autowired ListingRepository listings;
    @Autowired RefreshTokenRepository refreshTokens; @Autowired ListingStatusHistoryRepository histories;
    private User seller; private Listing pending; private Listing rejectedCandidate;

    @BeforeEach
    void seed() {
        User admin=user("admin@homigo.test",UserRole.ADMIN);users.save(admin);
        seller=users.save(user("seller@homigo.test",UserRole.SELLER));
        var location=CurrentLocationTestData.seed("moderation-current", releases, catalogStates, provinces, communes);
        Category category=new Category();category.setName("Căn hộ");category.setSlug("can-ho-admin-e2e");category.setTransactionType(TransactionType.BUY);category=categories.save(category);
        pending=listings.save(listing("HMG-ADMIN-001","Tin chờ duyệt",location,category));
        rejectedCandidate=listings.save(listing("HMG-ADMIN-002","Tin cần từ chối",location,category));
    }

    @Test
    @WithMockUser(username="admin@homigo.test",roles="ADMIN")
    void adminApprovesRejectsAndBansWithAllRequiredSideEffects() throws Exception {
        mvc.perform(get("/api/v1/admin/listings")).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(2));
        mvc.perform(get("/api/v1/admin/listings/{id}", pending.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.listing.description").exists())
                .andExpect(jsonPath("$.data.seller.email").value(seller.getEmail()))
                .andExpect(jsonPath("$.data.history").isArray());
        mvc.perform(get("/api/v1/admin/listings").param("status","UNKNOWN"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errorCode").value("INVALID_ARGUMENT"));

        mvc.perform(post("/api/v1/admin/listings/{id}/approve",pending.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedVersion\":0}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("ACTIVE"));
        Listing approved=listings.findById(pending.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertNotNull(approved.getPublishedAt());
        org.junit.jupiter.api.Assertions.assertEquals(30,
                Duration.between(approved.getPublishedAt(),approved.getExpiresAt()).toDays());
        mvc.perform(get("/api/v1/listings/{publicCode}",pending.getPublicCode()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("ACTIVE"));

        mvc.perform(post("/api/v1/admin/listings/{id}/reject",rejectedCandidate.getId())
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));
        mvc.perform(post("/api/v1/admin/listings/{id}/reject",rejectedCandidate.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedVersion\":0,\"reason\":\"Thiếu giấy tờ pháp lý\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("REJECTED"))
                .andExpect(jsonPath("$.data.rejectionReason").value("Thiếu giấy tờ pháp lý"));

        RefreshToken token=new RefreshToken();token.setUser(seller);token.setTokenHash("b".repeat(64));
        token.setExpiresAt(LocalDateTime.now().plusDays(7));token=refreshTokens.save(token);
        mvc.perform(post("/api/v1/admin/users/{id}/ban",seller.getId())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"reason\":\"Đăng tin lừa đảo\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("BANNED"));

        org.junit.jupiter.api.Assertions.assertEquals(UserStatus.BANNED,users.findById(seller.getId()).orElseThrow().getStatus());
        org.junit.jupiter.api.Assertions.assertEquals(ListingStatus.INACTIVE,listings.findById(pending.getId()).orElseThrow().getStatus());
        org.junit.jupiter.api.Assertions.assertNotNull(refreshTokens.findById(token.getId()).orElseThrow().getRevokedAt());
        org.junit.jupiter.api.Assertions.assertEquals(3,histories.findAll().size());
        mvc.perform(get("/api/v1/listings/{publicCode}",pending.getPublicCode())).andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username="admin@homigo.test",roles="ADMIN")
    void adminRemovesAnActiveListingWithAuditAndPublicExclusion() throws Exception {
        mvc.perform(post("/api/v1/admin/listings/{id}/approve", pending.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedVersion\":0}"))
                .andExpect(status().isOk());
        Listing active = listings.findById(pending.getId()).orElseThrow();

        mvc.perform(post("/api/v1/admin/listings/{id}/remove", pending.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedVersion\":" + active.getVersion()
                                + ",\"reason\":\"  a  \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));

        mvc.perform(post("/api/v1/admin/listings/{id}/remove", pending.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedVersion\":" + active.getVersion()
                                + ",\"reason\":\"Nội dung vi phạm chính sách nền tảng\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REMOVED"));

        Listing removed = listings.findById(pending.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(ListingStatus.REMOVED, removed.getStatus());
        org.junit.jupiter.api.Assertions.assertEquals(
                "Nội dung vi phạm chính sách nền tảng", removed.getRemovalReason());
        org.junit.jupiter.api.Assertions.assertNotNull(removed.getRemovedAt());
        org.junit.jupiter.api.Assertions.assertEquals(2, histories.findAll().size());
        mvc.perform(get("/api/v1/listings/{publicCode}", pending.getPublicCode()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username="seller@homigo.test",roles="SELLER")
    void sellerCannotAccessModerationQueue() throws Exception {
        mvc.perform(get("/api/v1/admin/listings"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.errorCode").value("ACCESS_DENIED"));
        mvc.perform(get("/api/v1/admin/listings/{id}", pending.getId()))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.errorCode").value("ACCESS_DENIED"));
    }

    private User user(String email,UserRole role){User user=new User();user.setName(role.name());user.setEmail(email);
        user.setPasswordHash("hash");user.setRole(role);user.setStatus(UserStatus.ACTIVE);return user;}
    private Listing listing(String code,String title,CurrentLocationTestData.Address location,Category category){Listing listing=new Listing();listing.setPublicCode(code);
        listing.setUser(seller);listing.setCategory(category);listing.setAdministrativeProvince(location.province());
        listing.setCommuneUnit(location.commune());listing.setTitle(title);listing.setDescription("Mô tả đầy đủ");
        listing.setPrice(BigDecimal.valueOf(2_000_000_000L));listing.setArea(80.0);listing.setAddress("123 Nguyễn Huệ");
        listing.setContactName("Seller");listing.setContactPhone("0901234567");listing.setStatus(ListingStatus.PENDING);return listing;}
}
