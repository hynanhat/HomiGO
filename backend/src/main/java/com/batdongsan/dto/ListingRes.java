package com.batdongsan.dto;

import com.batdongsan.entity.Listing;
import com.batdongsan.entity.ListingImage;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

public class ListingRes {
    private final Long id;
    private final String publicCode;
    private final Long userId;
    private final Long categoryId;
    private final String categoryName;
    private final String provinceCode;
    private final String provinceName;
    private final String communeCode;
    private final String communeName;
    private final String communeType;
    private final Long projectId;
    private final String projectName;
    private final String title;
    private final String description;
    private final BigDecimal price;
    private final Double area;
    private final String address;
    private final Double latitude;
    private final Double longitude;
    private final Integer bedrooms;
    private final Integer bathrooms;
    private final Integer floors;
    private final String direction;
    private final String furnishing;
    private final String legalStatus;
    private final String contactName;
    private final String contactPhone;
    private final String status;
    private final String rejectionReason;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final LocalDateTime publishedAt;
    private final LocalDateTime expiresAt;
    private final Long version;
    private final List<String> images;
    private final List<Long> imageIds;

    public ListingRes(Listing listing) {
        id = listing.getId();
        publicCode = listing.getPublicCode();
        userId = listing.getUser().getId();
        categoryId = listing.getCategory().getId();
        categoryName = listing.getCategory().getName();
        provinceCode = listing.getAdministrativeProvince().getOfficialCode();
        provinceName = listing.getAdministrativeProvince().getOfficialName();
        communeCode = listing.getCommuneUnit().getOfficialCode();
        communeName = listing.getCommuneUnit().getOfficialName();
        communeType = listing.getCommuneUnit().getUnitType().name();
        projectId = listing.getProject() == null ? null : listing.getProject().getId();
        projectName = listing.getProject() == null ? null : listing.getProject().getName();
        title = listing.getTitle();
        description = listing.getDescription();
        price = listing.getPrice();
        area = listing.getArea();
        address = listing.getAddress();
        latitude = listing.getLatitude();
        longitude = listing.getLongitude();
        bedrooms = listing.getBedrooms();
        bathrooms = listing.getBathrooms();
        floors = listing.getFloors();
        direction = listing.getDirection();
        furnishing = listing.getFurnishing();
        legalStatus = listing.getLegalStatus();
        contactName = listing.getContactName();
        contactPhone = listing.getContactPhone();
        status = listing.getStatus().name();
        rejectionReason = listing.getRejectionReason();
        createdAt = listing.getCreatedAt();
        updatedAt = listing.getUpdatedAt();
        publishedAt = listing.getPublishedAt();
        expiresAt = listing.getExpiresAt();
        version = listing.getVersion();
        var sortedImages = listing.getImages().stream()
                .sorted(Comparator.comparing(ListingImage::getSortOrder, Comparator.nullsLast(Integer::compareTo)))
                .toList();
        images = sortedImages.stream().map(ListingImage::getUrl).toList();
        imageIds = sortedImages.stream().map(ListingImage::getId).toList();
    }

    public Long getId() { return id; }
    public String getPublicCode() { return publicCode; }
    public Long getUserId() { return userId; }
    public Long getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public String getProvinceCode() { return provinceCode; }
    public String getProvinceName() { return provinceName; }
    public String getCommuneCode() { return communeCode; }
    public String getCommuneName() { return communeName; }
    public String getCommuneType() { return communeType; }
    public Long getProjectId() { return projectId; }
    public String getProjectName() { return projectName; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public Double getArea() { return area; }
    public String getAddress() { return address; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public Integer getBedrooms() { return bedrooms; }
    public Integer getBathrooms() { return bathrooms; }
    public Integer getFloors() { return floors; }
    public String getDirection() { return direction; }
    public String getFurnishing() { return furnishing; }
    public String getLegalStatus() { return legalStatus; }
    public String getContactName() { return contactName; }
    public String getContactPhone() { return contactPhone; }
    public String getStatus() { return status; }
    public String getRejectionReason() { return rejectionReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public Long getVersion() { return version; }
    public List<String> getImages() { return images; }
    public List<Long> getImageIds() { return imageIds; }
}
