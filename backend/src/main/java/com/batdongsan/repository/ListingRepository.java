package com.batdongsan.repository;

import com.batdongsan.entity.Listing;
import com.batdongsan.entity.ListingStatus;
import com.batdongsan.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ListingRepository extends JpaRepository<Listing, Long>, JpaSpecificationExecutor<Listing> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths={"user"})
    @Query("select listing from Listing listing where listing.id = :id")
    java.util.Optional<Listing> findByIdForUpdate(@Param("id") Long id);

    @EntityGraph(attributePaths={"user","category","administrativeProvince","communeUnit","project","images"})
    @Query("select distinct listing from Listing listing where listing.id = :id")
    Optional<Listing> findAdminDetailById(@Param("id") Long id);

    @Override
    @EntityGraph(attributePaths={"user","category","administrativeProvince","communeUnit","project"})
    Page<Listing> findAll(Specification<Listing> specification, Pageable pageable);

    @EntityGraph(attributePaths={"user","category","administrativeProvince","communeUnit","project","images"})
    java.util.Optional<Listing> findByIdAndStatus(Long id, ListingStatus status);

    @EntityGraph(attributePaths={"user","category","administrativeProvince","communeUnit","project","images"})
    java.util.Optional<Listing> findByPublicCodeAndStatus(String publicCode, ListingStatus status);

    @EntityGraph(attributePaths={"user"})
    java.util.List<Listing> findByUserIdAndStatus(Long userId, ListingStatus status);
    @EntityGraph(attributePaths={"user","category","administrativeProvince","communeUnit","project"})
    Page<Listing> findByUserId(Long userId, Pageable pageable);
    @EntityGraph(attributePaths={"user"})
    Page<Listing> findByStatus(ListingStatus status, Pageable pageable);
    @EntityGraph(attributePaths={"user"})
    java.util.List<Listing> findByStatusAndExpiresAtBefore(ListingStatus status, LocalDateTime time);

    @EntityGraph(attributePaths={"user","category","administrativeProvince","communeUnit","project","images"})
    @Query("""
            select distinct candidate
            from Listing candidate
            join candidate.category category
            join candidate.administrativeProvince province
            join candidate.communeUnit commune
            where candidate.status = :status
              and candidate.id <> :targetId
              and (candidate.expiresAt is null or candidate.expiresAt > :now)
              and (
                    candidate.category.id = :categoryId
                 or category.transactionType = :transactionType
                 or commune.id = :communeUnitId
                 or province.id = :administrativeProvinceId
                 or (:projectId is not null and candidate.project.id = :projectId)
              )
            order by candidate.publishedAt desc, candidate.id desc
            """)
    List<Listing> findRecommendationCandidates(
            @Param("status") ListingStatus status,
            @Param("targetId") Long targetId,
            @Param("categoryId") Long categoryId,
            @Param("transactionType") TransactionType transactionType,
            @Param("communeUnitId") Long communeUnitId,
            @Param("administrativeProvinceId") Long administrativeProvinceId,
            @Param("projectId") Long projectId,
            @Param("now") LocalDateTime now,
            Pageable pageable);
}
