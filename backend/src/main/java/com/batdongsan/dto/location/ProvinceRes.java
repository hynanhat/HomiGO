package com.batdongsan.dto.location;

import com.batdongsan.entity.Province;

public class ProvinceRes {
    private final Long id;
    private final String name;

    public ProvinceRes(Province province) {
        id = province.getId();
        name = province.getName();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
}
