package com.batdongsan.repository;

import com.batdongsan.entity.AdministrativeDatasetRelease;
import com.batdongsan.entity.AdministrativeDatasetStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdministrativeDatasetReleaseRepository extends JpaRepository<AdministrativeDatasetRelease, Long> {
    Optional<AdministrativeDatasetRelease> findByDatasetVersion(String datasetVersion);
    Page<AdministrativeDatasetRelease> findByStatus(AdministrativeDatasetStatus status, Pageable pageable);
}
