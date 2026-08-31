package com.batdongsan.repository;

import com.batdongsan.entity.SavedListing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

public interface SavedListingRepository extends JpaRepository<SavedListing, Long> {
    @EntityGraph(attributePaths = {"listing", "listing.user", "listing.category",
            "listing.administrativeProvince", "listing.communeUnit", "listing.project"})
    Page<SavedListing> findByUserId(Long userId, Pageable pageable);
    boolean existsByUserIdAndListingId(Long userId, Long listingId);
    void deleteByUserIdAndListingId(Long userId, Long listingId);
}
