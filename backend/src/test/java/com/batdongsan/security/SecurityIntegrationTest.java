package com.batdongsan.security;

import com.batdongsan.entity.User;
import com.batdongsan.entity.UserRole;
import com.batdongsan.entity.UserStatus;
import com.batdongsan.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    void publicListingRouteAllowsAnonymousRequests() throws Exception {
        mockMvc.perform(get("/api/v1/listings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void protectedRouteRejectsAnonymousRequestsWithStandardError() throws Exception {
        mockMvc.perform(get("/api/v1/saved-listings"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message")
                        .value("Bạn cần đăng nhập để thực hiện thao tác này."))
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    void protectedRouteRejectsInvalidBearerToken() throws Exception {
        mockMvc.perform(get("/api/v1/saved-listings")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    @WithMockUser(username = "user@homigo.test", roles = "USER")
    void authenticatedUserCanAccessProtectedRoute() throws Exception {
        userRepository.save(activeUser("user@homigo.test", UserRole.USER));

        mockMvc.perform(get("/api/v1/saved-listings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "USER")
    void regularUserCannotAccessAdminRoute() throws Exception {
        mockMvc.perform(post("/api/v1/admin/listings/999/approve"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("ACCESS_DENIED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanPassAdminAuthorizationRule() throws Exception {
        mockMvc.perform(post("/api/v1/admin/listings/999/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedVersion\":0}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    void invalidPageRequestUsesValidationErrorFormat() throws Exception {
        mockMvc.perform(get("/api/v1/listings")
                        .param("page", "-1")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.data.page")
                        .value("Số trang phải lớn hơn hoặc bằng 0."));
    }

    private User activeUser(String email, UserRole role) {
        User user = new User();
        user.setName("Người dùng kiểm thử");
        user.setEmail(email);
        user.setPasswordHash("not-used-in-this-test");
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        return user;
    }
}
