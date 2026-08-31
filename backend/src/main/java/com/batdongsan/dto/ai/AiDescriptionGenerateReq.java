package com.batdongsan.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = false)
public class AiDescriptionGenerateReq {
    @NotBlank(message = "Từ khóa không được để trống.")
    @Size(min = 3, max = 500, message = "Từ khóa phải dài từ 3 đến 500 ký tự.")
    private String keywords;

    @NotNull(message = "Mã danh mục không được để trống.")
    @Positive(message = "Mã danh mục không hợp lệ.")
    private Long categoryId;

    @NotBlank(message = "Mã tỉnh/thành phố không được để trống.")
    @Pattern(regexp = "^[0-9]{2}$", message = "Mã tỉnh/thành phố không hợp lệ.")
    private String provinceCode;

    @NotBlank(message = "Mã phường/xã/đặc khu không được để trống.")
    @Pattern(regexp = "^[0-9]{5}$", message = "Mã phường/xã/đặc khu không hợp lệ.")
    private String communeCode;

    @Positive(message = "Mã dự án không hợp lệ.")
    private Long projectId;

    @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự.")
    private String title;

    @NotNull(message = "Giá không được để trống.")
    @DecimalMin(value = "0", inclusive = false, message = "Giá phải lớn hơn 0.")
    private BigDecimal price;

    @NotNull(message = "Diện tích không được để trống.")
    @DecimalMin(value = "0", inclusive = false, message = "Diện tích phải lớn hơn 0.")
    private Double area;

    @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự.")
    private String address;

    @PositiveOrZero private Integer bedrooms;
    @PositiveOrZero private Integer bathrooms;
    @PositiveOrZero private Integer floors;
    @Size(max = 50) private String direction;
    @Size(max = 100) private String furnishing;
    @Size(max = 100) private String legalStatus;

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = trim(keywords); }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getProvinceCode() { return provinceCode; }
    public void setProvinceCode(String provinceCode) { this.provinceCode = trim(provinceCode); }
    public String getCommuneCode() { return communeCode; }
    public void setCommuneCode(String communeCode) { this.communeCode = trim(communeCode); }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = trim(title); }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Double getArea() { return area; }
    public void setArea(Double area) { this.area = area; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = trim(address); }
    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }
    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }
    public Integer getFloors() { return floors; }
    public void setFloors(Integer floors) { this.floors = floors; }
    public String getDirection() { return direction; }
    public void setDirection(String direction) { this.direction = trim(direction); }
    public String getFurnishing() { return furnishing; }
    public void setFurnishing(String furnishing) { this.furnishing = trim(furnishing); }
    public String getLegalStatus() { return legalStatus; }
    public void setLegalStatus(String legalStatus) { this.legalStatus = trim(legalStatus); }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}
