package com.batdongsan.repository;

import com.batdongsan.entity.ListingImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingImageRepository extends JpaRepository<ListingImage, Long> {
    long countByListingId(Long listingId);
    java.util.Optional<ListingImage> findByIdAndListingId(Long id, Long listingId);
}
