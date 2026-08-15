package com.batdongsan.repository;

import com.batdongsan.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {
    @Override
    @EntityGraph(attributePaths = {"district", "district.province", "ward"})
    Page<Project> findAll(Specification<Project> specification, Pageable pageable);

    @EntityGraph(attributePaths = {"district", "district.province", "ward"})
    Optional<Project> findBySlug(String slug);

    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
}
