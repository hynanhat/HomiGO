package com.batdongsan.dto;

import jakarta.validation.constraints.*;
import org.springframework.data.domain.Sort;
import java.math.BigDecimal;

public class ListingFilter {
    @Size(max=100,message="Từ khóa không được vượt quá 100 ký tự.") private String keyword;
    @Pattern(regexp="(?i)BUY|RENT",message="Loại giao dịch phải là BUY hoặc RENT.") private String transactionType;
    @Min(value=1,message="Mã tỉnh/thành phố phải lớn hơn 0.") private Long provinceId;
    @Min(value=1,message="Mã quận/huyện phải lớn hơn 0.") private Long districtId;
    @Min(value=1,message="Mã phường/xã phải lớn hơn 0.") private Long wardId;
    @Min(value=1,message="Mã danh mục phải lớn hơn 0.") private Long categoryId;
    @Min(value=1,message="Mã dự án phải lớn hơn 0.") private Long projectId;
    @DecimalMin(value="0",inclusive=false,message="Giá tối thiểu phải lớn hơn 0.") private BigDecimal minPrice;
    @DecimalMin(value="0",inclusive=false,message="Giá tối đa phải lớn hơn 0.") private BigDecimal maxPrice;
    @Positive(message="Diện tích tối thiểu phải lớn hơn 0.") private Double minArea;
    @Positive(message="Diện tích tối đa phải lớn hơn 0.") private Double maxArea;
    @PositiveOrZero(message="Số phòng ngủ không được âm.") private Integer bedrooms;
    @DecimalMin(value="-90",message="Vĩ độ tối thiểu không hợp lệ.") @DecimalMax(value="90",message="Vĩ độ tối thiểu không hợp lệ.") private Double minLat;
    @DecimalMin(value="-90",message="Vĩ độ tối đa không hợp lệ.") @DecimalMax(value="90",message="Vĩ độ tối đa không hợp lệ.") private Double maxLat;
    @DecimalMin(value="-180",message="Kinh độ tối thiểu không hợp lệ.") @DecimalMax(value="180",message="Kinh độ tối thiểu không hợp lệ.") private Double minLng;
    @DecimalMin(value="-180",message="Kinh độ tối đa không hợp lệ.") @DecimalMax(value="180",message="Kinh độ tối đa không hợp lệ.") private Double maxLng;
    @Pattern(regexp="newest|priceAsc|priceDesc|areaAsc|areaDesc",message="Kiểu sắp xếp không hợp lệ.")
    private String sort="newest";

    @AssertTrue(message="Giá tối thiểu không được lớn hơn giá tối đa.")
    public boolean isPriceRangeValid(){return minPrice==null||maxPrice==null||minPrice.compareTo(maxPrice)<=0;}
    @AssertTrue(message="Diện tích tối thiểu không được lớn hơn diện tích tối đa.")
    public boolean isAreaRangeValid(){return minArea==null||maxArea==null||minArea<=maxArea;}
    @AssertTrue(message="Khung bản đồ phải có đủ bốn tọa độ và giá trị tối thiểu nhỏ hơn tối đa.")
    public boolean isBoundingBoxValid(){boolean none=minLat==null&&maxLat==null&&minLng==null&&maxLng==null;
        boolean all=minLat!=null&&maxLat!=null&&minLng!=null&&maxLng!=null;return none||(all&&minLat<maxLat&&minLng<maxLng);}

    public Sort toSort(){return switch(sort==null?"newest":sort){
        case "priceAsc"->Sort.by(Sort.Order.asc("price"),Sort.Order.asc("id"));
        case "priceDesc"->Sort.by(Sort.Order.desc("price"),Sort.Order.asc("id"));
        case "areaAsc"->Sort.by(Sort.Order.asc("area"),Sort.Order.asc("id"));
        case "areaDesc"->Sort.by(Sort.Order.desc("area"),Sort.Order.asc("id"));
        default->Sort.by(Sort.Order.desc("createdAt"),Sort.Order.asc("id"));};}

    public String getKeyword(){return keyword;} public void setKeyword(String v){keyword=v;}
    public String getTransactionType(){return transactionType;} public void setTransactionType(String v){transactionType=v;}
    public Long getProvinceId(){return provinceId;} public void setProvinceId(Long v){provinceId=v;}
    public Long getDistrictId(){return districtId;} public void setDistrictId(Long v){districtId=v;}
    public Long getWardId(){return wardId;} public void setWardId(Long v){wardId=v;}
    public Long getCategoryId(){return categoryId;} public void setCategoryId(Long v){categoryId=v;}
    public Long getProjectId(){return projectId;} public void setProjectId(Long v){projectId=v;}
    public BigDecimal getMinPrice(){return minPrice;} public void setMinPrice(BigDecimal v){minPrice=v;}
    public BigDecimal getMaxPrice(){return maxPrice;} public void setMaxPrice(BigDecimal v){maxPrice=v;}
    public Double getMinArea(){return minArea;} public void setMinArea(Double v){minArea=v;}
    public Double getMaxArea(){return maxArea;} public void setMaxArea(Double v){maxArea=v;}
    public Integer getBedrooms(){return bedrooms;} public void setBedrooms(Integer v){bedrooms=v;}
    public Double getMinLat(){return minLat;} public void setMinLat(Double v){minLat=v;}
    public Double getMaxLat(){return maxLat;} public void setMaxLat(Double v){maxLat=v;}
    public Double getMinLng(){return minLng;} public void setMinLng(Double v){minLng=v;}
    public Double getMaxLng(){return maxLng;} public void setMaxLng(Double v){maxLng=v;}
    public String getSort(){return sort;} public void setSort(String v){sort=v;}
}
