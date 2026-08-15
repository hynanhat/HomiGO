package com.batdongsan.dto.admin;

import com.batdongsan.entity.Listing;
import java.time.LocalDateTime;

public class AdminListingRes {
    private final Long id; private final String publicCode; private final String title;
    private final Long sellerId; private final String sellerEmail; private final String status;
    private final String rejectionReason; private final LocalDateTime createdAt; private final LocalDateTime approvedAt;
    private final LocalDateTime publishedAt; private final LocalDateTime expiresAt; private final Long version;

    public AdminListingRes(Listing listing) {
        id=listing.getId(); publicCode=listing.getPublicCode(); title=listing.getTitle();
        sellerId=listing.getUser().getId(); sellerEmail=listing.getUser().getEmail(); status=listing.getStatus().name();
        rejectionReason=listing.getRejectionReason(); createdAt=listing.getCreatedAt(); approvedAt=listing.getApprovedAt();
        publishedAt=listing.getPublishedAt(); expiresAt=listing.getExpiresAt(); version=listing.getVersion();
    }
    public Long getId(){return id;} public String getPublicCode(){return publicCode;} public String getTitle(){return title;}
    public Long getSellerId(){return sellerId;} public String getSellerEmail(){return sellerEmail;} public String getStatus(){return status;}
    public String getRejectionReason(){return rejectionReason;} public LocalDateTime getCreatedAt(){return createdAt;}
    public LocalDateTime getApprovedAt(){return approvedAt;} public LocalDateTime getPublishedAt(){return publishedAt;}
    public LocalDateTime getExpiresAt(){return expiresAt;} public Long getVersion(){return version;}
}
