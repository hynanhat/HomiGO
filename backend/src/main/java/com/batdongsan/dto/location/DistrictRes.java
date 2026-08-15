package com.batdongsan.dto.location;

import com.batdongsan.entity.District;

public class DistrictRes {
    private final Long id;
    private final Long provinceId;
    private final String name;

    public DistrictRes(District district) {
        id = district.getId();
        provinceId = district.getProvince().getId();
        name = district.getName();
    }

    public Long getId() { return id; }
    public Long getProvinceId() { return provinceId; }
    public String getName() { return name; }
}
