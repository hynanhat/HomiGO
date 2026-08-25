package com.batdongsan.service;

import com.batdongsan.entity.Listing;
import com.batdongsan.entity.Notification;
import com.batdongsan.entity.NotificationType;
import com.batdongsan.entity.User;
import com.batdongsan.entity.UserRole;
import com.batdongsan.entity.UserStatus;
import com.batdongsan.exception.ResourceNotFoundException;
import com.batdongsan.repository.NotificationRepository;
import com.batdongsan.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock NotificationRepository notifications;
    @Mock UserRepository users;

    private NotificationService service;
    private User seller;

    @BeforeEach
    void setUp() {
        service = new NotificationService(notifications, users);
        seller = user(1L, "seller@example.com", UserRole.SELLER);
    }

    @Test
    void submittedListingNotifiesEveryActiveAdmin() {
        User firstAdmin = user(2L, "admin1@example.com", UserRole.ADMIN);
        User secondAdmin = user(3L, "admin2@example.com", UserRole.ADMIN);
        when(users.findAllByRoleAndStatus(UserRole.ADMIN, UserStatus.ACTIVE))
                .thenReturn(List.of(firstAdmin, secondAdmin));

        service.notifyListingSubmitted(listing());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Notification>> captor = ArgumentCaptor.forClass(List.class);
        verify(notifications).saveAll(captor.capture());
        assertEquals(List.of(firstAdmin, secondAdmin),
                captor.getValue().stream().map(Notification::getUser).toList());
        assertTrue(captor.getValue().stream()
                .allMatch(item -> item.getType() == NotificationType.LISTING_SUBMITTED));
    }

    @Test
    void moderationOutcomeCreatesOneOwnerNotification() {
        when(notifications.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.notifyListingApproved(listing());

        verify(notifications).save(argThat(item -> item.getUser() == seller
                && item.getType() == NotificationType.LISTING_APPROVED
                && item.getListing().getId().equals(10L)));
    }

    @Test
    void recipientCannotReadAnotherUsersNotification() {
        when(users.findByEmail(seller.getEmail())).thenReturn(Optional.of(seller));
        when(notifications.findByIdAndUserId(99L, seller.getId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.markRead(99L, seller.getEmail()));
        verify(notifications, never()).save(any());
    }

    @Test
    void markingAlreadyReadNotificationKeepsOriginalTimestamp() {
        Notification notification = new Notification();
        notification.setId(7L);
        notification.setUser(seller);
        notification.setType(NotificationType.LISTING_APPROVED);
        notification.setTitle("Đã duyệt");
        notification.setMessage("Tin đã được duyệt.");
        LocalDateTime original = LocalDateTime.now().minusHours(1);
        notification.setReadAt(original);
        when(users.findByEmail(seller.getEmail())).thenReturn(Optional.of(seller));
        when(notifications.findByIdAndUserId(7L, seller.getId())).thenReturn(Optional.of(notification));

        var result = service.markRead(7L, seller.getEmail());

        assertEquals(original, result.getReadAt());
        verify(notifications, never()).save(any());
    }

    private Listing listing() {
        Listing listing = new Listing();
        listing.setId(10L);
        listing.setPublicCode("HMG-NOTIFY001");
        listing.setTitle("Căn hộ trung tâm");
        listing.setUser(seller);
        listing.setRejectionReason("Thiếu thông tin pháp lý");
        return listing;
    }

    private User user(Long id, String email, UserRole role) {
        User user = new User();
        user.setId(id);
        user.setName("User");
        user.setEmail(email);
        user.setPasswordHash("hash");
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        return user;
    }
}
