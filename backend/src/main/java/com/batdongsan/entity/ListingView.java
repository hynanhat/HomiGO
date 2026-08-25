package com.batdongsan.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "listing_views",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_listing_views_listing_viewer_date",
                columnNames = {"listing_id", "viewer_hash", "viewed_on"}),
        indexes = @Index(name = "idx_listing_views_listing_date", columnList = "listing_id, viewed_on")
)
public class ListingView {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(name = "viewer_hash", nullable = false, length = 64)
    private String viewerHash;

    @Column(name = "viewed_on", nullable = false)
    private LocalDate viewedOn;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ListingView() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }
    public String getViewerHash() { return viewerHash; }
    public void setViewerHash(String viewerHash) { this.viewerHash = viewerHash; }
    public LocalDate getViewedOn() { return viewedOn; }
    public void setViewedOn(LocalDate viewedOn) { this.viewedOn = viewedOn; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
