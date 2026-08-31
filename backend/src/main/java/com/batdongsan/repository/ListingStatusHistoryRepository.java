package com.batdongsan.repository;
import com.batdongsan.entity.ListingStatusHistory;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ListingStatusHistoryRepository extends JpaRepository<ListingStatusHistory, Long> {
    @EntityGraph(attributePaths = {"changedBy"})
    List<ListingStatusHistory> findByListingIdOrderByCreatedAtAscIdAsc(Long listingId);
}
