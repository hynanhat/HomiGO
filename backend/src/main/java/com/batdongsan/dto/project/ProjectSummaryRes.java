package com.batdongsan.dto.project;

import com.batdongsan.entity.Project;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProjectSummaryRes {
    private final Long id;
    private final String name;
    private final String slug;
    private final String investor;
    private final Long districtId;
    private final String districtName;
    private final Long wardId;
    private final String wardName;
    private final String address;
    private final String status;
    private final BigDecimal priceFrom;
    private final BigDecimal priceTo;
    private final LocalDateTime updatedAt;

    public ProjectSummaryRes(Project project) {
        id = project.getId();
        name = project.getName();
        slug = project.getSlug();
        investor = project.getInvestor();
        districtId = project.getDistrict().getId();
        districtName = project.getDistrict().getName();
        wardId = project.getWard() == null ? null : project.getWard().getId();
        wardName = project.getWard() == null ? null : project.getWard().getName();
        address = project.getAddress();
        status = project.getStatus();
        priceFrom = project.getPriceFrom();
        priceTo = project.getPriceTo();
        updatedAt = project.getUpdatedAt();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getInvestor() { return investor; }
    public Long getDistrictId() { return districtId; }
    public String getDistrictName() { return districtName; }
    public Long getWardId() { return wardId; }
    public String getWardName() { return wardName; }
    public String getAddress() { return address; }
    public String getStatus() { return status; }
    public BigDecimal getPriceFrom() { return priceFrom; }
    public BigDecimal getPriceTo() { return priceTo; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
