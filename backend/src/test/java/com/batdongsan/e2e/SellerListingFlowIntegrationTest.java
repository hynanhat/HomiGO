package com.batdongsan.e2e;

import com.batdongsan.entity.*;
import com.batdongsan.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "file.upload-dir=target/test-uploads")
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SellerListingFlowIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users; @Autowired CategoryRepository categories; @Autowired ListingRepository listings;
    @Autowired ListingImageRepository listingImages;
    @Autowired AdministrativeDatasetReleaseRepository datasetReleases;
    @Autowired AdministrativeCatalogStateRepository catalogStates;
    @Autowired AdministrativeProvinceRepository administrativeProvinces;
    @Autowired CommuneUnitRepository communeUnits;

    @BeforeEach
    void seed() {
        User owner=new User();owner.setName("Seller One");owner.setEmail("seller1@example.com");owner.setPasswordHash("hash");owner.setRole(UserRole.SELLER);users.save(owner);
        User other=new User();other.setName("Seller Two");other.setEmail("seller2@example.com");other.setPasswordHash("hash");other.setRole(UserRole.SELLER);users.save(other);
        Category category=new Category();category.setName("Nhà phố");category.setSlug("nha-pho-e2e");category.setTransactionType(TransactionType.BUY);categories.save(category);

        AdministrativeDatasetRelease release = new AdministrativeDatasetRelease();
        release.setDatasetVersion("seller-flow-2025-07-01");
        release.setAuthority("Cơ quan nhà nước có thẩm quyền");
        release.setDocumentNumber("TEST-CURRENT-CATALOG");
        release.setEffectiveDate(LocalDate.of(2025, 7, 1));
        release.setRetrievedAt(LocalDateTime.of(2025, 7, 1, 0, 0));
        release.setSourceUrlsJson("[]");
        release.setAttribution("Controlled integration-test catalog");
        release.setRawSha256("a".repeat(64));
        release.setNormalizedSha256("b".repeat(64));
        release.setTransformVersion("test-v1");
        release.setExpectedProvinceCount(1);
        release.setExpectedCommuneCount(1);
        release.setActualProvinceCount(1);
        release.setActualCommuneCount(1);
        release.setStatus(AdministrativeDatasetStatus.ACTIVE);
        release = datasetReleases.save(release);

        AdministrativeProvince currentProvince = new AdministrativeProvince();
        currentProvince.setDatasetRelease(release);
        currentProvince.setOfficialCode("79");
        currentProvince.setOfficialName("Thành phố Hồ Chí Minh");
        currentProvince.setUnitType(AdministrativeProvinceType.CENTRAL_MUNICIPALITY);
        currentProvince.setCatalogStatus(AdministrativeCatalogStatus.ACTIVE);
        currentProvince.setEffectiveFrom(LocalDate.of(2025, 7, 1));
        currentProvince = administrativeProvinces.save(currentProvince);

        CommuneUnit currentCommune = new CommuneUnit();
        currentCommune.setDatasetRelease(release);
        currentCommune.setAdministrativeProvince(currentProvince);
        currentCommune.setOfficialCode("26734");
        currentCommune.setOfficialName("Phường Sài Gòn");
        currentCommune.setUnitType(CommuneUnitType.WARD);
        currentCommune.setCatalogStatus(AdministrativeCatalogStatus.ACTIVE);
        currentCommune.setEffectiveFrom(LocalDate.of(2025, 7, 1));
        communeUnits.save(currentCommune);

        AdministrativeCatalogState state = new AdministrativeCatalogState();
        state.setSingletonKey((byte) 1);
        state.setActiveRelease(release);
        catalogStates.save(state);
    }

    @Test
    @WithMockUser(username = "seller1@example.com", roles = "SELLER")
    void sellerCanCreateUploadSubmitAndSeePendingWhileAnotherSellerGetsForbidden() throws Exception {
        Long categoryId=categories.findAll().stream().filter(c->c.getSlug().equals("nha-pho-e2e")).findFirst().orElseThrow().getId();
        String body="""
                {"categoryId":%d,"provinceCode":"79","communeCode":"26734","title":"Nhà phố trung tâm","description":"Mô tả đầy đủ cho tin đăng",
                 "price":2500000000,"area":75,"address":"123 Nguyễn Huệ","contactName":"Seller One","contactPhone":"0901234567"}
                """.formatted(categoryId);

        mvc.perform(post("/api/v1/seller/listings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.provinceCode").value("79"))
                .andExpect(jsonPath("$.data.communeCode").value("26734"))
                .andExpect(jsonPath("$.data.districtId").doesNotExist())
                .andExpect(jsonPath("$.data.publicCode").isNotEmpty());
        Listing created=listings.findAll().get(0);long id=created.getId();long version=created.getVersion();
        org.junit.jupiter.api.Assertions.assertEquals("79", created.getAdministrativeProvince().getOfficialCode());
        org.junit.jupiter.api.Assertions.assertEquals("26734", created.getCommuneUnit().getOfficialCode());

        mvc.perform(multipart("/api/v1/seller/listings/{id}/images",id)
                        .file(new MockMultipartFile("file","home.jpg","image/jpeg",
                                new byte[]{(byte) 0xff, (byte) 0xd8, (byte) 0xff, 0})))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.url").value(org.hamcrest.Matchers.startsWith("/uploads/")))
                .andExpect(jsonPath("$.data.contentType").value("image/jpeg"))
                .andExpect(jsonPath("$.data.sizeBytes").value(4));
        mvc.perform(get(listingImages.findAll().get(0).getUrl())
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.anonymous()))
                .andExpect(status().isOk())
                .andExpect(content().bytes(new byte[]{(byte) 0xff, (byte) 0xd8, (byte) 0xff, 0}));
        mvc.perform(post("/api/v1/seller/listings/{id}/submit",id))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("PENDING"));
        mvc.perform(get("/api/v1/seller/listings"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.content[0].status").value("PENDING"));

        String update=body.substring(0,body.length()-2)+",\"version\":"+version+"}";
        mvc.perform(put("/api/v1/seller/listings/{id}",id).with(user("seller2@example.com").roles("SELLER"))
                        .contentType(MediaType.APPLICATION_JSON).content(update))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.errorCode").value("ACCESS_DENIED"));
    }
}
