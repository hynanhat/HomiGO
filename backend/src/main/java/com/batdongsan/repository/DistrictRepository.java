package com.batdongsan.repository;

import com.batdongsan.entity.District;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

public interface DistrictRepository extends JpaRepository<District, Long> {
    @EntityGraph(attributePaths = "province")
    Page<District> findByProvinceId(Long provinceId, Pageable pageable);
}
