package com.batdongsan.controller;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    void profileRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    @WithMockUser(username = "profile@homigo.test", roles = "USER")
    void authenticatedUserCanViewAndUpdateOwnProfile() throws Exception {
        userRepository.save(activeUser("profile@homigo.test", UserRole.USER));

        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("profile@homigo.test"))
                .andExpect(jsonPath("$.data.role").value("USER"));

        mockMvc.perform(put("/api/v1/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Nguyễn Minh An","phone":"0912345678"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Nguyễn Minh An"))
                .andExpect(jsonPath("$.data.phone").value("0912345678"));
    }

    @Test
    @WithMockUser(username = "upgrade@homigo.test", roles = "USER")
    void freeSellerUpgradeEndpointIsNotAvailable() throws Exception {
        userRepository.save(activeUser("upgrade@homigo.test", UserRole.USER));

        mockMvc.perform(post("/api/v1/users/me/upgrade-seller"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "buyer@homigo.test", roles = "USER")
    void userCannotCreateListingBeforeSellerUpgrade() throws Exception {
        userRepository.save(activeUser("buyer@homigo.test", UserRole.USER));

        mockMvc.perform(post("/api/v1/listings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("ACCESS_DENIED"));
    }

    @Test
    void openApiDocumentsIdentityEndpoints() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/v1/auth/refresh']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/auth/logout']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/users/me']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/users/me/upgrade-seller']").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/v1/payments/sepay/seller-upgrade']").exists());
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
