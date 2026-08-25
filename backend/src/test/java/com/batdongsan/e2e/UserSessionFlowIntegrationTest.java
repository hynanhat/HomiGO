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
import jakarta.servlet.http.Cookie;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;

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
                                  "password":"correct-horse-battery-staple",
                                  "phone":"0901234567"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("flow@homigo.test"))
                .andExpect(jsonPath("$.data.role").value("USER"));

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"flow@homigo.test","password":"correct-horse-battery-staple"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist())
                .andExpect(cookie().httpOnly("homigo_refresh", true))
                .andReturn();

        String accessToken = JsonPath.read(
                loginResult.getResponse().getContentAsString(), "$.data.accessToken");
        Cookie firstRefreshCookie = loginResult.getResponse().getCookie("homigo_refresh");

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

        MvcResult refreshResult = mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(firstRefreshCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("flow@homigo.test"))
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist())
                .andReturn();

        String rotatedAccessToken = JsonPath.read(
                refreshResult.getResponse().getContentAsString(), "$.data.accessToken");
        Cookie rotatedRefreshCookie = refreshResult.getResponse().getCookie("homigo_refresh");

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(firstRefreshCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("BAD_REQUEST"));

        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", bearer(rotatedAccessToken))
                        .cookie(rotatedRefreshCookie))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("homigo_refresh", 0));

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(rotatedRefreshCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("BAD_REQUEST"));
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

}
