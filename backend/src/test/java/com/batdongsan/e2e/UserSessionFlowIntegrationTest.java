package com.batdongsan.e2e;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserSessionFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void completeIdentityAndRevocableSessionFlow() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Nguyễn Minh An",
                                  "email":"FLOW@HOMIGO.TEST",
                                  "password":"secret123",
                                  "phone":"0901234567"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("flow@homigo.test"))
                .andExpect(jsonPath("$.data.role").value("USER"));

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"flow@homigo.test","password":"secret123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andReturn();

        String accessToken = JsonPath.read(
                loginResult.getResponse().getContentAsString(), "$.data.accessToken");
        String firstRefreshToken = JsonPath.read(
                loginResult.getResponse().getContentAsString(), "$.data.refreshToken");

        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", bearer(accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("USER"));

        mockMvc.perform(put("/api/v1/users/me")
                        .header("Authorization", bearer(accessToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Nguyễn An","phone":"0912345678"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Nguyễn An"));

        mockMvc.perform(post("/api/v1/users/me/upgrade-seller")
                        .header("Authorization", bearer(accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("SELLER"));

        MvcResult refreshResult = mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody(firstRefreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andReturn();

        String rotatedAccessToken = JsonPath.read(
                refreshResult.getResponse().getContentAsString(), "$.data.accessToken");
        String rotatedRefreshToken = JsonPath.read(
                refreshResult.getResponse().getContentAsString(), "$.data.refreshToken");

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody(firstRefreshToken)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("BAD_REQUEST"));

        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", bearer(rotatedAccessToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody(rotatedRefreshToken)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody(rotatedRefreshToken)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("BAD_REQUEST"));
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private String refreshBody(String token) {
        return "{\"refreshToken\":\"" + token + "\"}";
    }
}
