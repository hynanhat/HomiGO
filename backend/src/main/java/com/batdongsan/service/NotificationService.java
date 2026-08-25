package com.batdongsan.service;

import com.batdongsan.dto.notification.*;
import com.batdongsan.entity.*;
import com.batdongsan.exception.ResourceNotFoundException;
import com.batdongsan.repository.NotificationRepository;
import com.batdongsan.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    private static final int MAX_MESSAGE_LENGTH = 500;
    private final NotificationRepository notifications;
    private final UserRepository users;

    public NotificationService(NotificationRepository notifications, UserRepository users) {
        this.notifications = notifications;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public Page<NotificationRes> getNotifications(String email, boolean unreadOnly, Pageable pageable) {
        User recipient = user(email);
        Page<Notification> page = unreadOnly
                ? notifications.findByUserIdAndReadAtIsNull(recipient.getId(), pageable)
                : notifications.findByUserId(recipient.getId(), pageable);
        return page.map(NotificationRes::new);
    }

    @Transactional(readOnly = true)
    public UnreadCountRes getUnreadCount(String email) {
        return new UnreadCountRes(notifications.countByUserIdAndReadAtIsNull(user(email).getId()));
    }

    @Transactional
    public NotificationRes markRead(Long notificationId, String email) {
        User recipient = user(email);
        Notification notification = notifications.findByIdAndUserId(notificationId, recipient.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo."));
        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
            notification = notifications.save(notification);
        }
        return new NotificationRes(notification);
    }

    @Transactional
    public ReadAllRes markAllRead(String email) {
        return new ReadAllRes(notifications.markAllRead(user(email).getId(), LocalDateTime.now()));
    }

    @Transactional
    public void notifyListingSubmitted(Listing listing) {
        List<Notification> messages = users.findAllByRoleAndStatus(UserRole.ADMIN, UserStatus.ACTIVE).stream()
                .map(admin -> create(admin, listing, NotificationType.LISTING_SUBMITTED,
                        "Có tin đăng mới cần duyệt",
                        "Tin “" + listing.getTitle() + "” vừa được gửi và đang chờ kiểm duyệt."))
                .toList();
        if (!messages.isEmpty()) notifications.saveAll(messages);
    }

    @Transactional
    public void notifyListingApproved(Listing listing) {
        notifications.save(create(listing.getUser(), listing, NotificationType.LISTING_APPROVED,
                "Tin đăng đã được duyệt",
                "Tin “" + listing.getTitle() + "” đã được duyệt và đang hiển thị."));
    }

    @Transactional
    public void notifyListingRejected(Listing listing) {
        String reason = listing.getRejectionReason() == null || listing.getRejectionReason().isBlank()
                ? "Vui lòng kiểm tra lại nội dung tin."
                : listing.getRejectionReason();
        notifications.save(create(listing.getUser(), listing, NotificationType.LISTING_REJECTED,
                "Tin đăng chưa được duyệt",
                "Tin “" + listing.getTitle() + "” bị từ chối. Lý do: " + reason));
    }

    @Transactional
    public void notifyListingExpired(Listing listing) {
        notifications.save(create(listing.getUser(), listing, NotificationType.LISTING_EXPIRED,
                "Tin đăng đã hết hạn",
                "Tin “" + listing.getTitle() + "” đã hết hạn. Bạn có thể chỉnh sửa và gửi duyệt lại."));
    }

    private Notification create(User recipient, Listing listing, NotificationType type,
                                String title, String message) {
        Notification notification = new Notification();
        notification.setUser(recipient);
        notification.setListing(listing);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(shorten(message));
        return notification;
    }

    private String shorten(String message) {
        return message.length() <= MAX_MESSAGE_LENGTH
                ? message
                : message.substring(0, MAX_MESSAGE_LENGTH - 1) + "…";
    }

    private User user(String email) {
        return users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));
    }
}
