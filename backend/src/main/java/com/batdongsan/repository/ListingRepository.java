package com.batdongsan.repository;

import com.batdongsan.entity.Listing;
import com.batdongsan.entity.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

public interface ListingRepository extends JpaRepository<Listing, Long>, JpaSpecificationExecutor<Listing> {
    @Override
    @EntityGraph(attributePaths={"user","category","district","district.province","ward","project"})
    Page<Listing> findAll(Specification<Listing> specification, Pageable pageable);

    java.util.Optional<Listing> findByIdAndStatus(Long id, ListingStatus status);

    @EntityGraph(attributePaths={"user","category","district","district.province","ward","project","images"})
    java.util.Optional<Listing> findByPublicCodeAndStatus(String publicCode, ListingStatus status);

    java.util.List<Listing> findByUserIdAndStatus(Long userId, ListingStatus status);
    Page<Listing> findByUserId(Long userId, Pageable pageable);
    Page<Listing> findByStatus(ListingStatus status, Pageable pageable);
    java.util.List<Listing> findByStatusAndExpiresAtBefore(ListingStatus status, LocalDateTime time);
}
