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

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "file.upload-dir=target/test-uploads")
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SellerListingFlowIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users; @Autowired ProvinceRepository provinces;
    @Autowired DistrictRepository districts; @Autowired CategoryRepository categories; @Autowired ListingRepository listings;

    @BeforeEach
    void seed() {
        User owner=new User();owner.setName("Seller One");owner.setEmail("seller1@example.com");owner.setPasswordHash("hash");owner.setRole(UserRole.SELLER);users.save(owner);
        User other=new User();other.setName("Seller Two");other.setEmail("seller2@example.com");other.setPasswordHash("hash");other.setRole(UserRole.SELLER);users.save(other);
        Province province=new Province();province.setName("TP.HCM");province=provinces.save(province);
        District district=new District();district.setName("Quận 1");district.setProvince(province);districts.save(district);
        Category category=new Category();category.setName("Nhà phố");category.setSlug("nha-pho-e2e");category.setTransactionType(TransactionType.BUY);categories.save(category);
    }

    @Test
    @WithMockUser(username = "seller1@example.com", roles = "SELLER")
    void sellerCanCreateUploadSubmitAndSeePendingWhileAnotherSellerGetsForbidden() throws Exception {
        Long categoryId=categories.findAll().stream().filter(c->c.getSlug().equals("nha-pho-e2e")).findFirst().orElseThrow().getId();
        Long districtId=districts.findAll().stream().filter(d->d.getName().equals("Quận 1")).findFirst().orElseThrow().getId();
        String body="""
                {"categoryId":%d,"districtId":%d,"title":"Nhà phố trung tâm","description":"Mô tả đầy đủ cho tin đăng",
                 "price":2500000000,"area":75,"address":"123 Nguyễn Huệ","contactName":"Seller One","contactPhone":"0901234567"}
                """.formatted(categoryId,districtId);

        mvc.perform(post("/api/v1/seller/listings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.publicCode").isNotEmpty());
        Listing created=listings.findAll().get(0);long id=created.getId();long version=created.getVersion();

        mvc.perform(multipart("/api/v1/seller/listings/{id}/images",id)
                        .file(new MockMultipartFile("file","home.jpg","image/jpeg","image".getBytes())))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data").value(org.hamcrest.Matchers.startsWith("/uploads/")));
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
