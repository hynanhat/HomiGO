package com.batdongsan.controller;

import com.batdongsan.dto.ai.AiDescriptionDraftRes;
import com.batdongsan.dto.ai.AiDescriptionQuotaRes;
import com.batdongsan.service.ai.AiDescriptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AiDescriptionControllerIntegrationTest {
    @Autowired private MockMvc mockMvc;
    @MockitoBean private AiDescriptionService service;

    private AiDescriptionQuotaRes quota;

    @BeforeEach
    void setUp() {
        quota = new AiDescriptionQuotaRes(true, 5, 1, 4, 4,
                OffsetDateTime.parse("2026-08-25T00:00:00+07:00"), null);
        when(service.getQuota(anyString())).thenReturn(quota);
        when(service.generate(anyString(), any())).thenReturn(new AiDescriptionDraftRes("Mô tả hợp lệ", quota));
    }

    @Test
    void anonymousAndRegularUserCannotAccessSellerAi() throws Exception {
        mockMvc.perform(get("/api/v1/seller/ai-description/quota"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void regularUserIsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/seller/ai-description/quota"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("ACCESS_DENIED"));
    }

    @Test
    @WithMockUser(username = "seller@homigo.test", roles = "SELLER")
    void sellerCanReadQuotaAndGenerateContract() throws Exception {
        mockMvc.perform(get("/api/v1/seller/ai-description/quota"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.limit").value(5))
                .andExpect(jsonPath("$.data.remainingAttempts").value(4));

        mockMvc.perform(post("/api/v1/seller/ai-description/drafts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"keywords":"ban công thoáng","categoryId":1,"districtId":2,
                                 "title":"Căn hộ sáng","price":3200000000,"area":78,
                                 "address":"Nguyễn Huệ","bedrooms":3,"bathrooms":2}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.description").value("Mô tả hợp lệ"))
                .andExpect(jsonPath("$.data.quota.remainingAttempts").value(4));
        verify(service).generate(eq("seller@homigo.test"), any());
    }

    @Test
    @WithMockUser(username = "seller@homigo.test", roles = "SELLER")
    void invalidInputNeverInvokesGeneration() throws Exception {
        mockMvc.perform(post("/api/v1/seller/ai-description/drafts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"keywords\":\"x\",\"categoryId\":1,\"districtId\":2,\"price\":10,\"area\":20}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));

        verify(service, never()).generate(anyString(), any());
    }
}
