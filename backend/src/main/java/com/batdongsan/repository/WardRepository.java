package com.batdongsan.repository;
import com.batdongsan.entity.Ward;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
public interface WardRepository extends JpaRepository<Ward, Long> {
    @EntityGraph(attributePaths = "district")
    Page<Ward> findByDistrictId(Long districtId, Pageable pageable);
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Long id);
}
