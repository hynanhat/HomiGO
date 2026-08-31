package com.batdongsan.dto.location;

import com.batdongsan.entity.CommuneUnit;
import java.time.LocalDate;

public record CommuneUnitRes(
        String code,
        String provinceCode,
        String name,
        String type,
        boolean active,
        LocalDate effectiveFrom,
        String sourceVersion) {
    public static CommuneUnitRes from(CommuneUnit unit) {
        return new CommuneUnitRes(
                unit.getOfficialCode(),
                unit.getAdministrativeProvince().getOfficialCode(),
                unit.getOfficialName(),
                unit.getUnitType().name(),
                unit.getCatalogStatus().name().equals("ACTIVE"),
                unit.getEffectiveFrom(),
                unit.getDatasetRelease().getDatasetVersion());
    }
}
