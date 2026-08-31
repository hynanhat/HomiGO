package com.batdongsan.service;

import com.batdongsan.dto.location.AdministrativeProvinceRes;
import com.batdongsan.dto.location.CommuneUnitRes;
import com.batdongsan.entity.AdministrativeCatalogStatus;
import com.batdongsan.entity.AdministrativeDatasetRelease;
import com.batdongsan.entity.AdministrativeProvince;
import com.batdongsan.entity.CommuneUnit;
import com.batdongsan.exception.ApiException;
import com.batdongsan.exception.ErrorCode;
import com.batdongsan.repository.AdministrativeCatalogStateRepository;
import com.batdongsan.repository.AdministrativeProvinceRepository;
import com.batdongsan.repository.CommuneUnitRepository;
import java.util.Objects;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LocationService {
    private final AdministrativeCatalogStateRepository catalogState;
    private final AdministrativeProvinceRepository provinces;
    private final CommuneUnitRepository communeUnits;

    public LocationService(
            AdministrativeCatalogStateRepository catalogState,
            AdministrativeProvinceRepository provinces,
            CommuneUnitRepository communeUnits) {
        this.catalogState = catalogState;
        this.provinces = provinces;
        this.communeUnits = communeUnits;
    }

    @Transactional(readOnly = true)
    public Page<AdministrativeProvinceRes> getActiveProvinces(Pageable pageable) {
        return provinces.findByDatasetReleaseAndCatalogStatus(
                activeRelease(), AdministrativeCatalogStatus.ACTIVE, pageable)
                .map(AdministrativeProvinceRes::from);
    }

    @Transactional(readOnly = true)
    public Page<CommuneUnitRes> getActiveCommuneUnits(String provinceCode, Pageable pageable) {
        AdministrativeDatasetRelease release = activeRelease();
        AdministrativeProvince province = activeProvince(release, provinceCode);
        return communeUnits.findByDatasetReleaseAndAdministrativeProvinceAndCatalogStatus(
                release, province, AdministrativeCatalogStatus.ACTIVE, pageable)
                .map(CommuneUnitRes::from);
    }

    @Transactional(readOnly = true)
    public CurrentAddress resolveActiveAddress(String provinceCode, String communeCode) {
        AdministrativeDatasetRelease release = activeRelease();
        AdministrativeProvince province = activeProvince(release, provinceCode);
        CommuneUnit commune = communeUnits.findByDatasetReleaseAndOfficialCodeAndCatalogStatus(
                        release, communeCode, AdministrativeCatalogStatus.ACTIVE)
                .orElseGet(() -> {
                    if (communeUnits.findByDatasetReleaseAndOfficialCode(release, communeCode).isPresent()) {
                        throw new ApiException(ErrorCode.LOCATION_INACTIVE);
                    }
                    throw new ApiException(ErrorCode.LOCATION_NOT_FOUND);
                });
        if (!Objects.equals(commune.getAdministrativeProvince().getId(), province.getId())) {
            throw new ApiException(ErrorCode.LOCATION_RELATION_MISMATCH);
        }
        return new CurrentAddress(province, commune);
    }

    private AdministrativeDatasetRelease activeRelease() {
        return catalogState.findById((byte) 1)
                .map(state -> state.getActiveRelease())
                .filter(Objects::nonNull)
                .orElseThrow(() -> new ApiException(
                        ErrorCode.LOCATION_NOT_FOUND,
                        "Danh mục địa chỉ hiện hành chưa được kích hoạt."));
    }

    private AdministrativeProvince activeProvince(
            AdministrativeDatasetRelease release, String provinceCode) {
        return provinces.findByDatasetReleaseAndOfficialCodeAndCatalogStatus(
                        release, provinceCode, AdministrativeCatalogStatus.ACTIVE)
                .orElseGet(() -> {
                    if (provinces.findByDatasetReleaseAndOfficialCode(release, provinceCode).isPresent()) {
                        throw new ApiException(ErrorCode.LOCATION_INACTIVE);
                    }
                    throw new ApiException(ErrorCode.LOCATION_NOT_FOUND);
                });
    }

    public record CurrentAddress(AdministrativeProvince province, CommuneUnit communeUnit) {}
}
