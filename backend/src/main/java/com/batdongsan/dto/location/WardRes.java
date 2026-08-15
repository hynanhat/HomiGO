package com.batdongsan.dto.location;

import com.batdongsan.entity.Ward;

public class WardRes {
    private final Long id;
    private final Long districtId;
    private final String name;
    private final String code;

    public WardRes(Ward ward) {
        id = ward.getId();
        districtId = ward.getDistrict().getId();
        name = ward.getName();
        code = ward.getCode();
    }

    public Long getId() { return id; }
    public Long getDistrictId() { return districtId; }
    public String getName() { return name; }
    public String getCode() { return code; }
}
