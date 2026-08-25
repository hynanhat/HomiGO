package com.batdongsan.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicUploadSecurityIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void guestRequestForMissingUploadedImageReachesResourceHandler() throws Exception {
        mvc.perform(get("/uploads/missing-image.jpg"))
                .andExpect(status().isNotFound());
    }
}
