package com.batdongsan.repository;

import com.batdongsan.entity.SavedListing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SavedListingRepository extends JpaRepository<SavedListing, Long> {
    List<SavedListing> findByUserId(Long userId);
    void deleteByUserIdAndListingId(Long userId, Long listingId);
}
