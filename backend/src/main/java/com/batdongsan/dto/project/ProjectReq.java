package com.batdongsan.dto.project;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class ProjectReq {
    @NotBlank(message = "Tên dự án không được để trống.")
    @Size(max = 255, message = "Tên dự án không được vượt quá 255 ký tự.")
    private String name;
    @NotBlank(message = "Slug dự án không được để trống.")
    @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*", message = "Slug dự án không hợp lệ.")
    @Size(max = 160, message = "Slug dự án không được vượt quá 160 ký tự.")
    private String slug;
    @NotBlank(message = "Chủ đầu tư không được để trống.")
    @Size(max = 255, message = "Tên chủ đầu tư không được vượt quá 255 ký tự.")
    private String investor;
    @NotBlank(message = "Mã tỉnh/thành phố không được để trống.")
    @Pattern(regexp = "^[0-9]{2}$", message = "Mã tỉnh/thành phố không hợp lệ.")
    private String provinceCode;
    @NotBlank(message = "Mã phường/xã/đặc khu không được để trống.")
    @Pattern(regexp = "^[0-9]{5}$", message = "Mã phường/xã/đặc khu không hợp lệ.")
    private String communeCode;
    @NotBlank(message = "Địa chỉ dự án không được để trống.")
    @Size(max = 500, message = "Địa chỉ dự án không được vượt quá 500 ký tự.")
    private String address;
    @DecimalMin(value = "-90", message = "Vĩ độ không hợp lệ.")
    @DecimalMax(value = "90", message = "Vĩ độ không hợp lệ.")
    private Double latitude;
    @DecimalMin(value = "-180", message = "Kinh độ không hợp lệ.")
    @DecimalMax(value = "180", message = "Kinh độ không hợp lệ.")
    private Double longitude;
    @NotBlank(message = "Trạng thái dự án không được để trống.")
    @Pattern(regexp = "PLANNING|IN_PROGRESS|COMPLETED|ON_HOLD",
            message = "Trạng thái dự án không hợp lệ.")
    private String status;
    @NotBlank(message = "Mô tả dự án không được để trống.")
    @Size(max = 10000, message = "Mô tả dự án không được vượt quá 10000 ký tự.")
    private String description;
    @Positive(message = "Giá thấp nhất phải lớn hơn 0.")
    private BigDecimal priceFrom;
    @Positive(message = "Giá cao nhất phải lớn hơn 0.")
    private BigDecimal priceTo;

    @AssertTrue(message = "Giá thấp nhất không được lớn hơn giá cao nhất.")
    public boolean isPriceRangeValid() {
        return priceFrom == null || priceTo == null || priceFrom.compareTo(priceTo) <= 0;
    }
    @AssertTrue(message = "Tọa độ dự án phải có đủ vĩ độ và kinh độ.")
    public boolean isCoordinatesValid() {
        return (latitude == null && longitude == null) || (latitude != null && longitude != null);
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getInvestor() { return investor; }
    public void setInvestor(String investor) { this.investor = investor; }
    public String getProvinceCode() { return provinceCode; }
    public void setProvinceCode(String provinceCode) { this.provinceCode = provinceCode; }
    public String getCommuneCode() { return communeCode; }
    public void setCommuneCode(String communeCode) { this.communeCode = communeCode; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPriceFrom() { return priceFrom; }
    public void setPriceFrom(BigDecimal priceFrom) { this.priceFrom = priceFrom; }
    public BigDecimal getPriceTo() { return priceTo; }
    public void setPriceTo(BigDecimal priceTo) { this.priceTo = priceTo; }
}
