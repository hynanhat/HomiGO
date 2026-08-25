package com.batdongsan.controller;

import com.batdongsan.entity.Notification;
import com.batdongsan.entity.NotificationType;
import com.batdongsan.entity.User;
import com.batdongsan.entity.UserRole;
import com.batdongsan.entity.UserStatus;
import com.batdongsan.repository.NotificationRepository;
import com.batdongsan.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class NotificationControllerIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository users;
    @Autowired NotificationRepository notifications;

    private User recipient;
    private Notification unread;

    @BeforeEach
    void setUp() {
        recipient = saveUser("notify-user@homigo.test");
        unread = saveNotification(recipient, "Tin đăng đã được duyệt");
        saveNotification(saveUser("another-user@homigo.test"), "Thông báo riêng tư");
    }

    @Test
    @WithMockUser(username = "notify-user@homigo.test", roles = "USER")
    void inboxAndUnreadCountOnlyContainCurrentRecipientsNotifications() throws Exception {
        mockMvc.perform(get("/api/v1/notifications").param("page", "0").param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].title").value("Tin đăng đã được duyệt"));

        mockMvc.perform(get("/api/v1/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.count").value(1));
    }

    @Test
    @WithMockUser(username = "notify-user@homigo.test", roles = "USER")
    void recipientCanMarkOneAndAllNotificationsRead() throws Exception {
        mockMvc.perform(patch("/api/v1/notifications/{id}/read", unread.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.read").value(true));

        mockMvc.perform(patch("/api/v1/notifications/read-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.updatedCount").value(0));
    }

    @Test
    @WithMockUser(username = "another-user@homigo.test", roles = "USER")
    void anotherUserCannotMarkRecipientsNotificationRead() throws Exception {
        mockMvc.perform(patch("/api/v1/notifications/{id}/read", unread.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    private User saveUser(String email) {
        User user = new User();
        user.setName("Notification User");
        user.setEmail(email);
        user.setPasswordHash("hash");
        user.setRole(UserRole.USER);
        user.setStatus(UserStatus.ACTIVE);
        return users.save(user);
    }

    private Notification saveNotification(User user, String title) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(NotificationType.LISTING_APPROVED);
        notification.setTitle(title);
        notification.setMessage("Nội dung thông báo");
        return notifications.save(notification);
    }
}
