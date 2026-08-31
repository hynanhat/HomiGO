package com.batdongsan.dto.location;

import com.batdongsan.entity.AdministrativeProvince;
import java.time.LocalDate;

public record AdministrativeProvinceRes(
        String code,
        String name,
        String type,
        boolean active,
        LocalDate effectiveFrom,
        String sourceVersion) {
    public static AdministrativeProvinceRes from(AdministrativeProvince province) {
        return new AdministrativeProvinceRes(
                province.getOfficialCode(),
                province.getOfficialName(),
                province.getUnitType().name(),
                province.getCatalogStatus().name().equals("ACTIVE"),
                province.getEffectiveFrom(),
                province.getDatasetRelease().getDatasetVersion());
    }
}
