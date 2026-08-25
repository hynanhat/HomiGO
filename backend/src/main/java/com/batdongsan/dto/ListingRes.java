package com.batdongsan.dto;

import com.batdongsan.entity.Listing;
import com.batdongsan.entity.ListingImage;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ListingRes {
    private Long id; private String publicCode; private Long userId; private Long categoryId; private String categoryName;
    private Long districtId; private String districtName; private String provinceName; private Long wardId; private String wardName; private Long projectId; private String projectName;
    private String title; private String description; private BigDecimal price; private Double area; private String address;
    private Double latitude; private Double longitude; private Integer bedrooms; private Integer bathrooms; private Integer floors;
    private String direction; private String furnishing; private String legalStatus; private String contactName; private String contactPhone;
    private String status; private String rejectionReason; private LocalDateTime createdAt; private LocalDateTime updatedAt;
    private LocalDateTime publishedAt; private LocalDateTime expiresAt; private Long version; private List<String> images; private List<Long> imageIds;

    public ListingRes() {}
    public ListingRes(Listing l) {
        id=l.getId(); publicCode=l.getPublicCode(); userId=l.getUser().getId(); categoryId=l.getCategory().getId(); categoryName=l.getCategory().getName();
        districtId=l.getDistrict().getId(); districtName=l.getDistrict().getName(); provinceName=l.getDistrict().getProvince().getName();
        wardId=l.getWard()!=null?l.getWard().getId():null; wardName=l.getWard()!=null?l.getWard().getName():null; projectId=l.getProject()!=null?l.getProject().getId():null; projectName=l.getProject()!=null?l.getProject().getName():null;
        title=l.getTitle(); description=l.getDescription(); price=l.getPrice(); area=l.getArea(); address=l.getAddress();
        latitude=l.getLatitude(); longitude=l.getLongitude(); bedrooms=l.getBedrooms(); bathrooms=l.getBathrooms(); floors=l.getFloors();
        direction=l.getDirection(); furnishing=l.getFurnishing(); legalStatus=l.getLegalStatus(); contactName=l.getContactName(); contactPhone=l.getContactPhone();
        status=l.getStatus().name(); rejectionReason=l.getRejectionReason(); createdAt=l.getCreatedAt(); updatedAt=l.getUpdatedAt();
        publishedAt=l.getPublishedAt(); expiresAt=l.getExpiresAt(); version=l.getVersion();
        var sortedImages=l.getImages().stream().sorted(java.util.Comparator.comparing(ListingImage::getSortOrder,
                java.util.Comparator.nullsLast(Integer::compareTo))).toList();
        images=sortedImages.stream().map(ListingImage::getUrl).toList(); imageIds=sortedImages.stream().map(ListingImage::getId).toList();
    }
    public Long getId(){return id;} public String getPublicCode(){return publicCode;} public Long getUserId(){return userId;} public Long getCategoryId(){return categoryId;}
    public String getCategoryName(){return categoryName;} public Long getDistrictId(){return districtId;} public String getDistrictName(){return districtName;} public String getProvinceName(){return provinceName;}
    public Long getWardId(){return wardId;} public String getWardName(){return wardName;} public Long getProjectId(){return projectId;} public String getProjectName(){return projectName;} public String getTitle(){return title;}
    public String getDescription(){return description;} public BigDecimal getPrice(){return price;} public Double getArea(){return area;}
    public String getAddress(){return address;} public Double getLatitude(){return latitude;} public Double getLongitude(){return longitude;}
    public Integer getBedrooms(){return bedrooms;} public Integer getBathrooms(){return bathrooms;} public Integer getFloors(){return floors;}
    public String getDirection(){return direction;} public String getFurnishing(){return furnishing;} public String getLegalStatus(){return legalStatus;}
    public String getContactName(){return contactName;} public String getContactPhone(){return contactPhone;} public String getStatus(){return status;}
    public String getRejectionReason(){return rejectionReason;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
    public LocalDateTime getPublishedAt(){return publishedAt;} public LocalDateTime getExpiresAt(){return expiresAt;} public Long getVersion(){return version;}
    public List<String> getImages(){return images;} public List<Long> getImageIds(){return imageIds;}
}
