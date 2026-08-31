package com.batdongsan.support;

import com.batdongsan.entity.*;
import com.batdongsan.repository.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class CurrentLocationTestData {
    private CurrentLocationTestData() {}

    public static Address seed(
            String version,
            AdministrativeDatasetReleaseRepository releases,
            AdministrativeCatalogStateRepository catalogStates,
            AdministrativeProvinceRepository provinces,
            CommuneUnitRepository communes) {
        AdministrativeDatasetRelease release = new AdministrativeDatasetRelease();
        release.setDatasetVersion(version);
        release.setAuthority("Test authority");
        release.setDocumentNumber("TEST");
        release.setEffectiveDate(LocalDate.of(2025, 7, 1));
        release.setRetrievedAt(LocalDateTime.of(2025, 7, 1, 0, 0));
        release.setSourceUrlsJson("[]");
        release.setAttribution("Controlled test catalog");
        release.setRawSha256("a".repeat(64));
        release.setNormalizedSha256("b".repeat(64));
        release.setTransformVersion("test-v1");
        release.setExpectedProvinceCount(1);
        release.setExpectedCommuneCount(1);
        release.setActualProvinceCount(1);
        release.setActualCommuneCount(1);
        release.setStatus(AdministrativeDatasetStatus.ACTIVE);
        release = releases.save(release);

        AdministrativeProvince province = province(1L, "79", "Thành phố Hồ Chí Minh");
        province.setId(null);
        province.setDatasetRelease(release);
        province = provinces.save(province);

        CommuneUnit commune = commune(1L, "26734", "Phường Sài Gòn", province);
        commune.setId(null);
        commune.setDatasetRelease(release);
        commune = communes.save(commune);

        AdministrativeCatalogState state = catalogStates.findById((byte) 1)
                .orElseGet(AdministrativeCatalogState::new);
        state.setSingletonKey((byte) 1);
        state.setActiveRelease(release);
        catalogStates.save(state);
        return new Address(province, commune);
    }

    public static AdministrativeProvince province(Long id, String code, String name) {
        AdministrativeProvince province = new AdministrativeProvince();
        province.setId(id);
        province.setOfficialCode(code);
        province.setOfficialName(name);
        province.setUnitType(AdministrativeProvinceType.CENTRAL_MUNICIPALITY);
        province.setCatalogStatus(AdministrativeCatalogStatus.ACTIVE);
        province.setEffectiveFrom(LocalDate.of(2025, 7, 1));
        return province;
    }

    public static CommuneUnit commune(
            Long id, String code, String name, AdministrativeProvince province) {
        CommuneUnit commune = new CommuneUnit();
        commune.setId(id);
        commune.setAdministrativeProvince(province);
        commune.setOfficialCode(code);
        commune.setOfficialName(name);
        commune.setUnitType(CommuneUnitType.WARD);
        commune.setCatalogStatus(AdministrativeCatalogStatus.ACTIVE);
        commune.setEffectiveFrom(LocalDate.of(2025, 7, 1));
        return commune;
    }

    public record Address(AdministrativeProvince province, CommuneUnit commune) {}
}
