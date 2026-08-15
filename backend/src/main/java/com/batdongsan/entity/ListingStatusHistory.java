package com.batdongsan.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "listing_status_history")
public class ListingStatusHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;
    @Enumerated(EnumType.STRING) @Column(name = "from_status")
    private ListingStatus fromStatus;
    @Enumerated(EnumType.STRING) @Column(name = "to_status", nullable = false)
    private ListingStatus toStatus;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;
    private String reason;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }
    public ListingStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(ListingStatus fromStatus) { this.fromStatus = fromStatus; }
    public ListingStatus getToStatus() { return toStatus; }
    public void setToStatus(ListingStatus toStatus) { this.toStatus = toStatus; }
    public User getChangedBy() { return changedBy; }
    public void setChangedBy(User changedBy) { this.changedBy = changedBy; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
