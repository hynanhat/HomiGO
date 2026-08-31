package com.batdongsan.repository;

import com.batdongsan.entity.AdministrativeCatalogStatus;
import com.batdongsan.entity.AdministrativeDatasetRelease;
import com.batdongsan.entity.AdministrativeProvince;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdministrativeProvinceRepository extends JpaRepository<AdministrativeProvince, Long> {
    Optional<AdministrativeProvince> findByDatasetReleaseAndOfficialCode(
            AdministrativeDatasetRelease datasetRelease, String officialCode);

    Optional<AdministrativeProvince> findByDatasetReleaseAndOfficialCodeAndCatalogStatus(
            AdministrativeDatasetRelease datasetRelease,
            String officialCode,
            AdministrativeCatalogStatus catalogStatus);

    Page<AdministrativeProvince> findByDatasetReleaseAndCatalogStatus(
            AdministrativeDatasetRelease datasetRelease,
            AdministrativeCatalogStatus catalogStatus,
            Pageable pageable);

    List<AdministrativeProvince> findAllByDatasetRelease(AdministrativeDatasetRelease datasetRelease);
    long countByDatasetRelease(AdministrativeDatasetRelease datasetRelease);
}
