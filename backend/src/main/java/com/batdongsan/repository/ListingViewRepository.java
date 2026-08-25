package com.batdongsan.repository;

import com.batdongsan.entity.ListingView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ListingViewRepository extends JpaRepository<ListingView, Long> {
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            INSERT IGNORE INTO listing_views (listing_id, viewer_hash, viewed_on, created_at)
            VALUES (:listingId, :viewerHash, :viewedOn, :createdAt)
            """, nativeQuery = true)
    int insertIgnore(@Param("listingId") Long listingId,
                     @Param("viewerHash") String viewerHash,
                     @Param("viewedOn") LocalDate viewedOn,
                     @Param("createdAt") LocalDateTime createdAt);

    long countByListingId(Long listingId);
    long countByListingIdAndViewedOn(Long listingId, LocalDate viewedOn);
    long countByListingIdAndViewedOnBetween(Long listingId, LocalDate start, LocalDate end);

    @Query("""
            select view.viewedOn as viewedOn, count(view.id) as viewCount
              from ListingView view
             where view.listing.id = :listingId
               and view.viewedOn between :start and :end
             group by view.viewedOn
             order by view.viewedOn
            """)
    List<DailyViewCount> countDaily(@Param("listingId") Long listingId,
                                    @Param("start") LocalDate start,
                                    @Param("end") LocalDate end);

    interface DailyViewCount {
        LocalDate getViewedOn();
        long getViewCount();
    }
}
