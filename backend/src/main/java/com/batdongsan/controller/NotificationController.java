package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.PageResponse;
import com.batdongsan.dto.notification.*;
import com.batdongsan.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationRes>>> notifications(
            @Valid @ModelAttribute NotificationPageReq request, Authentication authentication) {
        PageRequest page = PageRequest.of(request.getPage(), request.getSize(),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(
                notificationService.getNotifications(authentication.getName(), request.isUnreadOnly(), page))));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadCountRes>> unreadCount(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount(authentication.getName())));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationRes>> markRead(
            @PathVariable Long notificationId, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.markRead(notificationId, authentication.getName())));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<ReadAllRes>> markAllRead(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.markAllRead(authentication.getName())));
    }
}
