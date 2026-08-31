package com.batdongsan.repository;

import com.batdongsan.entity.ListingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ListingImageRepository extends JpaRepository<ListingImage, Long> {
    long countByListingId(Long listingId);
    java.util.Optional<ListingImage> findByIdAndListingId(Long id, Long listingId);
    java.util.Optional<ListingImage> findByListingIdAndClientUploadId(Long listingId, String clientUploadId);

    @Query("select coalesce(max(image.sortOrder), -1) from ListingImage image where image.listing.id = :listingId")
    int findMaxSortOrderByListingId(@Param("listingId") Long listingId);
}
