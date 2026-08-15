package com.batdongsan.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class ListingReq {
    @NotNull(message = "Mã danh mục không được để trống.") private Long categoryId;
    @NotNull(message = "Mã quận/huyện không được để trống.") private Long districtId;
    private Long wardId;
    private Long projectId;
    @NotBlank(message = "Tiêu đề không được để trống.") @Size(max = 200) private String title;
    @NotBlank(message = "Mô tả không được để trống.") @Size(max = 10000) private String description;
    @NotNull @DecimalMin(value = "0", inclusive = false, message = "Giá phải lớn hơn 0.") private BigDecimal price;
    @NotNull @DecimalMin(value = "0", inclusive = false, message = "Diện tích phải lớn hơn 0.") private Double area;
    @NotBlank(message = "Địa chỉ không được để trống.") @Size(max = 500) private String address;
    @DecimalMin(value = "-90") @DecimalMax(value = "90") private Double latitude;
    @DecimalMin(value = "-180") @DecimalMax(value = "180") private Double longitude;
    @PositiveOrZero private Integer bedrooms;
    @PositiveOrZero private Integer bathrooms;
    @PositiveOrZero private Integer floors;
    @Size(max = 50) private String direction;
    @Size(max = 100) private String furnishing;
    @Size(max = 100) private String legalStatus;
    @NotBlank @Size(max = 100) private String contactName;
    @NotBlank @Pattern(regexp = "^[0-9+() .-]{8,20}$", message = "Số điện thoại không hợp lệ.") private String contactPhone;
    private Long version;

    public Long getCategoryId() { return categoryId; } public void setCategoryId(Long v) { categoryId=v; }
    public Long getDistrictId() { return districtId; } public void setDistrictId(Long v) { districtId=v; }
    public Long getWardId() { return wardId; } public void setWardId(Long v) { wardId=v; }
    public Long getProjectId() { return projectId; } public void setProjectId(Long v) { projectId=v; }
    public String getTitle() { return title; } public void setTitle(String v) { title=v; }
    public String getDescription() { return description; } public void setDescription(String v) { description=v; }
    public BigDecimal getPrice() { return price; } public void setPrice(BigDecimal v) { price=v; }
    public Double getArea() { return area; } public void setArea(Double v) { area=v; }
    public String getAddress() { return address; } public void setAddress(String v) { address=v; }
    public Double getLatitude() { return latitude; } public void setLatitude(Double v) { latitude=v; }
    public Double getLongitude() { return longitude; } public void setLongitude(Double v) { longitude=v; }
    public Integer getBedrooms() { return bedrooms; } public void setBedrooms(Integer v) { bedrooms=v; }
    public Integer getBathrooms() { return bathrooms; } public void setBathrooms(Integer v) { bathrooms=v; }
    public Integer getFloors() { return floors; } public void setFloors(Integer v) { floors=v; }
    public String getDirection() { return direction; } public void setDirection(String v) { direction=v; }
    public String getFurnishing() { return furnishing; } public void setFurnishing(String v) { furnishing=v; }
    public String getLegalStatus() { return legalStatus; } public void setLegalStatus(String v) { legalStatus=v; }
    public String getContactName() { return contactName; } public void setContactName(String v) { contactName=v; }
    public String getContactPhone() { return contactPhone; } public void setContactPhone(String v) { contactPhone=v; }
    public Long getVersion() { return version; } public void setVersion(Long v) { version=v; }
}
