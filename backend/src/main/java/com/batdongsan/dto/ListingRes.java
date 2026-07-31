package com.batdongsan.dto;

import com.batdongsan.entity.Listing;
import com.batdongsan.entity.ListingImage;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class ListingRes {
    private Long id;
    private Long userId;
    private String categoryName;
    private String districtName;
    private String provinceName;
    private String projectName;
    private String title;
    private String description;
    private BigDecimal price;
    private Double area;
    private String status;
    private LocalDateTime createdAt;
    private List<String> images;

    public ListingRes() {}

    public ListingRes(Listing listing) {
        this.id = listing.getId();
        this.userId = listing.getUser().getId();
        this.categoryName = listing.getCategory().getName();
        this.districtName = listing.getDistrict().getName();
        this.provinceName = listing.getDistrict().getProvince().getName();
        this.projectName = listing.getProject() != null ? listing.getProject().getName() : null;
        this.title = listing.getTitle();
        this.description = listing.getDescription();
        this.price = listing.getPrice();
        this.area = listing.getArea();
        this.status = listing.getStatus().name();
        this.createdAt = listing.getCreatedAt();
        this.images = listing.getImages().stream()
                .sorted((a, b) -> {
                    Integer orderA = a.getSortOrder() != null ? a.getSortOrder() : Integer.MAX_VALUE;
                    Integer orderB = b.getSortOrder() != null ? b.getSortOrder() : Integer.MAX_VALUE;
                    return orderA.compareTo(orderB);
                })
                .map(ListingImage::getUrl)
                .collect(Collectors.toList());
    }

    // Getters and setters omitted for brevity, adding public fields would be easier but getters are standard
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }
    public String getProvinceName() { return provinceName; }
    public void setProvinceName(String provinceName) { this.provinceName = provinceName; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Double getArea() { return area; }
    public void setArea(Double area) { this.area = area; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}
