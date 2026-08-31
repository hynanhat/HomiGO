package com.batdongsan.dto.project;

import com.batdongsan.entity.Project;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProjectSummaryRes {
    private final Long id;
    private final String name;
    private final String slug;
    private final String investor;
    private final String provinceCode;
    private final String provinceName;
    private final String communeCode;
    private final String communeName;
    private final String communeType;
    private final String address;
    private final String description;
    private final Double latitude;
    private final Double longitude;
    private final String status;
    private final BigDecimal priceFrom;
    private final BigDecimal priceTo;
    private final LocalDateTime updatedAt;

    public ProjectSummaryRes(Project project) {
        id = project.getId();
        name = project.getName();
        slug = project.getSlug();
        investor = project.getInvestor();
        provinceCode = project.getAdministrativeProvince().getOfficialCode();
        provinceName = project.getAdministrativeProvince().getOfficialName();
        communeCode = project.getCommuneUnit().getOfficialCode();
        communeName = project.getCommuneUnit().getOfficialName();
        communeType = project.getCommuneUnit().getUnitType().name();
        address = project.getAddress();
        description = project.getDescription();
        latitude = project.getLatitude();
        longitude = project.getLongitude();
        status = project.getStatus();
        priceFrom = project.getPriceFrom();
        priceTo = project.getPriceTo();
        updatedAt = project.getUpdatedAt();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getInvestor() { return investor; }
    public String getProvinceCode() { return provinceCode; }
    public String getProvinceName() { return provinceName; }
    public String getCommuneCode() { return communeCode; }
    public String getCommuneName() { return communeName; }
    public String getCommuneType() { return communeType; }
    public String getAddress() { return address; }
    public String getDescription() { return description; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getStatus() { return status; }
    public BigDecimal getPriceFrom() { return priceFrom; }
    public BigDecimal getPriceTo() { return priceTo; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
