package com.batdongsan.repository;

import com.batdongsan.entity.AdministrativeCatalogStatus;
import com.batdongsan.entity.AdministrativeDatasetRelease;
import com.batdongsan.entity.AdministrativeProvince;
import com.batdongsan.entity.CommuneUnit;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommuneUnitRepository extends JpaRepository<CommuneUnit, Long> {
    Optional<CommuneUnit> findByDatasetReleaseAndOfficialCode(
            AdministrativeDatasetRelease datasetRelease, String officialCode);

    Optional<CommuneUnit> findByDatasetReleaseAndOfficialCodeAndCatalogStatus(
            AdministrativeDatasetRelease datasetRelease,
            String officialCode,
            AdministrativeCatalogStatus catalogStatus);

    Optional<CommuneUnit> findByDatasetReleaseAndAdministrativeProvinceAndOfficialCodeAndCatalogStatus(
            AdministrativeDatasetRelease datasetRelease,
            AdministrativeProvince administrativeProvince,
            String officialCode,
            AdministrativeCatalogStatus catalogStatus);

    Page<CommuneUnit> findByDatasetReleaseAndAdministrativeProvinceAndCatalogStatus(
            AdministrativeDatasetRelease datasetRelease,
            AdministrativeProvince administrativeProvince,
            AdministrativeCatalogStatus catalogStatus,
            Pageable pageable);

    List<CommuneUnit> findAllByDatasetRelease(AdministrativeDatasetRelease datasetRelease);
    long countByDatasetRelease(AdministrativeDatasetRelease datasetRelease);
}
