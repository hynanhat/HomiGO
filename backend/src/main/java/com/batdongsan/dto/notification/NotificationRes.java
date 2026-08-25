package com.batdongsan.dto.notification;

import com.batdongsan.entity.Notification;
import com.batdongsan.entity.NotificationType;
import java.time.LocalDateTime;

public class NotificationRes {
    private final Long id;
    private final NotificationType type;
    private final String title;
    private final String message;
    private final Long listingId;
    private final String listingPublicCode;
    private final boolean read;
    private final LocalDateTime readAt;
    private final LocalDateTime createdAt;

    public NotificationRes(Notification notification) {
        id = notification.getId();
        type = notification.getType();
        title = notification.getTitle();
        message = notification.getMessage();
        listingId = notification.getListing() == null ? null : notification.getListing().getId();
        listingPublicCode = notification.getListing() == null ? null : notification.getListing().getPublicCode();
        readAt = notification.getReadAt();
        read = readAt != null;
        createdAt = notification.getCreatedAt();
    }

    public Long getId() { return id; }
    public NotificationType getType() { return type; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public Long getListingId() { return listingId; }
    public String getListingPublicCode() { return listingPublicCode; }
    public boolean isRead() { return read; }
    public LocalDateTime getReadAt() { return readAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
