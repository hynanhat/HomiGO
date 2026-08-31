package com.batdongsan.repository;

import com.batdongsan.entity.SavedListing;
import com.batdongsan.entity.ListingStatus;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SavedListingRepository extends JpaRepository<SavedListing, Long> {
    @EntityGraph(attributePaths = {"listing", "listing.user", "listing.category",
            "listing.administrativeProvince", "listing.communeUnit", "listing.project"})
    @Query("""
            select saved from SavedListing saved
            where saved.user.id = :userId
              and saved.listing.status = :status
              and (saved.listing.expiresAt is null or saved.listing.expiresAt > :now)
            """)
    Page<SavedListing> findPublicByUserId(
            @Param("userId") Long userId,
            @Param("status") ListingStatus status,
            @Param("now") LocalDateTime now,
            Pageable pageable);
    boolean existsByUserIdAndListingId(Long userId, Long listingId);
    void deleteByUserIdAndListingId(Long userId, Long listingId);
}
