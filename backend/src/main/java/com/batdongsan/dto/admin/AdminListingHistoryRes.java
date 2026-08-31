package com.batdongsan.dto.admin;

import com.batdongsan.entity.ListingStatusHistory;
import java.time.LocalDateTime;

public class AdminListingHistoryRes {
    private final Long id;
    private final String fromStatus;
    private final String toStatus;
    private final String reason;
    private final Long changedById;
    private final String changedByName;
    private final LocalDateTime createdAt;

    public AdminListingHistoryRes(ListingStatusHistory history) {
        id = history.getId();
        fromStatus = history.getFromStatus() == null ? null : history.getFromStatus().name();
        toStatus = history.getToStatus().name();
        reason = history.getReason();
        changedById = history.getChangedBy().getId();
        changedByName = history.getChangedBy().getName();
        createdAt = history.getCreatedAt();
    }

    public Long getId() { return id; }
    public String getFromStatus() { return fromStatus; }
    public String getToStatus() { return toStatus; }
    public String getReason() { return reason; }
    public Long getChangedById() { return changedById; }
    public String getChangedByName() { return changedByName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
